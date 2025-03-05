import Clipboard from 'react-native';
import LottieView from 'lottie-react-native';
import React, {useCallback} from 'react';
import {Image, Modal, Pressable, TouchableOpacity} from 'react-native';
import {SvgUri} from 'react-native-svg';
import useToaster from '../../../../../../hooks/useToaster';
import appAnimations from '../../../../../../resource/animation';
import appImages from '../../../../../../resource/images';
import CText from '../../../../../common/core/Text';
import CView from '../../../../../common/core/View';
import styles from './style';

const CouponRewardCard = ({isVisible, handleClose, rewardsConfig}) => {
  const {showToaster} = useToaster();

  const handleLinkCopy = useCallback(() => {
    Clipboard.setString(rewardsConfig.metaData.couponCode);
    showToaster({
      type: 'success',
      text1: 'Copied',
      text2: '',
      position: 'top',
    });
  }, [rewardsConfig.metaData.couponCode, showToaster]);

  return (
    <Modal
      hardwareAccelerated={true}
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onBackdropPress={handleClose}
      onRequestClose={handleClose}>
      <Pressable style={styles.wrapper} onPress={handleClose}>
        <CView style={styles.contentWrapper}>
          <CView style={styles.cardRewardLogoSlot}>
            {rewardsConfig.metaData.logo.includes('.svg') ? (
              <SvgUri
                uri={rewardsConfig.metaData.logo}
                width={50}
                height={50}
              />
            ) : (
              <Image
                source={{
                  uri: rewardsConfig.metaData.logo || appImages.gameIconLogo,
                }}
                style={styles.logoIcon}
              />
            )}
          </CView>

          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtnWrapper}>
            <Image source={appImages.closeIcon} style={styles.closeIcon} />
          </TouchableOpacity>

          {!rewardsConfig.metaData.lost && (
            <CView row style={styles.headerWrapper}>
              <Image
                source={appImages.partyPopperGameIcon}
                style={styles.partyPopperIcon}
              />
              <CText style={styles.congratsText}>Congratulations!</CText>
              <Image
                source={appImages.partyPopperGameIcon}
                style={styles.partyPopperIcon}
              />
            </CView>
          )}

          <CView style={styles.bottomWrapper}>
            <CText
              centered
              style={{
                ...styles.couponInfo,
                ...(rewardsConfig.metaData.lost && {
                  marginVertical: 32,
                  fontSize: 18,
                }),
              }}>
              {rewardsConfig.metaData.content}
            </CText>

            {!rewardsConfig.metaData.lost && (
              <CView row style={styles.couponWrapper}>
                <CText style={styles.couponText}>
                  {rewardsConfig.metaData.couponCode}
                </CText>
                <TouchableOpacity
                  onPress={handleLinkCopy}
                  style={styles.copyWrapper}>
                  <Image source={appImages.copyIcon} style={styles.copyIcon} />
                  <CText style={styles.copyText}>Copy</CText>
                </TouchableOpacity>
              </CView>
            )}

            {!rewardsConfig.metaData.lost && (
              <CView row style={styles.copyInfoWrapper}>
                <CText style={styles.copyInfoText}>
                  Copy coupon code to apply
                </CText>
                <CText style={styles.tncText}>*T&C Apply</CText>
              </CView>
            )}

            {!rewardsConfig.metaData.lost && (
              <CView>
                <CText centered style={styles.historyText}>
                  *Please find this coupon in the history tab on reward section
                </CText>
              </CView>
            )}
          </CView>
        </CView>
      </Pressable>
      {!rewardsConfig?.metaData?.lost && (
        <LottieView
          pointerEvents="none"
          style={{
            flex: 1,
            position: 'absolute',
            // zIndex: 1,
            top: 0,
            width: '100%',
            height: '100%',
          }}
          source={appAnimations.partyPopperAnimation}
          autoPlay
          loop
        />
      )}
    </Modal>
  );
};

export default CouponRewardCard;
