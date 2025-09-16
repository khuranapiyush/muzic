import React from 'react';
import CView from '../../common/core/View';
import CText from '../../common/core/Text';
import getStyles from './style';

const FanCardDetail = ({ data, theme }) => {
  const {
    royalty_share,
    royalty_payout_date,
    blockchain,
    total_tokens,
    contract_address,
  } = data;
  let last3 = contract_address?.slice(-3);
  let first4 = contract_address?.substring(0, 4);
  let contractAddress = last3 + '...' + first4;

  const styles = getStyles(theme);
  return (
    <CView style={styles.graphContainer}>
      <CText size="mediumBold" style={{ marginBottom: 10 }}>
        FanCard Detail
      </CText>
      <CView row centered style={{ justifyContent: 'space-between' }}>
        <CView centered style={styles.cardContainer}>
          <CText size="small">Total Royalty Share</CText>
          <CText>{royalty_share}%</CText>
        </CView>
        <CView centered style={styles.cardContainer}>
          <CText size="small">FanCard Royalty Share</CText>
          <CText>
            {data?.asset_tiers?.data?.[0]?.attributes?.revenue_share}%
          </CText>
        </CView>
      </CView>
      <CView
        row
        centered
        style={{ justifyContent: 'space-between', marginTop: 10 }}>
        <CView centered style={styles.cardContainer}>
          <CText size="small">Total FanCards</CText>
          <CText>{total_tokens}</CText>
        </CView>
        <CView centered style={styles.cardContainer}>
          <CText size="small">Royalty Payout Date</CText>
          <CText>{royalty_payout_date}</CText>
        </CView>
      </CView>
      <CView
        row
        centered
        style={{ justifyContent: 'space-between', marginTop: 10 }}>
        <CView centered style={styles.cardContainer}>
          <CText size="small">Blockchain</CText>
          <CText>{blockchain}</CText>
        </CView>
        <CView centered style={styles.cardContainer}>
          <CText size="small">Contract Address</CText>
          <CText>{contractAddress}</CText>
        </CView>
      </CView>
    </CView>
  );
};

export default FanCardDetail;
