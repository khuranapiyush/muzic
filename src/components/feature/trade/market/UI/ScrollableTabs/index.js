import React, { useCallback, useEffect, useState } from 'react';
import { TabView, TabBar } from 'react-native-tab-view';
import getStyles from './style';
import ListItem from '../ListItem';
import CView from '../../../../../common/core/View';
import CText from '../../../../../common/core/Text';
import { screenWidth } from '../../../../../../utils/common';
import { fetchMarketTypeList } from '../../../../../../api/trade';
import { useQuery } from '@tanstack/react-query';
import { FlatList } from 'react-native';
import ShimmerEffect from '../../../../../common/ShimmerEffect';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFanCardVideoDetail,
  setSelectedTabId,
} from '../../../../../../stores/slices/trade';
import NotifyMe from '../NotiftMe';
import { useNavigation, useTheme } from '@react-navigation/native';
import ROUTE_NAME from '../../../../../../navigator/config/routeName';

const ScrollableTabs = ({ scrollList }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [index, setIndex] = useState(0);

  const { mode } = useTheme();
  const styles = getStyles(mode);
  const { selectedTabId } = useSelector(state => state.trade);

  const [selectedTab, setSelectedTab] = useState('');

  const { isFetching } = useQuery({
    queryKey: [`fetchMarketTypeList-${selectedTab}`],
    queryFn: fetchMarketTypeList.bind(this, { page: selectedTab }),
    enabled: !!selectedTab,
    onSuccess: res => {
      const temp = res.data.data;
      const objectToUpdate = scrollList.find(item => item.key === selectedTab);
      objectToUpdate.listData = temp;
    },
  });
  useEffect(() => {
    const selectedTabIndex = scrollList.findIndex(
      item => item.key == selectedTabId
    );
    if (selectedTabIndex != -1) {
      setSelectedTab(selectedTabId);
      setIndex(selectedTabIndex);
      dispatch(setSelectedTabId(''));
    }
    return () => {
      dispatch(setSelectedTabId(''));
    };
  }, [dispatch, scrollList, selectedTabId]);

  const handleCardClick = useCallback(
    item => {
      dispatch(setFanCardVideoDetail(item));
      navigation.navigate(ROUTE_NAME.SongDetail, {
        songData: item,
        title: item?.tierName,
      });
    },
    [dispatch, navigation]
  );

  const renderItem = useCallback(
    ({ item }) => {
      return (
        <CView>
          <ListItem
            mode={mode}
            item={item}
            cardClick={() => handleCardClick(item)}
            isFetching={isFetching}
          />
        </CView>
      );
    },
    [handleCardClick, isFetching]
  );

  const keyExtractor = useCallback(item => `list_${item.launchDate}`, []);

  const renderScene = useCallback(
    ({ route }) => (
      <CView>
        {route.showNotifyFlag ? (
          <NotifyMe />
        ) : (
          <CView>
            <CView row style={styles.headingContainer}>
              <CText style={styles.width50}>Name</CText>
              <CView style={styles.width25}>
                <CText>Price</CText>
                <CText size="small" style={styles.colorPink}>
                  24 hr change
                </CText>
              </CView>
              <CView style={styles.width25}>
                <CText>Price</CText>
                <CText size="small" style={styles.colorPink}>
                  since launch
                </CText>
              </CView>
            </CView>
            <CView style={styles.wrapper}>
              <FlatList
                showsVerticalScrollIndicator={false}
                data={scrollList[index].listData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
              />
            </CView>
          </CView>
        )}
      </CView>
    ),
    [index, keyExtractor, renderItem, scrollList]
  );

  const [routes] = React.useState(scrollList);

  const handleTabChange = useCallback(
    item => {
      setIndex(item);
      setSelectedTab(scrollList[item]._id);
    },
    [scrollList]
  );

  return (
    <CView style={styles.container}>
      <TabView
        lazy
        renderLazyPlaceholder={() => (
          <CView style={{ marginTop: 20, marginLeft: 10 }}>
            <ShimmerEffect type="tradeList" config={{ times: 10 }} />
          </CView>
        )}
        scrollEnabled={true}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={handleTabChange}
        renderTabBar={props => (
          <TabBar
            tabStyle={{ width: 'auto', minWidth: 100 }}
            isAutoSizeIndicator={true}
            scrollEnabled={true}
            {...props}
            renderLabel={({ route, focused }) => (
              <CText
                size="smallBold"
                style={
                  focused ? styles.activeTabLabel : styles.inactiveTabLabel
                }>
                {route.name}
              </CText>
            )}
            style={styles.tabContainer}
            indicatorStyle={styles.activeIndicatorStyle}
          />
        )}
        initialLayout={{ width: screenWidth }}
      />
    </CView>
  );
};

export default ScrollableTabs;
