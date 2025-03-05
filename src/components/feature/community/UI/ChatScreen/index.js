import {useMutation} from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import moment from 'moment';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import AutoHeightImage from 'react-native-auto-height-image';
import {Swipeable} from 'react-native-gesture-handler';
import Hyperlink from 'react-native-hyperlink';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import {
  deleteMessage,
  fetchCommunityUsers,
  fetchMessages,
  gotoMessage,
} from '../../../../../api/community';
import useMqtt from '../../../../../hooks/useMqtt';
import appImages from '../../../../../resource/images';
import {screenHeight, screenWidth} from '../../../../../utils/common';
import Avatar from '../../../../common/Avatar';
import CText from '../../../../common/core/Text';
import CView from '../../../../common/core/View';
import {Colors} from '../../../../common/core/colors';
import MessageContextMenu from '../MessageContextMenu';
import getStyles from './styles';
import {useTheme} from '@react-navigation/native';

const viewabilityConfig = {
  itemVisiblePercentThreshold: 50,
};

const chatBoxHeight = 48;

const limit = 20;

const replyChatHeight = 50;

const MessageItem = React.memo(
  React.forwardRef(
    (
      {
        item,
        isSentByCurrentUser,
        isFocused,
        handleReply,
        renderActions,
        renderMessageType,
        handleLongPress,
        styles,
      },
      ref,
    ) => {
      if (item.type === 'dateMarker') {
        return (
          <CText
            style={{
              alignSelf: 'center',
              fontSize: 12,
              fontWeight: '500',
              color: '#93989E',
            }}>
            {item.label}
          </CText>
        );
      }

      return (
        <Swipeable
          friction={2}
          rightThreshold={2}
          leftThreshold={100}
          overshootRight={false}
          overshootLeft={false}
          onSwipeableOpen={(_, swipeable) => handleReply(_, swipeable, item)}
          renderLeftActions={(progress, dragX) =>
            !isSentByCurrentUser &&
            renderActions(progress, dragX, item, isSentByCurrentUser)
          }
          renderRightActions={(progress, dragX) =>
            isSentByCurrentUser &&
            renderActions(progress, dragX, item, isSentByCurrentUser)
          }>
          <CView
            style={[
              styles.chatWrapper,
              isSentByCurrentUser ? styles.sentMessage : styles.receivedMessage,
            ]}>
            {!isSentByCurrentUser ? (
              <CView
                row
                style={[styles.userStatsWrapper, styles.receivedMessage]}>
                <Avatar
                  name={item?.user?.name || 'User'}
                  imageUrl={item?.user?.profilePic}
                  customStyles={{
                    avatarContainer: {
                      width: 22,
                      height: 22,
                      backgroundColor: item?.user?.profileBgColor,
                    },
                  }}
                />
                <CText style={styles.userNameSent}>{item?.user?.name}</CText>
              </CView>
            ) : (
              <CView row style={[styles.userStatsWrapper, styles.sentMessage]}>
                <CText style={styles.userNameReceived}>
                  {item?.user?.name}
                </CText>
                <Avatar
                  name={item?.user?.name || 'User'}
                  imageUrl={item?.user?.profilePic}
                  customStyles={{
                    avatarContainer: {
                      width: 22,
                      height: 22,
                      backgroundColor: item?.user?.profileBgColor,
                    },
                  }}
                />
              </CView>
            )}

            <TouchableWithoutFeedback
              onLongPress={e => handleLongPress(item, ref)}>
              <View
                ref={ref}
                style={[
                  styles.msgWrapper,
                  isSentByCurrentUser
                    ? styles.ownSendMessage
                    : styles.receivedMessage,
                  isFocused ? styles.focusedMessage : {},
                ]}>
                {renderMessageType(item)}
              </View>
            </TouchableWithoutFeedback>

            <CView
              style={[
                styles.msgTimeWrapper,
                isSentByCurrentUser
                  ? styles.sentMessage
                  : styles.receivedMessage,
              ]}>
              <CText style={styles.msgTimeText}>
                {moment(item?.createdAt).format('hh:mm a')}
              </CText>
            </CView>
          </CView>
        </Swipeable>
      );
    },
  ),
);

