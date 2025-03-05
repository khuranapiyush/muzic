import React from 'react'
import CText from '../../../../../common/core/Text'
import CView from '../../../../../common/core/View'
import getStyles from './style'
import Avatar from '../../../../../common/Avatar'
import ProgressBar from '../../../../../common/ProgressBar'
import Colors from '../../../../../common/Colors'

const ActivityCard = ({ data, theme }) => {
  const styles = getStyles(theme)
  return (
    <CView style={styles.wrapper}>
      <CView row style={styles.contentContainer}>
        <CView>
          <CText color="textLightGray" style={styles.coinLimit}>
            {data.coinLimitV2}
          </CText>
          <CText color="textLightGray" style={styles.summary}>
            {data.summary}
          </CText>
          {/* <CText color="textLightGray" style={styles.coinPerActivity}>
            {data.coinPerActivityV2}
          </CText> */}
        </CView>
        <CView>
          <Avatar
            imageUrl={data.imageUrl}
            customStyles={{ avatarContainer: styles.imageContainer }}
          />
        </CView>
      </CView>
      <ProgressBar
        unfilledColor={theme === 'dark' ? '#353535' : 'rgba(30, 30, 30, 0.10)'}
        color={theme === 'dark' ? '#FFF' : Colors[theme].primary}
        withPercent={false}
        height={10}
        progress={data?.earnedPerc}
      />
    </CView>
  )
}

export default ActivityCard
