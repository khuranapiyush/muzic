import React, { useEffect, useMemo, useState } from 'react';
import CView from '../../../common/core/View';
import CText from '../../../common/core/Text';
import { useSelector } from 'react-redux';
import { dollarToInrWithRupeeSign } from '../../../../utils/common';
import { Colors } from '../../../common/core/colors';
import StreamSlider from '../UI/Slider';
import styles from './style';

const RoyaltyProjection = () => {
  const { fanCardDetails, fanCardPriceDetail } = useSelector(
    state => state.trade
  );

  const revenueShare = useMemo(
    () => fanCardDetails?.asset_tiers?.data?.[0]?.attributes?.revenue_share,
    [fanCardDetails?.asset_tiers?.data]
  );

  const [sliderValue, setSliderValue] = useState(26);

  const [returnInX, setReturnInX] = useState(1.5);

  const [expectedReturn, setExpectedReturn] = useState(0);

  useEffect(() => {
    var tradeNftPrice = fanCardPriceDetail?.buyPrice * 80 * 1.5;
    var tradeRevShare = 0.04 * (revenueShare / 100);
    var tradeSlidValue = tradeNftPrice / tradeRevShare;
    setSliderValue(Math.round((tradeSlidValue / 1000000) * 1e2) / 1e2);
  }, [fanCardPriceDetail?.buyPrice, revenueShare]);

  useEffect(() => {
    let returns =
      (sliderValue *
        1000000 *
        0.04 *
        fanCardDetails?.asset_tiers?.data?.[0]?.attributes?.revenue_share) /
      100;
    setExpectedReturn(Math.round(returns));
    setReturnInX((returns / (fanCardPriceDetail?.buyPrice * 80)).toFixed(1));
  }, [
    fanCardDetails?.asset_tiers?.data,
    fanCardPriceDetail?.buyPrice,
    sliderValue,
  ]);
  return (
    <CView style={styles.royaltyProjectionContainer}>
      <CView row style={styles.royaltyProjectionTopItems}>
        <CView>
          <CText>Current Price</CText>
          <CText size="mediumBold">
            {dollarToInrWithRupeeSign(fanCardPriceDetail?.buyPrice)}
          </CText>
        </CView>
        <CView>
          <CText>Royalty Share</CText>
          <CText size="mediumBold">
            {fanCardDetails?.asset_tiers?.data?.[0]?.attributes?.revenue_share}%
          </CText>
        </CView>
        <CView>
          <CText>Est. Target Payout</CText>
          <CText size="mediumBold">
            {expectedReturn}{' '}
            <CText size="smallBold" style={{ color: Colors.Palette.brandPink }}>
              ({returnInX}x returns)
            </CText>
          </CText>
        </CView>
      </CView>
      <CText style={styles.projectedRoyaltyEarning} size="mediumBold">
        Projected Royalty Earnings
      </CText>
      <CText>
        Expected royalty payback and return according to royalty share per
        Fancard and current card price. As song streams more, you earn more.
      </CText>
      <CView style={styles.paddingTop10}>
        <StreamSlider
          sliderValue={sliderValue}
          setSliderValue={setSliderValue}
        />
      </CView>
    </CView>
  );
};

export default RoyaltyProjection;
