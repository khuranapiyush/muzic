import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    levelContainer: {
      // marginTop: 10,
      // paddingVertical: 16,
      borderColor: Colors[theme].earnCoinLvLBorder,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: Colors[theme].earnCoinLvLBG,
      // padding: 16,
      // paddingBottom: 22,
      flex: 1
    },
    itemContainer: {
      flex: 1,
      paddingHorizontal: 8
    },

    container: {
      padding: 16,
      paddingBottom: 22,
      marginTop: 10,
      paddingVertical: 16
    },
    shadowContainer: {
      height: 50,
      shadowColor: '#6B61FF', // Shadow color (white with yellow tint)
      shadowOffset: { width: 0, height: 0 }, // No offset
      shadowOpacity: 0.94, // Approximately 70% opacity
      shadowRadius: 44, // Large blur radius for a soft shadow
      elevation: 20
    },
    image: {
      alignSelf: 'center',
      height: 45,
      width: 45
    },
    greenTickImage: {
      marginTop: 10,
      alignSelf: 'center',
      height: 16,
      width: 16
    },
    textAlign: {
      paddingVertical: 5,
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
      color: Colors[theme].activeFilterText
    }
  })
}

export default getStyles
