import React from 'react'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'
import getStyles from '../style'
import CText from '../../../common/core/Text'
import { screenWidth } from '../../../../utils/common'
import Stream from './Stream'
import RoyaltyProjection from './RoyaltyProjection'
import RoyaltyReturn from './RoyaltyReturn'

const renderScene = SceneMap({
  stream: Stream,
  royaltyProjection: RoyaltyProjection,
  royaltyReturn: RoyaltyReturn
})
const RoyaltyStreamAndProjection = ({ theme }) => {
  const styles = getStyles(theme)
  const [index, setIndex] = React.useState(1)

  const [routes] = React.useState([
    { key: 'stream', title: 'Stream' },
    { key: 'royaltyProjection', title: 'Royalty Projection' },
    { key: 'royaltyReturn', title: 'Royalty Return' }
  ])

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      swipeEnabled={false}
      overScrollMode={'always'}
      renderTabBar={props => (
        <TabBar
          isAutoSizeIndicator={true}
          {...props}
          renderLabel={({ route, focused }) => (
            <CText
              size="smallBold"
              style={focused ? styles.activeTabLabel : styles.inactiveTabLabel}>
              {route.title}
            </CText>
          )}
          style={styles.tabContainer}
          indicatorStyle={styles.activeIndicatorStyle}
        />
      )}
      initialLayout={{ width: screenWidth }}
      style={{ height: 350 }}
    />
  )
}

export default RoyaltyStreamAndProjection
