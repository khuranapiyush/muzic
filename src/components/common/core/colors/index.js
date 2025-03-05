const Palette = {
  profit: '#54B5BB',
  loss: '#FB3836',
  white: '#FFF',
  black: '#000',
  transparent: 'transparent',
  purpleDaffodil: '#B237F6',
  cerisePink: '#E94177',
  fountainBlue: '#54b5bb',
  brandPink: '#E14084',
  background: '#222222',
  error: '#FB3836',
  success: '#48B16E',
  brandBlue: '#3454FA',
  bgDark2: '#242033',
  appBG: '#0C091B',
  textDark: '#929099',
  bgHbm: '#0B0D0F',
  gray: '#959595',
  lightSecondaryBackground: '#F5F5F5',
  darkSecondaryBackground: '#353535'
}

const Format = {
  offer: Palette.orange4,
  cards: Palette.pink3,
  battle: Palette.purple3,
  fantasy: Palette.green3,
  tournament: Palette.blue3,
  leaderboard: Palette.orangeA
}

const Theme = {
  light: {
    core: {
      highlight: Palette.yellowA,
      error: Palette.orangeA,
      success: Palette.green3,
      primary: Palette.black,
      primaryInv: Palette.white
    },
    base: {
      primary: Palette.black,
      primaryInv: Palette.white,
      avatarBg: Palette.fountainBlue,
      brandPink: Palette.brandPink,
      background: Palette.background,
      secondaryBackground: Palette.lightSecondaryBackground
    },
    surface: {
      primary: Palette.white,
      secondary: Palette.grey1,
      disabled: Palette.black5,
      overlay: Palette.black90
    },
    onSurface: {
      primary: Palette.black,
      secondary: Palette.black60,
      disabled: Palette.black30,

      primaryInv: Palette.white,
      secondaryInv: Palette.white60,
      disabledInv: Palette.white30
    },
    border: {
      primary: Palette.black15,
      primaryInv: Palette.white30
    },
    footer: {
      primary: Palette.white
    },
    tint: {
      yellow: Palette.yellow1,
      orange: Palette.orange1,
      red: Palette.red1,
      purple: Palette.purple1,
      blue: Palette.blue1,
      green: Palette.green1,
      gray: Palette.gray
    },
    gradient: {
      gradientFirst: [Palette.purpleDaffodil, Palette.cerisePink]
    }
  },
  dark: {
    core: {
      primary: Palette.red3,
      highlight: Palette.yellowA,
      error: Palette.orange2,
      success: Palette.green2
    },
    base: {
      primary: Palette.black,
      primaryInv: Palette.white,
      avatarBg: Palette.fountainBlue,
      brandPink: Palette.brandPink,
      background: Palette.background,
      secondaryBackground: Palette.darkSecondaryBackground
    },
    surface: {
      primary: Palette.black,
      secondary: Palette.grey4,
      disabled: Palette.white10,
      overlay: Palette.black90
    },
    onSurface: {
      primary: Palette.white,
      secondary: Palette.white60,
      disabled: Palette.white30,

      primaryInv: Palette.black,
      secondaryInv: Palette.black60,
      disabledInv: Palette.black30
    },
    border: {
      primary: Palette.white30,
      primaryInv: Palette.black15
    },
    footer: {
      primary: Palette.grey4
    },
    tint: {
      yellow: Palette.yellow5,
      orange: Palette.orange5,
      red: Palette.red5,
      purple: Palette.purple5,
      blue: Palette.blue5,
      green: Palette.green5,
      gray: Palette.gray
    },
    gradient: {
      gradient1: [Palette.yellow3, Palette.pinkA],
      gradient2: [Palette.pinkA, Palette.purple3],
      gradient3: [Palette.blueA, Palette.blue3],
      gradient4: [Palette.greenA, Palette.blue3],
      gradient5: [Palette.yellowA, Palette.blueA],
      gradient6: [Palette.yellowA, Palette.orange3],
      shadow: [Palette.white30, Palette.transparent],
      shadowRev: [Palette.transparent, Palette.white30]
    }
  }
}

const Colors = { Theme, Palette, Format }
export { Theme, Colors }
