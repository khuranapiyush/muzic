import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Button,
  Pressable,
  Keyboard,
} from 'react-native';
import {MediaStream, RTCView, mediaDevices} from 'react-native-webrtc';
import PermissionsManager from '../../../../utils/PermissionsManager';
const {check, request, PERMISSIONS, RESULTS} = PermissionsManager;
import CText from '../../../common/core/Text';
import {launchCamera} from 'react-native-image-picker';
import {screenHeight, screenWidth} from '../../../../utils/common';
import appImages from '../../../../resource/images';
import {ScrollView} from 'react-native-gesture-handler';
import CView from '../../../common/core/View';

const GoLivePrev = ({goLive}) => {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [title, setTitle] = useState('');
  console.log('preview screen', videoStream);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const permission = PERMISSIONS.IOS.CAMERA;
      const result = await check(permission);
      if (result === RESULTS.DENIED || result === RESULTS.UNAVAILABLE) {
        const requestResult = await request(PERMISSIONS.IOS.CAMERA);

        if (requestResult === RESULTS.GRANTED) {
          setHasCameraPermission(true);
          startCamera();
        }
      } else if (result === RESULTS.GRANTED) {
        setHasCameraPermission(true);
      }
    };

    requestCameraPermission();
  }, []);

  const startCamera = async () => {
    const stream = await mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setVideoStream(stream);
  };

  useEffect(() => {
    startCamera();
  }, []);

  return (
    <CView centered style={{flex: 1}}>
      <KeyboardAvoidingView behavior={'padding'} style={styles.container}>
        <Pressable onPress={() => Keyboard.dismiss()} style={styles.container}>
          {videoStream && (
            <RTCView
              mirror={true}
              streamURL={videoStream.toURL()}
              style={styles.rtcView}
              objectFit="cover"
            />
          )}

          <ScrollView style={styles.scrollView}>
            <TextInput
              multiline
              value={title}
              style={styles.input}
              placeholderTextColor="#C2C2C7"
              placeholder="Add Title"
              autoComplete="off"
              onChangeText={text => setTitle(text)}
              autoCorrect={false}
            />
          </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
      <TouchableOpacity onPress={() => goLive(title)} style={styles.button}>
        <Image source={appImages.goLiveIcon} style={styles.goLivestyle} />
      </TouchableOpacity>
    </CView>
  );
};

const styles = StyleSheet.create({
  goLivestyle: {
    heigh: 72,
    width: 72,
  },
  scrollView: {
    position: 'absolute',
    bottom: 200,
    paddingHorizontal: 20,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
  rtcView: {
    width: screenWidth,
    height: screenHeight,
    marginBottom: 220,
  },
  button: {
    position: 'absolute',
    bottom: 100,
    // backgroundColor: 'blue',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#0B091C80',
    borderRadius: 12,
    minWidth: 100,
    marginBottom: 20,
    color: '#C2C2C7',
    fontSize: 20,
    padding: 10,
    maxHeight: 200,
  },
});

export default GoLivePrev;
