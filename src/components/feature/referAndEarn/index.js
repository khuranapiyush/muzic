import React from 'react'
import CView from '../../common/core/View'
import { TabView, SceneMap, TabBar, Bar } from 'react-native-tab-view'
import Referrals from './Referrals'
import { screenWidth } from '../../../utils/common'
import Faqs from './Faqs'
import CText from '../../common/core/Text'
import getStyle from './style'
import Invite from './Invite'
import { useTheme } from '@react-navigation/native'

const renderScene = SceneMap({
  invite: Invite,
  referrals: Referrals,
  faqs: Faqs
})

const ReferAndEarn = () => {
  const [index, setIndex] = React.useState(0)

  const { mode } = useTheme()
  const styles = getStyle(mode)

  const [routes] = React.useState([
    { key: 'invite', title: 'Invite' },
    { key: 'referrals', title: 'Referrals' },
    { key: 'faqs', title: 'Faqs' }
  ])

  return (
    <CView style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={props => (
          <TabBar
            {...props}
            renderLabel={({ route, focused }) => (
              <CText
                size="mediumBold"
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
  )
}

export default ReferAndEarn
