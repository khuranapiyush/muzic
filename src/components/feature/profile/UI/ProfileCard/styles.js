import { StyleSheet } from 'react-native'
import Colors from '../../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: { marginRight: 16, marginVertical: 16 },
    badgeIcon: {
      width: 20,
      height: 20,
      position: 'absolute',
      top: -2,
      left: 44
    },
    profileStyleContainer: {
      shadowColor: '#FFFDD4', // Shadow color (white with yellow tint)
      shadowOffset: { width: 0, height: 0 }, // No offset
      shadowOpacity: 0.84, // Approximately 70% opacity
      shadowRadius: 44, // Large blur radius for a soft shadow
      elevation: 20
    },
    editWrapper: {
      width: 18,
      height: 18,
      backgroundColor: '#E0E0E0',
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      left: 46,
      top: 56
    },
    editIcon: { width: 14, height: 14 },
    topRightContainer: { paddingLeft: 8, alignItems: 'flex-start' },
    name: {
      marginTop: 15,
      fontSize: 20,
      fontWeight: '700',
      textTransform: 'uppercase'
    },
    userNameDashBoardContainer: {
      alignItems: 'center',
      marginTop: 2
    },
    userName: {
      color: Colors[theme].commonWhite,
      fontSize: 12,
      fontWeight: '400'
    },
    userNameContainer: {},
    dashboardContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15
    },
    dashboardText: { fontSize: 10, fontWeight: '400' },
    dashboardAngleIcon: { width: 8, height: 8 },
    walletContainer: { marginTop: 5, alignItems: 'center' },
    walletIdText: { fontSize: 14, fontWeight: '500' },
    walletAddressText: { color: '#FE9BF3', fontSize: 14, fontWeight: '500' },
    walletActionBtnWrapper: { marginLeft: 12 },
    walletOpenBtn: { marginRight: 8 },
    walletActionBtnIcon: {
      width: 12,
      height: 12,
      tintColor: Colors[theme].white
    },
    txnStatsContainer: { marginTop: 11 },
    txnStatsBtnWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#353535',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 80
    },
    txnStatsIcon: { height: 16, width: 16, marginRight: 5 },
    txnStatsValue: {
      fontWeight: '500',
      fontSize: 12,
      color: Colors[theme].commonWhite
    }
  })
}
export default getStyles
