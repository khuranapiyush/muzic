import { StyleSheet } from 'react-native';
import Colors from '../../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: { alignItems: 'center' },
    historyStyle: {
      color: '#E14084',
    },
    coinWrapper: {
      backgroundColor: '#d8d8d8',
      paddingHorizontal: 5,
      paddingVertical: 5,
      borderRadius: 100,
      marginLeft: 15,
    },
    coinBtnWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    xFanTVcoinWrapper: {
      backgroundColor: Colors[theme].categoryBg,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 100,
      marginLeft: 10,

      backdropFilter: 'blur(4px)',
      boxShadow: '0px 1px 4px 0px #00000040',
      padding: 0.5,
      borderColor: Colors[theme].categoryBg,
      borderWidth: 1,
    },
    coinIcon: { height: 16, width: 16, marginRight: 3 },
    coinValue: { fontWeight: '500', fontSize: 14, paddingRight: 2 },

    // coinIcon: { height: 24, width: 24, marginRight: 3 },
  });
};
export default getStyles;
