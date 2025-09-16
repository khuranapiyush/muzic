import React, { useState } from 'react';
import CView from '../../../../../common/core/View';
import CText from '../../../../../common/core/Text';
import { Image, Pressable, TouchableOpacity } from 'react-native';
import { screenWidth } from '../../../../../../utils/common';
import styles from './style';
import { useNavigation } from '@react-navigation/native';
import useToaster from '../../../../../../hooks/useToaster';
import { useMutation } from '@tanstack/react-query';
import { validateTwitterFollow } from '../../../../../../api/game';
import { useSelector } from 'react-redux';
import ROUTE_NAME from '../../../../../../navigator/config/routeName';

const customStyles = { spacing: 16 };

const CustomCard30 = ({ item, metaData }) => {
  const { userId } = useSelector(state => state.user);
  const navigation = useNavigation();
  const { showToaster } = useToaster();
  const [buttonText, setButtonText] = useState(
    metaData?.questConfig?.buttonText
  );

  const [redirectUrl, setRedirectUrl] = useState(
    metaData?.questConfig?.redirectUrl
  );
  const [isValidating, setIsValidating] = useState(false);

  const { mutate: handleValidate } = useMutation(
    () => validateTwitterFollow({ user: userId }),
    {
      onSuccess: ({ data }) => {
        setIsValidating(false);
        if (data.data.isFollowing) {
          setButtonText('Followed');
        } else {
          setButtonText(metaData?.questConfig?.buttonText);
          setRedirectUrl(metaData?.questConfig?.redirectUrl);
          showToaster({
            type: 'info',
            text1: 'Warning',
            text2: 'Please Follow first then validate',
          });
        }
      },
      onError: err => {
        setIsValidating(false);
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: err.response.data.message,
        });
      },
    }
  );

  const handleFollow = item => {
    if (redirectUrl) {
      if (item?.questConfig.redirectUrl) {
        navigation.navigate(ROUTE_NAME.CWebView, {
          url: item?.questConfig?.redirectUrl,
        });
        setButtonText('Validate');
        setRedirectUrl('');
      }
    } else if (buttonText == 'Validate' && !isValidating) {
      setIsValidating(true);
      handleValidate();
    } else if (buttonText == 'Validate' && isValidating) {
      showToaster({
        type: 'info',
        text1: 'In Progress',
        text2: 'Validation is in process please wait for a while',
      });
    }
  };

  return (
    <CView>
      <Pressable
        style={{ position: 'relative', paddingTop: 10 }}
        onPress={() => handleFollow(item)}
        disabled={item?.isLocked}>
        <CView
          centered
          style={{
            paddingTop: 38,
            backgroundColor: item?.metaData?.backgroundColor,
            width: screenWidth * 0.42 - customStyles.spacing * 2,
            borderRadius: 7,
          }}>
          <Image
            source={{ uri: item?.metaData?.logoUrl }}
            style={styles.logoStyle}
          />

          <CText centered style={styles.labelStyle} size="normalBold">
            {item.label}
          </CText>

          <TouchableOpacity
            onPress={() => handleFollow(item)}
            disabled={buttonText == 'Followed'}
            style={styles.buttonStyle}>
            <CText size="normalBold" color="commonBlack">
              {buttonText || 'test'}
            </CText>
          </TouchableOpacity>
        </CView>
      </Pressable>
    </CView>
  );
};

export default CustomCard30;
