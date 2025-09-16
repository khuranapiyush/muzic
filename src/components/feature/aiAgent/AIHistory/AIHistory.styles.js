import { StyleSheet } from 'react-native';
import Colors from '../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[theme].appBg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    backButton: {
      color: Colors[theme].textBlack,
      fontSize: 28,
      marginRight: 16,
    },
    headerTitle: {
      color: Colors[theme].textBlack,
      fontSize: 20,
      fontWeight: 'bold',
    },
    listContent: {
      padding: 16,
    },
    sectionHeader: {
      color: Colors[theme].textLightGray,
      fontSize: 14,
      marginBottom: 8,
      marginTop: 16,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors[theme].cardBg,
      padding: 8,
      borderRadius: 8,
      marginBottom: 8,
    },
    musicIconContainer: {
      width: 32,
      height: 32,
      backgroundColor: Colors[theme].appBg,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    musicIcon: {
      color: Colors[theme].textBlack,
      fontSize: 18,
    },
    promptText: {
      color: Colors[theme].textLightGray,
      flex: 1,
    },
    modalContainer: {
      width: '100%',
      backgroundColor: Colors[theme].cardBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalContent: {
      backgroundColor: Colors[theme].cardBg,
      borderRadius: 12,
      padding: 16,
      height: '100%',
    },
    modalTitle: {
      color: Colors[theme].textBlack,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    promptContainer: {
      backgroundColor: Colors[theme].appBg,
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
    },
    headingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 8,
    },
    modalPromptText: {
      color: Colors[theme].textBlack,
    },
    resultItem: {
      flexDirection: 'row',
      backgroundColor: Colors[theme].appBg,
      padding: 16,
      borderRadius: 8,
      marginBottom: 10,
    },
    resultIconContainer: {
      width: 48,
      height: 48,
      backgroundColor: '#FFD700',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    resultIcon: {
      color: Colors[theme].textBlack,
      fontSize: 24,
    },
    resultInfo: {
      flex: 1,
    },
    songName: {
      color: Colors[theme].textBlack,
      fontWeight: 'bold',
    },
    songStyle: {
      color: Colors[theme].textLightGray,
      fontSize: 12,
      marginTop: 4,
    },
    duration: {
      color: Colors[theme].textLightGray,
      fontSize: 12,
    },
    closeButton: {
      color: Colors[theme].textLightGray,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 16,
    },
    closeButtonText: {
      color: Colors[theme].textBlack,
      fontWeight: 'bold',
    },
    modal: {
      margin: 0,
      width: '100%',
      justifyContent: 'flex-end',
    },
    lyricsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 20,
      paddingHorizontal: 10,
      width: '100%',
    },
    lyricsHeader: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[theme].textBlack,
    },
    lyricsContent: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 15,
      color: Colors[theme].textLightGray,
    },
    lyricsText: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 15,
      color: Colors[theme].textLightGray,
    },
  });
};

export default getStyles;
