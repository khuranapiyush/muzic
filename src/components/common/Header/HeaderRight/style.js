import {StyleSheet} from 'react-native';
import Colors from '../../Colors';

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: {
      alignItems: 'center',
    },
    leaderBoardWrapper: {marginHorizontal: 15},
    searchIcon: {height: 27, width: 27, tintColor: 'white'},
    subscribeIcon: {height: 30, width: 30},
    creditsWrapper: {
      backgroundColor: '#3C3029',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#C87D48',
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 40,
    },
    creditsText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
      textAlign: 'center',
    },
    coinWrapper: {
      backgroundColor: Colors[theme].categoryBg,
      paddingHorizontal: 5,
      paddingVertical: 5,
      borderRadius: 100,
    },
    xFanTVcoinWrapper: {
      backgroundColor: Colors[theme].categoryBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 100,
      marginRight: 10,
      padding: 0.5,
      borderColor: Colors[theme].categoryBg,
      borderWidth: 1,
    },
    coinBtnWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    },
    coinIcon: {height: 16, width: 16, marginRight: 3},
    coinValue: {
      marginTop: 3,
      fontWeight: '400',
      fontSize: 12,
      paddingLeft: 2,
      lineHeight: 14.4,
      textAlign: 'center',
      letterSpacing: 0.24,
      textTransform: 'capitalize',
    },
    searchWrapper: {
      marginRight: 10,
    },
  });
};

export default getStyles;
