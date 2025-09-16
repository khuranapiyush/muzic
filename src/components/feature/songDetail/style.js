import { StyleSheet } from 'react-native';
import Colors from '../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    paddingTop10: {
      paddingTop: 8,
      paddingBottom: 5,
    },
    marginTop20: {
      marginTop: 20,
    },
    marginLeft4: {
      marginLeft: 4,
    },
    paddingTopLeftRight10: {
      paddingTop: 8,
      paddingHorizontal: 10,
    },
    graphLabelContainer: {
      marginHorizontal: 4,
      padding: 8,
      borderRadius: 5,
      borderWdith: 1,
      backgroundColor: 'lightgray',
    },
    graphSelectedLabel: {
      marginHorizontal: 4,
      padding: 8,
      borderRadius: 5,
      borderWidth: 1,
      backgroundColor: '#000',
    },
    graphContainer: {
      backgroundColor: Colors[theme].cardBg,
      borderRadius: 10,
      margin: 10,
      padding: 16,
      borderColor: Colors[theme].cardBorderColor,
      borderWidth: 1,
    },
    cardContainer: {
      width: '48%',
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 12,
      borderColor: Colors[theme].cardBorderColor,
      borderWidth: 1,
      backgroundColor: Colors[theme].cardBg,
    },
    modal: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 40,
    },
    titleContainer: {
      justifyContent: 'space-between',
      paddingBottom: 25,
    },
    closeButton: {
      alignItems: 'center',
      height: 30,
      width: 30,
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      elevation: 5,
      marginHorizontal: 16,
      flex: 1,
    },
    modalHeading: {
      marginBottom: 10,
      marginTop: 20,
      color: '#0B091C',
      fontWeight: '400',
      fontSize: 14,
    },
    topCollectorWrapper: {
      flexWrap: 'wrap',
      flexDirection: 'row',
    },
    smallTopCollectorWrapper: {
      paddingLeft: 5,
      alignItems: 'center',
      flex: 1,
      flexBasis: 'auto',
      flexWrap: 'wrap',
      // marginLeft: 12
    },
    collectorWrapper: {
      marginTop: 12,
      flex: 1,
      flexWrap: 'wrap',
    },
    collectorIcon: { width: 32, height: 32, borderRadius: 16 },
    collectorIconWrapper: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: '#000',
    },
    overlappedCollectorIconWrapper: {
      marginLeft: -8,
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: '#000',
    },
    largeCollectorIcon: {
      resizeMode: 'cover',
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.75)',
      margin: 5,
    },
    backgroundVideo: {
      ...StyleSheet.absoluteFillObject,
      flex: 1,
    },
    playerContainer: {
      marginTop: 15,
    },
    platerTitleWrapper: {
      marginTop: 12,
      paddingHorizontal: 10,
    },

    activeTabLabel: {
      color: Colors[theme].brandPink,
    },
    inactiveTabLabel: {
      color: Colors[theme].white,
    },

    tabContainer: {
      backgroundColor: 'transparent',
      borderBottomWidth: 1,
      borderBottomColor: '#c1c1c1',
    },
    activeIndicatorStyle: {
      backgroundColor: Colors[theme].brandPink,
      height: 2,
    },
    submitBtn: { fontWeight: '700' },
    btnContainer: { paddingTop: 10, justifyContent: 'space-around' },
    closeBtnWrapper: {
      flex: 1,
      margin: 'auto',
      alignSelf: 'flex-end',
      position: 'absolute',
      justifyContent: 'flex-end',
      top: 15,
      right: 20,
      zIndex: 9999,
    },
    closeIcon: {
      height: 28,
      width: 28,
    },
  });
};
export default getStyles;
