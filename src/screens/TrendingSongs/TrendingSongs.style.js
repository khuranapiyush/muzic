import {StyleSheet} from 'react-native';
import Colors from '../../components/common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      flex: 1,
      paddingTop: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 0,
      marginBottom: 15,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      width: 28,
      height: 28,
      tintColor: Colors[theme]?.white || '#FFFFFF',
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: '700',
      color: '#FDF5E6',
      fontFamily: 'Nohemi',
      letterSpacing: -0.8,
      textTransform: 'capitalize',
    },
    listContentContainer: {
      paddingHorizontal: 24,
      paddingBottom: 100,
      paddingTop: 10,
    },
    songCard: {
      width: '100%',
      marginBottom: 12,
      marginHorizontal: 'auto',
      alignSelf: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#2A2A2A',
      backgroundColor: '#1E1E1E',
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    playingSongCard: {
      borderColor: '#FF7E85',
      backgroundColor: '#2A1F1F',
    },
    gradient: {
      padding: 0,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      paddingHorizontal: 16,
    },
    songImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
      marginRight: 12,
    },
    songInfo: {
      flex: 1,
      justifyContent: 'center',
      marginRight: 12,
    },
    songTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: 4,
      fontFamily: 'Nohemi',
    },
    duration: {
      fontSize: 14,
      color: '#B0B0B0',
      fontFamily: 'Nohemi',
    },
    playButton: {
      marginLeft: 12,
    },
    playIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(244, 164, 96, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    playIcon: {
      width: 16,
      height: 16,
      tintColor: '#FFFFFF',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: '#B0B0B0',
      fontFamily: 'Nohemi',
    },
  });
};

export default getStyles;
