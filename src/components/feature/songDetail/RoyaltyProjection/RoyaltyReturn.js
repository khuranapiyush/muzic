import React from 'react';
import { useSelector } from 'react-redux';
import { dollarToInrWithRupeeSign, formatDate1 } from '../../../../utils/common';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import StreamGraph from '../UI/StreamGraph';
import styles from './style';

const RoyaltyReturn = () => {
  const { streamAndRoyaltyData } = useSelector(state => state.trade);

  return (
    <CView style={styles.wrapper}>
      {streamAndRoyaltyData.royaltyPayback?.royalty.length > 0 ? (
        <CView style={styles.paddingTop10}>
          <CView row style={{ justifyContent: 'space-between' }}>
            <CView>
              <CText size="smallBold">Royalty Payback till date</CText>
              <CText size="mediumBold">
                {dollarToInrWithRupeeSign(
                  streamAndRoyaltyData?.royaltyPayback?.royaltyTillDate
                )}
              </CText>
            </CView>
            <CView>
              <CText size="smallBold">Royalty Payback per FanCard</CText>
              <CText size="mediumBold">
                {dollarToInrWithRupeeSign(
                  streamAndRoyaltyData?.royaltyPayback?.royaltyPerFanCard
                )}
              </CText>
            </CView>
          </CView>
          <CView row>
            <CText>Last Updated Date - </CText>
            <CText size="normalBold">
              {formatDate1(streamAndRoyaltyData?.royaltyPayback?.updatedAt)}
            </CText>
          </CView>
          <CView style={styles.paddingTop10}>
            <CText size="small">
              {streamAndRoyaltyData?.royaltyPayback?.description}
            </CText>
          </CView>
          <CView>
            {streamAndRoyaltyData?.data?.length > 0 && (
              <StreamGraph
                chartData={streamAndRoyaltyData.royaltyPayback?.royalty}
                type="royalty"
              />
            )}
          </CView>
        </CView>
      ) : (
        <CView>
          <CText size="normalBold" centered>
            No Data Available
          </CText>
        </CView>
      )}
    </CView>
  );
};

export default RoyaltyReturn;
