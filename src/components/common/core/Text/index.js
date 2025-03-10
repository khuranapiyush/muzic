/* eslint-disable react-native/no-inline-styles */
import get from 'lodash/get';
import React, {useContext} from 'react';
import {Text as RNText} from 'react-native';
import {ThemeContext} from '../../../../context/ThemeContext';
import Colors from '../../Colors';

RNText.defaultProps = {
  ...(RNText.defaultProps || {}),
  allowFontScaling: false,
};

//different sizes of text
const _style = {
  size: {
    extraLarge: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 24,
      lineHeight: 24,
    },
    extraLargeBold: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '600',
      fontSize: 24,
      lineHeight: 24,
    },
    large: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 18,
      lineHeight: 18,
    },
    largeBold: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '700',
      fontSize: 18,
      lineHeight: 18,
    },
    medium: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 24,
    },
    mediumBold: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 24,
    },
    mediumSemiBold: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 16,
      lineHeight: 24,
    },
    normal: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: 14,
      lineHeight: 20,
    },
    normalBold: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '600',
      fontSize: 14,
      lineHeight: 20,
    },
    small: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: 12,
      lineHeight: 18,
    },
    smallBold: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '600',
      fontSize: 12,
      lineHeight: 16,
    },
    extraSmall: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: 10,
      lineHeight: 16,
    },
    extraSmallBold: {
      fontFamily: 'Nohemi-Regular',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 10,
      lineHeight: 16,
    },
    bricolageHeading: {
      fontFamily: 'Bricolage Grotesque',
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 30,
      textTransform: 'uppercase',
      letterSpacing: -0.8,
    },
  },
};

const CText = ({
  text = '',
  color = 'white',
  size = 'normal',
  centered,
  language,
  children,
  style = {},
  ...rest
}) => {
  const {
    theme: {mode},
  } = useContext(ThemeContext);

  return (
    <RNText
      {...rest}
      style={[
        {
          color: get(Colors[mode], color, undefined),
          textAlign: centered ? 'center' : undefined,
          fontFamily: 'Nohemi-Regular',
        },
        _style.size[size],
        style,
      ]}
      children={children || text}
    />
  );
};
export default CText;
