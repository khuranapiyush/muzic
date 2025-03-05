import { StyleSheet } from 'react-native'
import Colors from '../../../../common/Colors'

const getStyles = theme =>
  StyleSheet.create({
    wrapper: {
      // backgroundColor: 'gray',
      flex: 1
    },
    chatWrapper: {
      marginHorizontal: 25,
      marginBottom: 11
    },
    sentMessage: {
      alignSelf: 'flex-end'
    },

    ownSendMessage: {
      alignSelf: 'flex-end',
      backgroundColor: Colors[theme].chatOwnMsgBg
    },
    receivedMessage: { alignSelf: 'flex-start' },
    userStatsWrapper: {
      alignItems: 'center',
      backgroundColor: 'transparent'
    },
    userNameSent: {
      marginLeft: 6,
      fontSize: 10,
      fontWeight: '500'
    },
    userNameReceived: {
      marginRight: 6,
      fontSize: 10,
      fontWeight: '500'
    },
    msgWrapper: {
      marginTop: 9,
      borderRadius: 8,
      backgroundColor: Colors[theme].textGray,
      paddingLeft: 6,
      paddingTop: 6,
      paddingBottom: 10,
      paddingRight: 24,
      maxWidth: '80%'
    },
    msgText: {
      fontSize: 12,
      fontWeight: '400'
    },
    replyMsgTextWrapper: { flexDirection: 'row' },
    replyMsgDivider: {
      borderWidth: 1.5,
      borderColor: '#734CC9'
    },
    replyMsgSenderWrapper: {
      marginLeft: 7
    },
    replyImage: { width: 45, height: 45, marginRight: 7 },
    replyMsgSenderName: {
      fontSize: 10,
      fontWeight: '600',
      fontColor: '#201E34',
      alignItems: 'baseline'
    },
    replyMsgSenderText: {
      fontSize: 10,
      fontWeight: '400',
      fontColor: '#757575'
    },
    replyMsgText: { marginTop: 10 },
    msgTimeWrapper: { margin: 4 },
    msgTimeText: { fontSize: 10, fontWeight: '500', color: '#93989E' },
    chatBtnWrapper: {
      width: '100%',
      backgroundColor: '#FFF',
      borderColor: '#D7D7D7',
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    chatSendBtnWrapper: {
      position: 'absolute',
      right: 2
    },
    chatBtn: {
      borderRadius: 10,
      padding: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: 42,
      height: 42,
      backgroundColor: '#6B61FF'
    },
    sendBtnIcon: { width: 21, height: 21, borderRadius: 100 },
    indicatorBtnWrapper: {
      position: 'absolute',
      right: 16,
      alignItems: 'center'
    },
    indicatorGradientBox: {
      width: 35,
      height: 35,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2
    },
    indicatorIcon: { width: 13, height: 13 },
    indicatorMsgCountGradient: {
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center'
    },
    indicatorMsgCountText: {
      fontSize: 11,
      fontWeight: '500',
      color: '#FFF',
      paddingHorizontal: 8
    },
    focusedMessage: {
      backgroundColor: '#F0F0F0',
      borderColor: '#D7D7D7',
      borderWidth: 0.1
    },
    actionWrapperBySender: {
      justifyContent: 'center',
      marginHorizontal: 25
    },
    actionWrapper: {
      backgroundColor: '#201E34',
      height: 30,
      width: 30,
      borderRadius: 50
    },
    replyBtnWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%'
    },
    replyBtnIcon: {
      width: 17,
      height: 17
    },
    footerIndicator: { marginTop: 50, flex: 1 },
    headerIndicator: { marginBottom: 50, flex: 1 },
    chatBoxWrapper: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#D7D7D7',
      backgroundColor: '#EDEDED',
      alignItems: 'center',
      paddingVertical: 11,
      paddingRight: 11,
      paddingLeft: 9
    },
    userListWrapper: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#D7D7D7',
      backgroundColor: '#FFF',
      paddingHorizontal: 20,
      paddingVertical: 14
    },
    input: {
      borderWidth: 1,
      borderColor: '#DADADA',
      borderRadius: 12,
      fontSize: 14,
      width: '100%',
      paddingHorizontal: 15,
      paddingBottom: 15,
      paddingTop: 15,
      alignItems: 'center'
    },
    userListSeparator: {
      borderWidth: 0.5,
      backgroundColor: '#D7D7D',
      marginTop: 4,
      marginBottom: 6
    },
    userListItemWrapper: { alignItems: 'center', flexDirection: 'row' },
    userListAvatar: {
      marginLeft: 9,
      fontSize: 14,
      fontWeight: '400',
      fontColor: '#000'
    },
    linkStyle: {
      color: '#0000EE',
      textDecorationLine: 'underline',
      fontWeight: '500'
    }
  })

export default getStyles
