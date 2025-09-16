import {useNavigation, useTheme} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  NativeModules,
  Platform,
  Pressable,
  TouchableOpacity,
} from 'react-native';
const {FilePicker} = NativeModules;

import PermissionsManager from '../../../../utils/PermissionsManager';
const {PERMISSIONS, RESULTS, check, request} = PermissionsManager;
import useToaster from '../../../../hooks/useToaster';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import appImages from '../../../../resource/images';
import {screenHeight, screenWidth} from '../../../../utils/common';
import Colors from '../../../common/Colors';
import CButton from '../../../common/core/Button';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import getStyles from './style';
import {launchImageLibrary} from 'react-native-image-picker';

const UploadVideo = () => {
  const {showToaster} = useToaster();
  const navigation = useNavigation();

  const [isProcessing, setIsProcessing] = useState(false);

  const {mode} = useTheme();
  const styles = getStyles(mode);

  const checkAspectRatio = useCallback(
    (videoFile, expectedRatio = 1.77, marginOfError) => {
      const actualRatio = parseFloat(
        videoFile.width / videoFile.height,
      ).toFixed(2);
      const [min, max] = [
        expectedRatio - expectedRatio * (marginOfError / 100),
        expectedRatio + expectedRatio * (marginOfError / 100),
      ];

      if (actualRatio >= min && actualRatio <= max) {
        return true;
      } else {
        return false;
      }
    },
    [],
  );

  const handleVideoPicker = useCallback(async () => {
    setIsProcessing(true);
    try {
      const options = {
        mediaType: 'video',
      };
      // const result = await launchImageLibrary(options)
      const result = await FilePicker.pickVideo();
      setIsProcessing(false);
      if (result?.assets != null) {
        if (result?.assets?.[0]?.fileSize > 1024 * 1024 * 1000 * 3) {
          showToaster({
            type: 'error',
            text1: 'Error',
            text2: 'Video Should be less than 3GB',
          });
          return;
        }
        if (checkAspectRatio(result?.assets[0], 1.77, 50)) {
          // const fileExists = await RNFS.exists(result?.assets[0].uri)
          // if (fileExists) {

          navigation.navigate(ROUTE_NAME.UploadContent, {
            fileContent: result?.assets[0],
            contentType: `${result?.assets[0]?.type || 'video/mp4'} `,
            videoType: 'video',
          });

          // } else {
          //   showToaster({
          //     type: 'error',
          //     text1: 'Error',
          //     text2: 'File  not found'
          //   })
          // }
        } else {
          showToaster({
            type: 'error',
            text1: 'Error',
            text2: 'Video Should maintain aspect ratio of 16/9',
          });
          setIsProcessing(false);
        }
      } else if (result.didCancel) {
        setIsProcessing(false);
      }
    } catch (error) {
      console.log('Error in handleVideoPicker', error);
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to retrieve video URL',
      });
      setIsProcessing(false);
    }
  }, [checkAspectRatio, navigation, showToaster]);

  const handleVideoUpload = useCallback(async () => {
    try {
      const permissionGranted = await requestPhotoPermission();
      if (permissionGranted) {
        handleVideoPicker();
      }
    } catch (error) {
      console.log('Error requesting permissions:', error);
    }
  }, [handleVideoPicker, requestPhotoPermission]);

  const requestPhotoPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
        const status = await check(permission);

        if (status !== RESULTS.GRANTED) {
          const result = await request(permission);
          if (result === RESULTS.GRANTED) {
            return true;
          } else {
            return false;
          }
        } else if (status === RESULTS.GRANTED) {
          return true;
        }
      }
    } catch (error) {
      console.log('Error in requestMediaPermission', error);
      return false;
    }
  }, []);

  // useEffect(() => {
  //   handleVideoUpload()
  // }, [])

  return (
    <>
      {isProcessing && (
        <CView
          style={{
            height: screenHeight - 500,
            width: screenWidth - 25,
            position: 'absolute',
            zIndex: 999999,
            backgroundColor: Colors[mode].cardBg,
            borderRadius: 10,
          }}
          centered>
          <ActivityIndicator
            color="red"
            textContent={'Loading...'}
            size={'large'} />
          <CText style={{marginTop: 10}}>
            Please Wait, Your Video is Processing
          </CText>
          <CText>It will take some time</CText>
        </CView>
      )}
      <CView centered style={styles.modalContainer}>
        <Pressable onPress={handleVideoUpload}>
          <CView centered style={styles.iconContainer}>
            <Image
              source={appImages.uploadIcon}
              style={{height: '100%', width: '100%'}}
            />
          </CView>
        </Pressable>
        <CView style={{marginTop: 15}}>
          <CText size="normalMedium">Upload Your Video</CText>
        </CView>
        <CView style={{marginTop: 20}}>
          <TouchableOpacity>
            <CView>
              <CButton
                size="large"
                buttonType="primary"
                text="Upload Video"
                isGradientButton
                onPress={() => handleVideoUpload()}
                customStyles={styles.submitBtn}
              />
            </CView>
          </TouchableOpacity>
        </CView>
        <CView style={{marginTop: 15}}>
          <CText size="normalMedium">Maximum File Size: 3Gb </CText>
        </CView>
      </CView>
    </>
  );
};

export default UploadVideo;
