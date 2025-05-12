/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ThemeContext} from '../../../../context/ThemeContext';
import CText from '../Text';
import {Colors} from '../colors';

const _style = {
  type: {
    primary: (theme, disabled) => ({
      borderRadius: 48,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6B61FF',
      opacity: disabled ? 0.4 : 1,
      borderColor: theme === 'dark' ? '#FFF' : Colors.Theme[theme].core.primary,
    }),
    secondary: (theme, disabled, backgroundColor) => ({
      borderRadius: 48,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#FFF' : Colors.Theme[theme].core.primary,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: backgroundColor || Colors.Theme[theme].surface.primary,
      opacity: disabled ? 0.4 : 1,
    }),
    tertiary: (theme, disabled) => ({
      borderRadius: 48,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      opacity: disabled ? 0.4 : 1,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#FFF' : Colors.Theme[theme].core.primary,
    }),
    gradient: (theme, disabled) => ({
      borderRadius: 48,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.4 : 1,
    }),
  },
  icon: {large: 16, medium: 14, small: 12, normal: 20},
  ps: {large: 'l1', medium: 'l2', small: 'l3'},
  size: {
    large: {height: 48, minWidth: 120, paddingHorizontal: 24},
    medium: {height: 36, minWidth: 96, paddingHorizontal: 16},
    small: {height: 24, minWidth: 72, paddingHorizontal: 8},
    regular: {height: 44, minWidth: 120},
    normal: {
      height: 56,
      minWidth: 120,
    },
  },
  clr: {
    light: {
      primary: Colors.Palette.white,
      secondary: Colors.Theme.light.core.primary,
      tertiary: Colors.Theme.light.core.primaryInv,
      gradient: Colors.Palette.white,
    },
    dark: {
      primary: Colors.Palette.white,
      secondary: Colors.Palette.white,
      tertiary: Colors.Palette.white,
      gradient: Colors.Palette.white,
    },
  },
  rpl: {
    light: {
      primary: Colors.Palette.white60,
      secondary: Colors.Palette.red2,
      tertiary: Colors.Palette.red2,
      gradient: Colors.Palette.white60,
    },
    dark: {
      primary: Colors.Palette.red2,
      secondary: Colors.Palette.red5,
      tertiary: Colors.Palette.red5,
      gradient: Colors.Palette.red2,
    },
  },
  icMargin: {large: 8, medium: 6, small: 4},
};

const CButton = ({
  text,
  showIcon,
  size,
  iconImage,
  buttonType,
  disabled,
  onPress,
  backgroundColor,
  style,
  customStyles,
  isGradientButton,
  gradientColors,
  gradientStart,
  gradientEnd,
  isLoading,
  ...rest
}) => {
  const {
    theme: {mode},
  } = useContext(ThemeContext);

  const conditionalRender = () => {
    return isLoading ? (
      <ActivityIndicator color={_style.clr[mode][buttonType]} size="small" />
    ) : (
      <>
        {showIcon && (
          <Image
            source={iconImage}
            style={{width: 20, height: 20, ...customStyles?.iconStyles}}
          />
        )}
        <CText
          size="normal"
          text={text}
          style={{
            color: _style.clr[mode][buttonType],
            ...customStyles?.buttonTextStyles,
            ...(Platform.OS === 'ios' ? {paddingBottom: 3} : {}),
          }}
        />
      </>
    );
  };

  return (
    <TouchableOpacity
      accessibilityRole={'button'}
      activeOpacity={0.7}
      {...rest}
      style={{
        ...(!isGradientButton && _style.size[size]),
        ...(!isGradientButton &&
          _style.type[buttonType](mode, disabled, backgroundColor)),
        ...customStyles?.buttonStyle,
      }}
      disabled={disabled}
      onPress={onPress}>
      {isGradientButton ? (
        <LinearGradient
          colors={gradientColors || ['#F4A460', '#DEB887']}
          start={gradientStart || {x: 0, y: 0}}
          end={gradientEnd || {x: 1, y: 1}}
          style={{
            ..._style.size[size],
            ..._style.type[buttonType || 'gradient'](
              mode,
              disabled,
              backgroundColor,
            ),
            ...customStyles?.buttonStyle,
          }}>
          {conditionalRender()}
        </LinearGradient>
      ) : (
        conditionalRender()
      )}
    </TouchableOpacity>
  );
};

export default CButton;
