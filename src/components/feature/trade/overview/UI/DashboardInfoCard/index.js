import React from 'react';
import CView from '../../../../../common/core/View';
import CText from '../../../../../common/core/Text';
import getStyles from './styles';
import {
  calculateProfitLoss,
  dollarToInrWithRupeeSign,
} from '../../../../../../utils/common';
import { useTheme } from '@react-navigation/native';

const DashboardInfoCard = ({ data, type = '' }) => {
  const { mode } = useTheme();
  const styles = getStyles(mode);
  return (
    <CView style={styles.wrapper}>
      <CView row style={styles.container}>
        <CView>
          <CText size="normal">Current</CText>
          <CView style={styles.itemContainer}>
            <CText size="normalBold">
              {dollarToInrWithRupeeSign(data?.totalInvestmentCurrentAmount)}
            </CText>
          </CView>
        </CView>
        <CView>
          <CText size="normal">Invested</CText>
          <CView style={styles.itemContainer}>
            <CText size="normalBold">
              {dollarToInrWithRupeeSign(data?.totalInvestmentAmount)}
            </CText>
          </CView>
        </CView>
        <CView>
          <CText size="normal">Total Returns</CText>
          <CView style={styles.itemContainer}>
            <CText
              style={
                data?.totalInvestmentReturn?.returnType == 'profit'
                  ? styles.profit
                  : styles.loss
              }
              size="normalBold">
              {calculateProfitLoss(data?.totalInvestmentReturn)}
            </CText>
          </CView>
        </CView>
      </CView>
      {type == 'portfolio' && (
        <CView row style={styles.portfolioContainer}>
          <CView>
            <CText size="normal">1 Day Returns</CText>
            <CView style={styles.itemContainer}>
              <CText
                style={
                  data?.oneDayReturn?.returnType == 'profit'
                    ? styles.profit
                    : styles.loss
                }
                size="normalBold">
                {calculateProfitLoss(data?.oneDayReturn)}
              </CText>
            </CView>
          </CView>
          <CView>
            <CText size="normal">Royalty Returns</CText>
            <CView style={styles.itemContainer}>
              <CText
                style={
                  data?.royaltyReturn?.returnType == 'profit'
                    ? styles.profit
                    : styles.loss
                }
                size="normalBold">
                {calculateProfitLoss(data?.royaltyReturn)}
              </CText>
            </CView>
          </CView>
        </CView>
      )}
    </CView>
  );
};

export default DashboardInfoCard;