const ChatScreen = ({channelId, communityId, theme}) => {
  const [lastScrollPos, setLastScrollPos] = useState(0);

  const [cursorType, setCursorType] = useState(null);

  const [visibleItem, setVisibleItem] = useState({
    first: {},
    last: {},
  });

  const [pagination, setPagination] = useState({
    prevPageMsg: {fromDate: null},
    currentPageMsg: {fromDate: null},
  });

  const [messageInfo, setMessageInfo] = useState({
    unreadMessageCount: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    totalResults: 0,
  });

  const inputRef = useRef(null);
  const {mode} = useTheme();

  const styles = getStyles(mode);
  const [messages, setMessages] = useState([]);

  const [latestMessages, setLatestMessages] = useState([]);

  const [latestPagination, setLatestPagination] = useState({
    prevPageMsg: {fromDate: null},
    currentPageMsg: {fromDate: null},
  });

  const [unReadMessages, setUnReadMessages] = useState([]);

  const [userMessage, setUserMessage] = useState('');

  const [replyConfig, setReplyConfig] = useState({
    status: false,
    data: {},
  });

  const [fetchNextEndReached, setFetchEndReached] = useState(false);

  const [focusedMessageId, setFocusedMessageId] = useState(null);

  const {selectedCommunity} = useSelector(state => state.community);
  const {accessToken} = useSelector(state => state.auth);
  const {userId, roles} = useSelector(state => state.user);

  const {subscribeToTopic, unsubscribeFromTopic, publishMessage} = useMqtt();

  const flatListRef = useRef(null);

  const menuContextRefs = useRef({});

  const [isMenuContextOpen, setIsMenuContextOpen] = useState({
    status: false,
    id: '',
    data: {},
  });

  const [contextMenuPos, setContextMenuPos] = useState({x: 0, y: 0});

  const [isAtBottom, setIsAtBottom] = useState(true);

  const [userList, setUserList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const isReadOnlyChannel = useMemo(() => {
    const channel = selectedCommunity?.community_channel.find(
      channel => channel?._id == channelId,
    );
    return channel?.readOnly;
  }, [channelId, selectedCommunity?.community_channel]);

  const keyExtractor = useCallback(item => `message_${item._id}`, []);

  const userListKeyExtractor = useCallback(item => `user${item._id}`, []);

  const maintainPosition = useMemo(
    () => !!latestMessages.length && !!messages.length,
    [latestMessages.length, messages.length],
  );
  const insertDateMarkers = useCallback(allMessages => {
    const filteredMessages = allMessages.filter(
      msg => msg.type !== 'dateMarker',
    );

    const markedMessages = [];
    let nextDate = null;

    for (let i = filteredMessages.length - 1; i >= 0; i--) {
      const currentMessage = allMessages[i];
      const messageDate = moment(currentMessage.createdAt).startOf('day');
      const dateMarkerId = `dateMarker-${messageDate.format('YYYY-MM-DD')}`;

      if (!nextDate || !messageDate.isSame(nextDate, 'day')) {
        let label;
        if (messageDate.isSame(moment(), 'day')) {
          label = 'Today';
        } else if (messageDate.isSame(moment().subtract(1, 'days'), 'day')) {
          label = 'Yesterday';
        } else {
          label = messageDate.format('MMMM DD, YYYY');
        }
        markedMessages.push({
          type: 'dateMarker',
          label: label,
          _id: dateMarkerId,
        });
        nextDate = messageDate;
      }

      markedMessages.push(currentMessage);
    }

    return markedMessages.reverse();
  }, []);

  const computedMessages = useMemo(
    () => insertDateMarkers(messages),
    [messages, insertDateMarkers],
  );
  const {mutate: fetchMessagesAPI, isLoading: isFetchingMessages} = useMutation(
    data => fetchMessages(data),
    {
      onSuccess: ({data}) => {
        const {result, ...info} = data;

        if (result.length) {
          const existingMessageIds = new Set(messages.map(msg => msg._id));

          const newMessages = result.filter(
            msg => !existingMessageIds.has(msg._id),
          );

          if (!pagination.currentPageMsg.fromDate) {
            setPagination(prev => ({
              ...prev,
              currentPageMsg: {fromDate: result[0]?.createdAt},
              prevPageMsg: {
                fromDate: result[result.length - 1]?.createdAt,
              },
            }));
          }

          setPagination(prev => ({
            ...prev,
            prevPageMsg: {
              fromDate: result[result.length - 1]?.createdAt,
            },
          }));

          setMessages(prev => [...prev, ...newMessages]); // without markers

          setMessageInfo(info);
        }
      },
    },
  );

  const {mutate: gotoMessageApi} = useMutation(data => gotoMessage(data), {
    onSuccess: ({data}) => {
      const {result, ...info} = data;

      if (result.length) {
        const existingMessageIds = new Set(messages.map(msg => msg._id));

        const newMessages = result.filter(
          msg => !existingMessageIds.has(msg._id),
        );

        if (!latestMessages.length) {
          setLatestMessages(messages);
          setLatestPagination(pagination);
        }

        setPagination({
          currentPageMsg: {fromDate: newMessages[0]?.createdAt},
          prevPageMsg: {
            fromDate: result[result.length - 1]?.createdAt,
          },
        });

        setMessages(newMessages);

        const parentIndex = newMessages.findIndex(
          message => message._id === focusedMessageId,
        );

        if (parentIndex !== -1) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              animated: true,
              index: parentIndex,
              // viewPosition: 0
            });
          }, 200);
        }
      }
    },
  });

  const {mutate: fetchNextMessagesAPI, isLoading: isFetchingNextMessages} =
    useMutation(data => fetchMessages(data), {
      onSuccess: ({data}) => {
        const {result, ...info} = data;

        if (result.length) {
          const existingMessageIds = new Set(messages.map(msg => msg._id));

          const newMessages = result.filter(
            msg => !existingMessageIds.has(msg._id),
          );

          setPagination(prev => ({
            ...prev,
            currentPageMsg: {
              fromDate: result[0]?.createdAt,
            },
          }));

          setMessages(prev => [...newMessages, ...prev]);

          setMessageInfo(info);

          if (result.length < limit) {
            setFetchEndReached(true);
          }
        } else {
          setFetchEndReached(true);
        }
      },
    });

  const {mutate: deleteMessageApi} = useMutation(
    messageId => deleteMessage(messageId),
    {
      onSuccess: ({data}) => {},
    },
  );

  const {mutate: fetchCommunityUsersAPI} = useMutation(
    data => fetchCommunityUsers(data),
    {
      onSuccess: ({data}) => {
        setUserList(data?.data?.users);
      },
    },
  );

  const debouncedFetchCommunityUsersAPI = useCallback(
    debounce(data => {
      fetchCommunityUsersAPI(data);
    }, 300),
    [fetchCommunityUsersAPI],
  );

  useEffect(() => {
    if (fetchNextEndReached) {
      setMessages(messages.slice(0, limit + 1));

      setPagination({
        currentPageMsg: {fromDate: messages[0]?.createdAt},
        prevPageMsg: {
          fromDate: messages[limit]?.createdAt,
        },
      });
      setLatestMessages([]);
      setLatestPagination({
        prevPageMsg: {fromDate: null},
        currentPageMsg: {fromDate: null},
      });
      setIsAtBottom(true);
      setFetchEndReached(false);
    }
  }, [fetchNextEndReached, messages]);

  useEffect(() => {
    if (messages.length == 0) {
      fetchMessagesAPI({
        channelId,
      });
    }
  }, [channelId, fetchMessagesAPI, messages.length]);

  const handleFetchLiveMessage = useCallback(
    data => {
      const {result} = JSON.parse(data);

      const existingUnReadMessageIds = new Set(
        unReadMessages.map(msg => msg._id),
      );

      const newMessages = result.filter(
        msg => !existingUnReadMessageIds.has(msg._id),
      );

      if (isAtBottom) {
        setMessages(prev => [...newMessages, ...prev]);

        setPagination(prev => ({
          ...prev,
          currentPageMsg: {fromDate: newMessages[0]?.createdAt},
        }));
        flatListRef.current?.scrollToIndex({animated: true, index: 0});
      } else {
        setUnReadMessages(prev => [...newMessages, ...prev]);
      }
    },
    [isAtBottom, unReadMessages],
  );

  const handleDeleteLiveMessage = useCallback(
    data => {
      const {result} = JSON.parse(data);
      const messageId = result[0]?._id;

      const updatedMessages = messages.filter(
        message => message._id !== messageId,
      );

      setMessages(updatedMessages);

      if (menuContextRefs.current[messageId]) {
        delete menuContextRefs.current[messageId];
      }
    },
    [messages],
  );

  useEffect(() => {
    if (channelId) {
      subscribeToTopic(
        `channelId-production/${channelId}`,
        handleFetchLiveMessage,
      );

      subscribeToTopic(
        `deletedMessage-production/${channelId}`,
        handleDeleteLiveMessage,
      );
    }
  }, [
    channelId,
    handleDeleteLiveMessage,
    handleFetchLiveMessage,
    subscribeToTopic,
  ]);

  const handleScroll = useCallback(
    event => {
      const currentScrollPos = event.nativeEvent?.contentOffset?.y;
      if (currentScrollPos > lastScrollPos) {
        setCursorType('prev');
      } else {
        // Scrolling downwards
        setCursorType('next');
      }
      setLastScrollPos(currentScrollPos);

      const y = event.nativeEvent?.contentOffset?.y;
      const listHeight = event.nativeEvent?.layoutMeasurement?.height;

      if (y < listHeight - 50) {
        if (!latestMessages.length) {
          setIsAtBottom(true);
          // case where latest messages are show and not at previous messages
          if (unReadMessages.length) {
            setMessages(prev => [...unReadMessages, ...prev]);
            setPagination(prev => ({
              ...prev,
              currentPageMsg: {fromDate: unReadMessages[0]?.createdAt},
            }));
            setUnReadMessages([]);
          }
        } else {
          handleStartReached();
        }
      } else {
        setIsAtBottom(false);
      }

      if (y <= 0 && !unReadMessages.length) {
      }
    },
    [handleStartReached, lastScrollPos, latestMessages.length, unReadMessages],
  );

  const handleViewableItemsChanged = useCallback(({viewableItems, cha}) => {
    if (viewableItems.length > 0) {
      setVisibleItem({
        first: viewableItems[0]?.item,
        last: viewableItems[viewableItems.length - 1]?.item,
      });
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: viewabilityConfig,
      onViewableItemsChanged: handleViewableItemsChanged,
    },
  ]);

  const handleEndReached = useCallback(() => {
    const prevPageDate = moment(pagination?.prevPageMsg?.fromDate);
    const lastVisibleDate = moment(visibleItem?.last?.createdAt);
    if (
      cursorType === 'prev' &&
      visibleItem?.last &&
      lastVisibleDate.isAfter(prevPageDate) &&
      !isFetchingMessages
    ) {
      fetchMessagesAPI({
        channelId,
        fromDate: pagination.prevPageMsg?.fromDate,
        cursorType: 'prev',
      });
    }
  }, [
    channelId,
    cursorType,
    fetchMessagesAPI,
    isFetchingMessages,
    pagination.prevPageMsg?.fromDate,
    visibleItem?.last,
  ]);

  const handleStartReached = useCallback(() => {
    const currentPageDate = moment(pagination?.currentPageMsg?.fromDate);
    const firstVisibleDate = moment(visibleItem?.first?.createdAt);
    // console.log('firstVisibleDate:', firstVisibleDate.format('h-m-s-a'))

    // console.log('currentPageDate:', currentPageDate.format('h-m-s-a'))

    // console.log(
    //   '===>',
    //   cursorType === 'next',
    //   firstVisibleDate.isSameOrAfter(currentPageDate)
    // )
    if (
      cursorType === 'next' &&
      visibleItem?.first &&
      firstVisibleDate.isSameOrAfter(currentPageDate) &&
      !isFetchingNextMessages
    ) {
      fetchNextMessagesAPI({
        channelId,
        fromDate: pagination.currentPageMsg?.fromDate,
        cursorType: 'next',
      });
    }
  }, [
    channelId,
    cursorType,
    fetchNextMessagesAPI,
    isFetchingNextMessages,
    pagination.currentPageMsg?.fromDate,
    visibleItem?.first,
  ]);

  const handleReply = useCallback(
    (swipeDirection, swipeable, item) => {
      swipeable.close();
      if (!isReadOnlyChannel) {
        setReplyConfig({status: true, data: item});
        setTimeout(() => inputRef?.current?.focus(), 200);
      }
    },
    [isReadOnlyChannel],
  );

  const renderActions = useCallback(
    (progress, dragX, message, isSentByCurrentUser) => {
      const scale = isSentByCurrentUser
        ? dragX.interpolate({
            inputRange: [-50, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
          })
        : dragX.interpolate({
            inputRange: [0, 50],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          });

      const opacity = isSentByCurrentUser
        ? dragX.interpolate({
            inputRange: [-50, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
          })
        : dragX.interpolate({
            inputRange: [0, 50],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          });

      return (
        <CView
          style={{
            ...styles.actionWrapperBySender,
            alignItems: isSentByCurrentUser ? 'flex-end' : 'flex-start',
          }}>
          <Animated.View
            style={{
              transform: [{scale}],
              opacity,
              ...styles.actionWrapper,
            }}>
            <CView style={styles.replyBtnWrapper}>
              <Image
                source={appImages.replyMsgIcon}
                style={styles.replyBtnIcon}
              />
            </CView>
          </Animated.View>
        </CView>
      );
    },
    [],
  );

  const scrollToParentMessage = useCallback(
    item => {
      const parentId = item?.parentId?._id;

      const parentIndex = messages.findIndex(
        message => message._id === parentId,
      );

      if (parentIndex !== -1) {
        flatListRef.current?.scrollToIndex({
          animated: true,
          index: parentIndex,
          // viewPosition: 0
        });

        setFocusedMessageId(parentId);
      } else {
        setFocusedMessageId(parentId);

        gotoMessageApi({
          channelId,
          date: item?.parentId?.createdAt,
        });
      }
    },
    [channelId, gotoMessageApi, messages],
  );

  const handleLongPress = useCallback(
    (item, ref) => {
      const isSentByCurrentUser = item.user?._id === userId;

      const isAdmin = roles.includes('admin');

      if (isSentByCurrentUser || isAdmin) {
        ref?.current?.measure((x, y, width, height, pageX, pageY) => {
          setContextMenuPos({x: pageX + width, y: pageY + height});
          setIsMenuContextOpen({
            status: true,
            id: item?._id,
            data: item,
          });
        });
      }
    },
    [roles, userId],
  );

  const handleDeleteMessage = useCallback(
    messageId => {
      deleteMessageApi(messageId);

      handleMenuContextClose();
    },
    [deleteMessageApi, handleMenuContextClose],
  );

  const handleMenuContextClose = useCallback(() => {
    setIsMenuContextOpen({status: false, id: '', data: {}});
  }, []);

  const renderStyledText = useCallback((text, mentions, reply = false) => {
    if (!mentions.length) {
      return (
        <CText style={!reply ? styles.msgText : styles.replyMsgText}>
          {text}
        </CText>
      );
    }
    const textSegments = text.split(' ').map((segment, idx) => {
      if (segment.startsWith('@')) {
        return (
          <CText
            key={idx}
            style={{
              ...(!reply ? styles.msgText : styles.replyMsgText),
              color: '#4D6EE2',
              fontWeight: '500',
            }}>
            {segment}{' '}
          </CText>
        );
      } else {
        return (
          <CText
            key={idx}
            style={!reply ? styles.msgText : styles.replyMsgText}>
            {segment}{' '}
          </CText>
        );
      }
    });

    return (
      <CView row style={{flexWrap: 'wrap', alignItems: 'center'}}>
        {textSegments}
      </CView>
    );
  }, []);

  const renderMessageType = useCallback(
    item => {
      switch (item.type) {
        case 'text':
          return (
            <Hyperlink linkDefault={true} linkStyle={styles.linkStyle}>
              <CView>{renderStyledText(item?.text, item?.mentions)}</CView>
            </Hyperlink>
          );
        case 'reply-text':
          return (
            <CView>
              <TouchableOpacity
                style={styles.replyMsgTextWrapper}
                onPress={() => scrollToParentMessage(item)}>
                <CView style={styles.replyMsgDivider} />
                <CView style={styles.replyMsgSenderWrapper}>
                  <CText
                    style={
                      styles.replyMsgSenderName
                    }>{`Reply To ${item?.parentId?.user?.name}`}</CText>
                  <CText numberOfLines={2} style={styles.replyMsgSenderText}>
                    {item?.parentId?.text}
                  </CText>
                </CView>
              </TouchableOpacity>
              <Hyperlink linkDefault={true} linkStyle={styles.linkStyle}>
                {renderStyledText(item?.text, item?.mentions, true)}
              </Hyperlink>
            </CView>
          );
        case 'image':
          return (
            <AutoHeightImage
              source={{uri: item?.attachments[0]?.url}}
              width={screenWidth * 0.8 - 50}
            />
          );
        case 'reply-image':
          return (
            <CView>
              <TouchableOpacity
                style={styles.replyMsgTextWrapper}
                onPress={() => scrollToParentMessage(item)}>
                <CView style={styles.replyMsgDivider} />
                <CView row style={styles.replyMsgSenderWrapper}>
                  <Image
                    source={{uri: item?.parentId?.attachments[0]?.url}}
                    style={styles.replyImage}
                    resizeMode="cover"
                  />

                  <CText
                    style={
                      styles.replyMsgSenderName
                    }>{`Reply To ${item?.parentId?.user?.name}`}</CText>
                  <CText numberOfLines={2} style={styles.replyMsgSenderText}>
                    {item?.parentId?.text}
                  </CText>
                </CView>
              </TouchableOpacity>
              <Hyperlink linkDefault={true} linkStyle={styles.linkStyle}>
                {renderStyledText(item?.text, item?.mentions, true)}
              </Hyperlink>
            </CView>
          );
        // case 'video':
        //   // Render video component
        //   break
        // case 'poll':
        //   // Render poll component
        //   break
        // case 'reply-text':
        //   // Render reply to text message
        //   break
        // // Add cases for other message types
      }
    },
    [renderStyledText, scrollToParentMessage],
  );

  const renderMessageItem = useCallback(
    ({item}) => {
      const isSentByCurrentUser = item.user?._id === userId;
      const isFocused = item._id === focusedMessageId;

      if (!menuContextRefs.current[item._id]) {
        menuContextRefs.current[item._id] = React.createRef();
      }

      const isMenuVisible =
        isMenuContextOpen.id == item?._id && isMenuContextOpen.status;

      return (
        <>
          <MessageItem
            item={item}
            isSentByCurrentUser={isSentByCurrentUser}
            isFocused={isFocused}
            handleReply={handleReply}
            renderActions={renderActions}
            renderMessageType={renderMessageType}
            handleLongPress={handleLongPress}
            ref={menuContextRefs.current[item._id]}
            styles={styles}
          />
          {isMenuVisible && (
            <MessageContextMenu
              messageId={item?._id}
              isVisible={isMenuVisible}
              onRequestClose={handleMenuContextClose}
              handleDeleteMessage={handleDeleteMessage}
              contextMenuPos={contextMenuPos}
              isSentByCurrentUser={isSentByCurrentUser}
            />
          )}
        </>
      );
    },
    [
      contextMenuPos,
      focusedMessageId,
      handleDeleteMessage,
      handleLongPress,
      handleMenuContextClose,
      handleReply,
      isMenuContextOpen.id,
      isMenuContextOpen.status,
      renderActions,
      renderMessageType,
      userId,
      mode,
    ],
  );

  const handleSubmitMessage = useCallback(() => {
    if (!userMessage.length) {
      return;
    }

    const topic = 'server/production';

    const messageType = 'text';

    let messageObj = {};

    let mentions = [];

    if (selectedUsers.length) {
      const mentionMatches = userMessage.match(/@\w+/g) || [];

      mentions = mentionMatches
        .map(mention => {
          const userName = mention.substring(1); // Remove '@'
          const user = selectedUsers.find(u => u.userName === userName);
          return user ? {userId: user.id} : null;
        })
        .filter(Boolean);
    }

    if (replyConfig.status) {
      messageObj = {
        auth: accessToken,
        channelId,
        parentId: replyConfig?.data?._id,
        sendTime: Date.now().toString(),
        subType: messageType,
        text: userMessage,
        type: `reply-${replyConfig?.data?.type}`,
        mentions,
      };

      setReplyConfig({status: false, data: {}});
    } else {
      messageObj = {
        type: 'text',
        text: userMessage,
        auth: accessToken,
        channelId,
        sendTime: Date.now().toString(),
        mentions,
      };
    }

    flatListRef.current?.scrollToIndex({animated: true, index: 0});

    publishMessage(topic, messageObj);

    setUserMessage('');
    setSelectedUsers([]);
    setUserList([]);
  }, [
    accessToken,
    channelId,
    publishMessage,
    replyConfig?.data?._id,
    replyConfig?.data?.type,
    replyConfig.status,
    selectedUsers,
    userMessage,
    mode,
  ]);

  const handleIndicatorClick = useCallback(() => {
    if (latestMessages.length) {
      setMessages(latestMessages);
      setPagination(latestPagination);
      setLatestMessages([]);
      setLatestPagination({
        prevPageMsg: {fromDate: null},
        currentPageMsg: {fromDate: null},
      });
      flatListRef.current?.scrollToIndex({animated: true, index: 0});
      setIsAtBottom(true);

      return;
    }

    setMessages(prev => [...unReadMessages, ...prev]);
    setPagination(prev => ({
      ...prev,
      currentPageMsg: {fromDate: unReadMessages[0]?.createdAt},
    }));
    setUnReadMessages([]);
    flatListRef.current?.scrollToIndex({animated: true, index: 0});
    setIsAtBottom(true);
  }, [latestMessages, latestPagination, unReadMessages]);

  const handleCloseReplyChat = useCallback(() => {
    setReplyConfig({status: false, data: {}});
  }, []);

  const handleOnScrollToIndexFailed = useCallback(() => {}, []);

  const handleOnScrollEnd = useCallback(() => {
    if (focusedMessageId) {
      setTimeout(() => {
        setFocusedMessageId(null);
      }, 100);
    }
  }, [focusedMessageId]);

  const renderFooterComponent = useCallback(() => {
    return (
      isFetchingMessages &&
      cursorType === 'prev' && (
        <ActivityIndicator
          style={styles.footerIndicator}
          color={Colors.Palette.brandPink}
          size={'large'}
        />
      )
    );
  }, [cursorType, isFetchingMessages]);

  const renderHeaderComponent = useCallback(() => {
    return (
      isFetchingNextMessages &&
      !isAtBottom && (
        <ActivityIndicator
          style={styles.headerIndicator}
          color={Colors.Palette.brandPink}
          size={'large'}
        />
      )
    );
  }, [isAtBottom, isFetchingNextMessages]);

  useEffect(() => {
    return () => {
      unsubscribeFromTopic(`channelId-production/${channelId}`);
      menuContextRefs.current = {};
    };
  }, [channelId, unsubscribeFromTopic]);

  const handleUserMessageChange = useCallback(
    text => {
      setUserMessage(text);

      const match = text.match(/@\w+$/);

      if (match) {
        const userNamePrefix = match[0].substring(1);
        const data = {communityId, userNamePrefix};
        debouncedFetchCommunityUsersAPI(data);
      }
    },
    [communityId, debouncedFetchCommunityUsersAPI],
  );

  const handleUserSelect = useCallback(
    item => {
      if (!selectedUsers.some(user => user.id === item._id)) {
        setSelectedUsers(prev => [
          ...prev,
          {id: item?._id, userName: item?.userName},
        ]);
      }
      const updatedMessage = userMessage.replace(/@\w+$/, `@${item.userName} `);
      setUserMessage(updatedMessage);

      setUserList([]);
    },
    [selectedUsers, userMessage],
  );

  const renderUserLists = useCallback(
    ({item}) => {
      return (
        <TouchableOpacity
          style={styles.userListItemWrapper}
          onPress={() => handleUserSelect(item)}>
          <Avatar
            name={item?.userName || 'User'}
            imageUrl={item?.profileUrl}
            customStyles={{
              avatarContainer: {
                width: 30,
                height: 30,
                backgroundColor: item?.profileBgColor,
              },
            }}
          />
          <CText style={styles.userListAvatar}>
            {`${item?.userName.charAt(0).toUpperCase()}${item?.userName.slice(
              1,
            )}`}
          </CText>
        </TouchableOpacity>
      );
    },
    [handleUserSelect],
  );

  const userListSeparator = useCallback(() => {
    return <CView style={styles.userListSeparator} />;
  }, []);

  return (
    <CView style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={computedMessages}
        renderItem={renderMessageItem}
        keyExtractor={keyExtractor}
        // overScrollMode={'never'}
        inverted
        onEndReachedThreshold={0.5}
        onEndReached={handleEndReached}
        onScroll={handleScroll}
        // onScroll={throttle(handleScroll, 200)}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={handleOnScrollToIndexFailed}
        onMomentumScrollEnd={handleOnScrollEnd}
        ListHeaderComponent={renderHeaderComponent}
        ListFooterComponent={renderFooterComponent}
        maintainVisibleContentPosition={
          maintainPosition ? {minIndexForVisible: 2} : undefined
        }
      />

      <TouchableOpacity
        onPress={handleIndicatorClick}
        style={{
          ...styles.indicatorBtnWrapper,
          bottom: replyConfig.status
            ? chatBoxHeight + 8 + replyChatHeight
            : chatBoxHeight + 8,
        }}>
        {unReadMessages.length > 0 && (
          <LinearGradient
            colors={['#E24185', '#4C5FE6']}
            start={{x: 0.0, y: 0.0}}
            end={{x: 1.0, y: 1.0}}
            style={styles.indicatorMsgCountGradient}>
            <CText style={styles.indicatorMsgCountText}>
              {unReadMessages.length}
            </CText>
          </LinearGradient>
        )}

        {!isAtBottom && (
          <LinearGradient
            colors={['#E24185', '#4C5FE6']}
            start={{x: 0.0, y: 0.0}}
            end={{x: 1.0, y: 1.0}}
            style={styles.indicatorGradientBox}>
            <Image
              source={appImages.doubleArrowDownIcon}
              style={styles.indicatorIcon}
            />
          </LinearGradient>
        )}
      </TouchableOpacity>

      {!!userList.length && (
        <FlatList
          bounces={false}
          keyExtractor={userListKeyExtractor}
          data={userList}
          renderItem={renderUserLists}
          ItemSeparatorComponent={userListSeparator}
          contentContainerStyle={styles.userListWrapper}
        />
      )}

      {replyConfig.status && (
        <CView
          row
          style={{
            height: chatBoxHeight,
            ...styles.chatBoxWrapper,
          }}>
          <Image
            source={appImages.replyMsgIcon2}
            style={{width: 15, height: 12.6}}
          />

          <CView
            style={{
              borderWidth: 1.5,
              height: 31,
              backgroundColor: '#201E34',
              marginLeft: 6,
            }}
          />

          <CView
            style={{
              marginLeft: 8,
              flex: 1,
            }}>
            <CText
              style={{
                color: '#201E34',
                fontSize: 10,
                fontWeight: '600',
              }}>
              Reply to {replyConfig?.data?.user?.name}
            </CText>
            <CText
              numberOfLines={1}
              style={{
                fontSize: 10,
                fontWeight: '400',
                color: 'rgba(32, 30, 52, 0.40)',
              }}>
              {replyConfig?.data?.text}
            </CText>
          </CView>

          {!!replyConfig?.data?.attachments[0]?.url && (
            <Image
              source={{
                uri: replyConfig?.data?.attachments[0]?.url,
                marginLeft: 10,
              }}
              style={{width: 45, height: 45}}
              resizeMode="cover"
            />
          )}

          <TouchableOpacity
            onPress={handleCloseReplyChat}
            style={{
              alignSelf: 'flex-end',
              marginLeft: replyConfig?.data?.attachments[0]?.url ? 7 : 10,
            }}>
            <Image
              source={appImages.closeIcon}
              style={{width: 28, height: 28}}
            />
          </TouchableOpacity>
        </CView>
      )}

      {!isReadOnlyChannel && (
        <CView style={styles.chatBtnWrapper}>
          <TextInput
            style={{
              ...styles.input,
              ...{
                paddingRight: 60,
                borderRadius: 0,
                borderWidth: 0,
                minHeight: chatBoxHeight,
                maxHeight: screenHeight * 0.5,
              },
            }}
            ref={inputRef}
            value={userMessage}
            autoComplete="off"
            autoCorrect={false}
            multiline={true}
            placeholder="Type a message"
            onChangeText={handleUserMessageChange}
          />

          <TouchableOpacity
            onPress={handleSubmitMessage}
            style={styles.chatSendBtnWrapper}>
            <CView style={styles.chatBtn}>
              <Image source={appImages.sendIcon2} style={styles.sendBtnIcon} />
            </CView>
          </TouchableOpacity>
        </CView>
      )}
    </CView>
  );
};

export default memo(ChatScreen);
