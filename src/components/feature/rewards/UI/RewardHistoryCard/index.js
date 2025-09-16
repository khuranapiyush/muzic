import moment from 'moment';
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { SvgUri } from 'react-native-svg';
import CText from '../../../../common/core/Text';
import CView from '../../../../common/core/View';
import styles from './style';

const RewardHistoryCard = ({ config, handleTerms }) => {
  return (
    <CView row style={styles.wrapper}>
      <CView style={styles.rewardLogoWrapper}>
        {config.logo?.includes('.svg') ? (
          <SvgUri uri={config.logo} width={32} height={32} />
        ) : (
          <Image
            source={{
              uri: config.logo,
            }}
            style={styles.rewardIcon}
          />
        )}
      </CView>

      <CView style={styles.detailWrapper}>
        <CView row style={styles.firstRowWrapper}>
          <CView>
            <CText style={styles.itemHeader}>Coupon Code / Coin</CText>
            <CText style={styles.itemValue}>{config.reward}</CText>
          </CView>
          <CView>
            <CText style={styles.itemHeader}>Won Date</CText>
            <CText style={styles.itemValue}>
              {moment(config?.wonDate).format('DD MMM YYYY')}
            </CText>
          </CView>
        </CView>
        <CView>
          <CView>
            <CText style={styles.itemHeader}>Game Type</CText>
          </CView>
          <CView row style={styles.secondRowWrapper}>
            <CText style={styles.itemValue}>{config.platform}</CText>
            {!!config.terms.length && (
              <TouchableOpacity onPress={() => handleTerms(config.terms)}>
                <CText style={styles.tncText}>T&C apply</CText>
              </TouchableOpacity>
            )}
          </CView>
        </CView>
      </CView>
    </CView>
  );
};

export default RewardHistoryCard;
