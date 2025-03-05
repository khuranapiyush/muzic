import React, {useCallback, useContext} from 'react';
import {Image, TouchableOpacity} from 'react-native';
import Share from 'react-native-share';
import appImages from '../../../../resource/images';
import WithAuth from '../../HOC/withAuth';
import CView from '../../core/View';
import styles from './style';
import CText from '../../core/Text';
import Colors from '../../Colors';
import {ThemeContext} from '../../../../context/ThemeContext';

const ShareButton = (
  {
    shareOptions = {title: '', message: '', url: ''},
    handleClick: propsHandleParent,
    customStyles = {},
    withAuth = false,
    isAuth,
    onlyIcon = false,
  },
  ref,
) => {
  const handleShare = useCallback(async () => {
    try {
      if (withAuth && isAuth) {
        const result = await Share.open({
          ...shareOptions,
        });
        if (result.action === Share.sharedAction) {
          // Content shared successfully
        } else if (result.action === Share.dismissedAction) {
          // Share dialog dismissed
        }
        propsHandleParent && propsHandleParent(result);
      } else {
        //If not auth, will be handled by withAuth HOC's
        propsHandleParent && propsHandleParent();
      }
    } catch (error) {
      //console.log('Error sharing:', error)
    }
  }, [isAuth, propsHandleParent, shareOptions, withAuth]);

  const {
    theme: {mode},
  } = useContext(ThemeContext);

  return (
    <TouchableOpacity onPress={handleShare}>
      <CView
        row
        centered
        style={{...styles.shareContainer, ...customStyles.shareContainer}}>
        <Image
          source={appImages.newShareIcon}
          style={{...styles.shareIconStyle, ...customStyles.shareIconStyle}}
        />
        {!onlyIcon && (
          <CText style={{color: Colors[mode]?.textLightGray}} size="small">
            Share
          </CText>
        )}
      </CView>
    </TouchableOpacity>
  );
};

export default ShareButton;

export const AuthShareButton = WithAuth(ShareButton);
