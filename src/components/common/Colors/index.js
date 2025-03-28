const commonColor = {
  commonWhite: '#FFFFFF',
  commonBlack: '#000000',
  activeColor: '#DE5E69',
  deactiveColor: '#DE5E6950',
  boxActiveColor: '#DE5E6940',
  brandPink: '#E14084',
  profit: '#54B5BB',
  loss: '#FB3836',
  errorColor: '#E5392E',
  popupTextColor: '#000000',
  buttonBackground: '#6B61FF',
  lightGrayText: '#626262',
  trackColor: '#AFAFAF',
};

// Dark theme colors - the app is now locked to dark mode only
const dark = {
  white: '#FFFFFF',
  // appBg: '#1B0E37',
  appBg: '#1E1E1E',

  activeDotColor: '#E14084',
  inActiveDotColor: 'rgba(217, 217, 217, 0.50)',
  categoryBg: 'rgba(196, 196, 196, 0.15)',
  cardBg: '#353535',
  iconBg: '#1E1E1E',
  cardBorderColor: '#DADADA',
  borderColor: 'rgba(255, 255, 255, 0.20)',
  inputBg: '#2F2D3C',
  footerBG: '#0F0F0F',
  footerBorder: '#292929',
  similarSongTabColor: '#A5A5A5',
  similarSongTabBG: '#353535',

  textBlack: '#FFF',
  textGray: '#353535',
  textLightGray: '#D2D2D2',
  dailyStreakBg: '#784E30',
  activeEarningBg: '#53622C',
  activeFilterText: '#1E1E1E',

  inputBorderColor: '#3D3A51',
  communityMsgWrapper: '#201E34',
  secondaryBackground: '#353535',

  earnCoinLvLBorder: '#4A4A4A',
  earnCoinLvLBG: '#0C0C0C',
  chatOwnMsgBg: '#353262',

  brandNewPink: '#FE9BF3',

  ...commonColor,
};

// Light mode is now duplicated from dark mode
// This ensures components that try to use light mode still get dark mode colors
// App is now locked to dark mode only
const light = {...dark};

// Both light and dark are exported for compatibility
// But they now contain the same colors (dark theme)
export default {light, dark};
