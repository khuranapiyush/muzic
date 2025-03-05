import React, { memo, useContext } from 'react'
import { View as DefaultView } from 'react-native'
import { ThemeContext } from '../../../../context/ThemeContext'
import { Theme } from '../colors'
import { get } from '../../../../utils/common'

const _style = (row, centered, borderRadius) => ({
  ...(!!row && { flexDirection: 'row' }),
  ...(!!centered && { justifyContent: 'center', alignItems: 'center' }),
  ...(!!borderRadius && { borderRadius })
})

const _borderColor = (
  theme,
  borderColor,
  borderBottomColor,
  borderLeftColor,
  borderTopColor,
  borderRightColor
) => ({
  borderColor: borderColor
    ? get(Theme[theme], borderColor, undefined)
    : undefined,
  borderBottomColor: borderBottomColor
    ? get(Theme[theme], borderBottomColor, undefined)
    : undefined,
  borderLeftColor: borderLeftColor
    ? get(Theme[theme], borderLeftColor, undefined)
    : undefined,
  borderTopColor: borderTopColor
    ? get(Theme[theme], borderTopColor, undefined)
    : undefined,
  borderRightColor: borderRightColor
    ? get(Theme[theme], borderRightColor, undefined)
    : undefined
})

const CView = ({
  row,
  centered,
  color,
  borderRadius,
  borderColor,
  borderBottomColor,
  borderLeftColor,
  borderTopColor,
  borderRightColor,
  style,
  ...rest
}) => {
  const {
    theme: { mode }
  } = useContext(ThemeContext)

  return (
    <DefaultView
      {...rest}
      style={[
        {
          backgroundColor: color
            ? get(Theme[mode], color || 'surface.primary', undefined)
            : undefined
        },
        _borderColor(
          mode,
          borderColor,
          borderBottomColor,
          borderLeftColor,
          borderTopColor,
          borderRightColor
        ),
        _style(row, centered, borderRadius),
        style
      ]}
    />
  )
}

export default CView
