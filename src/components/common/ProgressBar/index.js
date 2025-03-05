import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import CText from '../core/Text'
import CView from '../core/View'
import styles from './style'
import { Colors } from '../core/colors'
const ProgressBar = ({
  progress,
  withPercent = true,
  borderRadius = 10,
  height = 20,
  color = null,
  leftPos,
  unfilledColor = '#CCCCCC'
}) => {
  const textLeftPosition = `${progress > 10 ? progress - 10 : 10}%`
  const textTopPosition = (height - 20) / 2

  return (
    <CView>
      <CView
        style={{
          ...styles.container,
          height: height,
          borderRadius: borderRadius,
          backgroundColor: unfilledColor
        }}>
        {color ? (
          <CView
            style={{
              width: `${progress}%`,
              height: height,
              borderRadius: borderRadius,
              backgroundColor: color.toString()
            }}
          />
        ) : (
          <CView
            style={{
              width: `${progress}%`,
              height: height,
              borderRadius: borderRadius,
              backgroundColor: '#6B61FF'
            }}
          />
        )}
        {withPercent && (
          <CText
            size="normal"
            style={{
              ...styles.percentText,
              left: leftPos || textLeftPosition,
              top: textTopPosition,
              color: progress > 10 ? Colors.Palette.white : Colors.Palette.black
            }}>{`${progress}%`}</CText>
        )}
      </CView>
    </CView>
  )
}
export default ProgressBar
