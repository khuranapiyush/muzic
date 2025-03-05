import React, { useState } from 'react'
import CView from '../../../common/core/View'
import styles from './style'
import { Switch } from 'react-native-switch'

const MonetizeToggle = ({
  isActive = false,
  setToggle,
  activeText = 'Yes',
  inActiveText = 'No',
  barHeight = 40,
  backgroundActive = '#48B16E',
  isDisabled = false
}) => {
  const [isEnabled, setIsEnabled] = useState(isActive)

  const toggleSwitch = () => {
    setIsEnabled(previousState => !previousState)
    setToggle(!isEnabled)
  }

  return (
    <CView style={styles.wrapper}>
      <CView style={styles.switchContainer}>
        <Switch
          value={isEnabled}
          onValueChange={toggleSwitch}
          disabled={isDisabled}
          activeText={activeText}
          inActiveText={inActiveText}
          backgroundActive={backgroundActive}
          backgroundInactive={'gray'}
          circleActiveColor={'#FFF'}
          circleInActiveColor={'#FFF'}
          switchWidthMultiplier={2.5}
          circleSize={35}
          barHeight={barHeight}
          switchLeftPx={3.5}
          switchRightPx={3}
        />
      </CView>
    </CView>
  )
}

export default MonetizeToggle
