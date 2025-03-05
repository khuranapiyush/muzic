import { StyleSheet } from 'react-native'
import Colors from '../../../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    faqContainer: {
      marginTop: 10,
      paddingVertical: 15,
      borderColor: Colors[theme].cardBorderColor,
      backgroundColor: Colors[theme].cardBg,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 10
    },
    itemCenter: {
      maxWidth: '90%',
      alignItems: 'center'
    },
    textContainer: {
      marginLeft: 5
    },
    detailContainer: {
      paddingTop: 10,
      paddingLeft: 8,
      justifyContent: 'space-between'
    },

    arrowIconStyle: {
      width: 24,
      height: 24,
      marginLeft: 8,
      tintColor: Colors[theme].white
    },

    rightAlignedItem: {
      flex: 1,
      justifyContent: 'flex-end'
    }
  })
}

export default getStyles
