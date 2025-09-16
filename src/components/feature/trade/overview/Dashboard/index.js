import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import {
  fetchDashboardInvestmentData,
  fetchDashboardListNft,
} from '../../../../../api/trade';
import CView from '../../../../common/core/View';
import DashboardInfoCard from '../UI/DashboardInfoCard';
import DashboardNftSection from '../UI/DashboardNftSection';
import styles from './style';
import { useAuthUser } from '../../../../../stores/selector';
import { useIsFocused } from '@react-navigation/native';

const Dashboard = () => {
  const { isLoggedIn } = useSelector(useAuthUser);
  const [investmentData, setInvestmentData] = useState([]);
  const [listNft, setListNft] = useState([]);

  const isFocused = useIsFocused();
  const { userId } = useSelector(state => state.user);

  useQuery({
    queryKey: ['fetchDashboardInvestmentData'],
    queryFn: fetchDashboardInvestmentData.bind(this, { userId: userId }),
    refetchOnMount: true,
    enabled: !!userId || isFocused,
    onSuccess: res => {
      const data = res.data.data;
      setInvestmentData(data);
    },
  });

  useQuery({
    queryKey: ['fetchDashboardListNft'],
    queryFn: fetchDashboardListNft,
    refetchOnMount: true,
    enabled: !!userId || isFocused,
    onSuccess: res => {
      const data = res.data.data;
      setListNft(data);
    },
  });

  return (
    <CView style={styles.wrapper}>
      <ScrollView>
        {isLoggedIn && <DashboardInfoCard data={investmentData} />}
        <DashboardNftSection data={listNft} />
      </ScrollView>
    </CView>
  );
};

export default Dashboard;
