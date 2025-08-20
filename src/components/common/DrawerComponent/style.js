import {StyleSheet} from 'react-native';

const getStyles = theme => {
  return StyleSheet.create({
    dividerStyle: {
      borderWidth: 1,
      borderColor: '#DBDBDE',
      marginTop: 16,
      marginBottom: 8,
      marginHorizontal: -16,
    },
    drawerComponentWrapper: {
      backgroundColor: '#000',
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
  });
};

export default getStyles;
