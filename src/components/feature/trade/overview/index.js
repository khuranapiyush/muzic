import React, { useEffect, useMemo } from 'react';
import { TabView, SceneMap, TabBar, Bar } from 'react-native-tab-view';
import OrderHistory from './OrderHistory';
import getStyles from './style';
import Dashboard from './Dashboard';
import CView from '../../../common/core/View';
import CText from '../../../common/core/Text';
import Portfolio from './Portfolio';
import { screenWidth } from '../../../../utils/common';
import { useSelector } from 'react-redux';
import { useIsFocused, useTheme } from '@react-navigation/native';

const renderScene = SceneMap({
  dashboard: Dashboard,
  portfolio: Portfolio,
  orderHistory: OrderHistory,
});
const Overview = ({ params }) => {
  const { childTabIndex } = useSelector(state => state.trade);
  const isFocused = useIsFocused();
  const [index, setIndex] = React.useState(0);

  const { mode } = useTheme();
  const styles = getStyles(mode);

  const [routes] = React.useState([
    { key: 'dashboard', title: 'Dashboard' },
    { key: 'portfolio', title: 'Portfolio' },
    { key: 'orderHistory', title: 'Order History' },
  ]);

  const hasChildIdx = useMemo(
    () => params?.hasOwnProperty('childIdx'),
    [params]
  );

  useEffect(() => {
    if (hasChildIdx) {
      setIndex(params?.childIdx);
    } else {
      setIndex(childTabIndex);
    }
  }, [childTabIndex, hasChildIdx, params?.childIdx, isFocused]);

  return (
    <CView style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        scrollEnabled={true}
        renderTabBar={props => (
          <TabBar
            {...props}
            tabStyle={{ width: 'auto', minWidth: 100 }}
            isAutoSizeIndicator={true}
            scrollEnabled={true}
            renderLabel={({ route, focused }) => (
              <CText
                size="smallBold"
                style={
                  focused ? styles.activeTabLabel : styles.inactiveTabLabel
                }>
                {route.title}
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

export default Overview;
