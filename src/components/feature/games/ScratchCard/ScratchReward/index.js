import Clipboard from 'react-native';
import React, {useCallback} from 'react';
import {Image, TouchableOpacity} from 'react-native';
import useToaster from '../../../../../hooks/useToaster';
import appImages from '../../../../../resource/images';
import CText from '../../../../common/core/Text';
import CView from '../../../../common/core/View';
import styles from './style';

const ScratchRewardCard = ({gameConfig, rewardsConfig}) => {
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
    <CView style={styles.wrapper}>
      <CView row style={styles.topWrapper}>
        <Image
          source={appImages.partyPopperGameIcon}
          style={styles.partyPopIcon}
        />
        <CText style={styles.partyText}>Congratulations!</CText>
        <Image
          source={appImages.partyPopperGameIcon}
          style={styles.partyPopIcon}
        />
      </CView>

      <CView style={styles.bottomWrapper}>
        <CText centered style={styles.couponInfo}>
          {rewardsConfig.metaData.content}
        </CText>

        <CView row style={styles.couponWrapper}>
          <CText style={styles.couponText}>
            {rewardsConfig.metaData.couponCode}
          </CText>
          <TouchableOpacity onPress={handleLinkCopy} style={styles.copyWrapper}>
            <Image source={appImages.copyIcon} style={styles.copyIcon} />
            <CText style={styles.copyText}>Copy</CText>
          </TouchableOpacity>
        </CView>

        <CView row style={styles.copyInfoWrapper}>
          <CText style={styles.copyInfoText}>Copy coupon code to apply</CText>
          <CText style={styles.tncText}>*T&C Apply</CText>
        </CView>

        <CView>
          <CText centered style={styles.historyText}>
            *Please find this coupon in the history tab on reward section
          </CText>
        </CView>
      </CView>
    </CView>
  );
};

export default ScratchRewardCard;
