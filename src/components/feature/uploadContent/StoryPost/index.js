import React, {useCallback, useEffect, useRef, useState} from 'react';
import CView from '../../../common/core/View';
import Modal from 'react-native-modal';
import CText from '../../../common/core/Text';
import {
  ImageBackground,
  Pressable,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Share,
  Image,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import ViewShot from 'react-native-view-shot';

import appImages from '../../../../resource/images';
import styles from './style';
import CButton from '../../../common/core/Button';
import {fetchStoriesPlatform, postStories} from '../../../../api/uploadContent';
import {useMutation, useQuery} from '@tanstack/react-query';
import useToaster from '../../../../hooks/useToaster';
import {useNavigation} from '@react-navigation/native';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import MonetizeToggle from '../MonetizeToggle';

const StoryPost = ({route}) => {
  const {template} = route?.params;
  const viewShortRef = useRef();
  const navigation = useNavigation();
  const [isEditable, setIsEditable] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const {showToaster} = useToaster();
  const [userMessage, setUserMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState([]);

  const [postOn, setPostOn] = useState([]);

  const handleUserMessageChange = useCallback(text => {
    setUserMessage(text);
  }, []);

  const [platformData, setTemplateData] = useState();

  useQuery({
    queryKey: ['fetchStoriesPlatform'],
    queryFn: fetchStoriesPlatform,
    refetchOnMount: true,
    onSuccess: ({data}) => {
      setTemplateData(data.data.platforms);
    },
  });

  const {mutate: postStoriesApi} = useMutation(data => postStories(data), {
    onSuccess: ({data}) => {
      console.log(data);
      showToaster({
        type: 'success',
        text1: 'Success',
        text2: 'Story Posted Successfully!',
      });
      setIsEditable(true);
      setIsPosting(false);
      navigation.navigate(ROUTE_NAME.Home);
    },
    onError: err => {
      setIsEditable(true);
      setIsPosting(false);
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response.data.message,
      });
    },
    // onSettled: () => {
    //   setIsLoading(prev => ({ ...prev, mobile: false }))
    // }
  });
  const handleViewShort = async () => {
    setIsEditable(false);
    setIsPosting(true);
    try {
      const uri = await viewShortRef.current.capture();
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/png', // or 'image/jpeg'
        name: 'capturedImage.png',
      });

      const response = await fetch('https://upload.artistfirst.in/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      if (result.data[0]?.url) {
        let postData = {
          url: result.data[0]?.url,
          urlType: 'IMAGE',
          text: userMessage,
          platforms: selectedPlatform,
        };
        postStoriesApi(postData);
      }
    } catch (error) {
      console.error('Error capturing or uploading:', error);
      setIsEditable(true);
      setIsPosting(false);
    }
  };

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const calculateDimensions = () => {
    const screenDimensions = Dimensions.get('window');
    const screenWidth = screenDimensions.width;
    const screenHeight = screenDimensions.height;

    const desiredWidth = screenWidth;
    const desiredHeight = (desiredWidth * 16) / 9;

    setWidth(desiredWidth);
    setHeight(desiredHeight);
  };

  useEffect(() => {
    calculateDimensions();
    let temp = [];
    let temp1 = [];
    if (platformData) {
      platformData?.forEach(item => {
        if (item.isActive) {
          temp.push(item.title);
          temp1.push(item.logoUrl);
        }
      });
      setSelectedPlatform(temp);
      setPostOn(temp1);
    }
  }, [platformData]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleAddPlatFormClick = () => {
    setIsModalOpen(true);
  };

  const handlePressBtn = () => {
    let temp = [];
    let temp1 = [];
    platformData.forEach(item => {
      if (item.isActive) {
        temp.push(item.title);
        temp1.push(item.logoUrl);
      }
    });
    setSelectedPlatform(temp);
    setPostOn(temp1);
    setIsModalOpen(false);
  };

  const handleChange = (e, item) => {
    const index = platformData.findIndex(obj => obj.title == item.title);
    platformData[index].isActive = e;
  };

  console.log('🚀 ~ StoryPost ~ postOn:', postOn);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <CView style={{height: 440, width: 300}}>
          <ViewShot
            style={{flex: 1}}
            ref={viewShortRef}
            options={{
              format: 'jpg',
              width,
              height,
              quality: 0.9,
              result: 'data-uri',
            }}>
            <ImageBackground
              style={{flex: 1}}
              imageStyle={{borderRadius: 10}}
              source={{
                uri: template,
              }}>
              <Pressable
                onPress={() => Keyboard.dismiss()}
                centered
                style={styles.outSideInput}>
                <TextInput
                  style={styles.input}
                  value={userMessage}
                  autoComplete="off"
                  autoCorrect={false}
                  editable={isEditable}
                  multiline={true}
                  placeholderTextColor="#FFF"
                  placeholder="Type a message"
                  onChangeText={handleUserMessageChange}
                />
              </Pressable>
            </ImageBackground>
          </ViewShot>
        </CView>
      </KeyboardAvoidingView>
      <CView row style={styles.bottomSectionContainer}>
        <CView style={styles.bottomLeftItemContainer}>
          <CView row style={{justifyContent: 'space-between'}}>
            <CView centered row>
              <CText size="mediumBold" style={{color: '#FFF'}}>
                Post on:{' '}
              </CText>
              {postOn.map(item => (
                <Image
                  key={item}
                  source={{uri: item}}
                  style={{height: 20, width: 20}}
                />
              ))}
            </CView>
            <TouchableOpacity onPress={() => handleAddPlatFormClick()}>
              <CText style={{color: '#FFF'}}>Add platform</CText>
            </TouchableOpacity>
          </CView>
        </CView>
        <CView style={styles.bottomRightContainer}>
          <CButton
            size="large"
            buttonType="primary"
            isLoading={isPosting}
            disabled={isPosting}
            text="Post"
            isGradientButton
            onPress={handleViewShort}
            customStyles={styles.submitBtn}
          />
        </CView>
      </CView>
      <CView style={{position: 'absolute', top: 60, left: 5}}>
        <TouchableOpacity onPress={handleClose}>
          <Image
            source={appImages.closeIcon}
            style={{height: 30, width: 30, tintColor: '#FFF'}}></Image>
        </TouchableOpacity>
      </CView>

      <Modal
        isVisible={isModalOpen}
        swipeDirection={null}
        propagateSwipe
        style={{...styles.modal}}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        coverScreen={true}
        avoidKeyboard={true}>
        <CView>
          <CView style={styles.modalContainer}>
            <CView centered style={styles.marginTop20}>
              <CText centered size="mediumBold" style={{color: '#FFF'}}>
                Platforms
              </CText>
              <CText
                centered
                size="normal"
                style={{color: '#FFF', paddingTop: 5, paddingBottom: 10}}>
                Add or remove platforms to share your posts
              </CText>

              <CView style={{width: '100%'}}>
                {platformData?.map(item => (
                  <CView
                    key={item.title}
                    row
                    style={{
                      ...styles.bottomLeftItemContainer,
                      width: '95%',
                      paddingVertical: 1,
                    }}>
                    <CView centered row style={{flex: 1}}>
                      <CView centered row>
                        <Image
                          source={{uri: item.logoUrl}}
                          style={styles.modalLogo}
                        />
                        <CText size="normalBold" style={{color: '#FFF'}} t>
                          {item.title}
                        </CText>
                      </CView>
                      <CView style={{flex: 1}} />
                      <CView>
                        <MonetizeToggle
                          isDisabled={!item.toggle}
                          backgroundActive={'#E14084'}
                          isActive={item.isActive}
                          setToggle={e => handleChange(e, item)}
                        />
                      </CView>
                    </CView>
                  </CView>
                ))}
              </CView>
            </CView>

            <CView centered row style={styles.btnContainer}>
              <CButton
                size="large"
                buttonType="primary"
                text="Done"
                isGradientButton
                onPress={handlePressBtn}
                customStyles={styles.submitBtn}
              />
            </CView>
          </CView>
        </CView>
      </Modal>
    </SafeAreaView>
  );
};

export default StoryPost;
