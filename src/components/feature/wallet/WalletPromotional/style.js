import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    levelContainer: {
      marginTop: 10,
      paddingVertical: 16,
      borderColor: Colors[theme].cardBorderColor,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: Colors[theme].cardBg,
      justifyContent: 'space-around'
    },
    walletCoinContainer: {
      marginTop: 10,
      borderRadius: 8,
      backgroundColor: Colors[theme].iconBg
    },
    itemContainer: {
      flex: 1,
      paddingHorizontal: 2
    },
    image: {
      alignSelf: 'center'
    },
    greenTickImage: {
      position: 'absolute',
      right: 16,
      height: 16,
      width: 16
    },
    textAlign: {
      paddingVertical: 5
    },
    coinContainer: {
      marginTop: 8
    },
    walletCoinIcon: {
      backgroundColor: Colors[theme].iconBg,
      padding: 8,
      borderRadius: 8
    },

    coinStyle: {
      height: 30,
      width: 30,
      tintColor: Colors[theme].appBg,
      alignSelf: 'center'
    },
    gradientBackground: {
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.5)', // Equivalent to #FFFFFF80

      shadowColor: '#000000', // Color of the shadow
      shadowOffset: { width: 0, height: 0 }, // Position of the shadow
      shadowOpacity: 0.25, // Equivalent to 40% opacity (approximately)
      shadowRadius: 4, // Shadow spread radius
      elevation: 4,
      padding: 6
    },
    walletIconContainer: {
      backgroundColor: '#FFFFFF1F',
      padding: 6,
      borderRadius: 4,
      shadowColor: '#000000', // Shadow color
      shadowOffset: { width: 0, height: 1 }, // Vertical offset for slight shadow below
      shadowOpacity: 0.44, // Approximately 70% opacity (0.7)
      shadowRadius: 4, // Blurs the shadow
      elevation: 4,
      borderWidth: 0.25, // Closest approximation to 0.25px
      borderColor: 'rgba(138, 138, 138, 1)' // #8A8A8A in RGBA
    },
    iconStyle: {
      height: 16,
      width: 16,
      tintColor: '#1E1E1E'
    },
    currencyIConStyle: {
      height: 20,
      width: 20,
      objectFit: 'fill'
    },
    textStyle: {
      alignSelf: 'flex-start',
      paddingHorizontal: 2
    },
    walletContent: { paddingLeft: 10 },
    walletWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingTop: 20
    },
    paddingLeft10: {
      paddingLeft: 0
    },
    submitBtn: {
      fontWeight: '600'
    }
  })
}

export default getStyles
