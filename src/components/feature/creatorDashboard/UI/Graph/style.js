import { StyleSheet } from 'react-native'
import Colors from '../../../../common/Colors'

const getStyle = theme => {
  return StyleSheet.create({
    wrapper: {
      paddingTop: 10,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderRadius: 12,
      borderColor: Colors?.[theme]?.cardBorderColor,
      backgroundColor: Colors?.[theme]?.cardBg
    },
    headingContainer: {
      justifyContent: 'space-between'
    },
    lastDaysStyle: {
      // backgroundColor: '#EDECEC',
      borderRadius: 8,
      padding: 6
    },
    graphStyle: {
      marginVertical: 10,
      marginLeft: -10
    },
    marginBottom8: { marginBottom: 8 },
    graphTitle: { color: '#959595', paddingBottom: 10 }
  })
}
export default getStyle
