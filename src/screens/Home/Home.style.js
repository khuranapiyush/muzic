import {StyleSheet} from 'react-native';

const getStyles = theme => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    menuButton: {
      padding: 8,
    },
    menuIcon: {
      width: 24,
      height: 2,
      backgroundColor: '#fff',
      marginVertical: 2,
    },
    logo: {
      width: 120,
      height: 24,
      resizeMode: 'contain',
    },
    searchButton: {
      padding: 8,
    },
    searchIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#fff',
    },
    content: {
      flex: 1,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginVertical: 20,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FDF5E6',
      lineHeight: 36,
      paddingVertical: 10,
      fontFamily: 'Bricolage Grotesque',
      letterSpacing: -0.8,
      textTransform: 'capitalize',
    },
    moreText: {
      color: '#666',
      fontSize: 16,
    },
    songCard: {
      minHeight: 250,
      minWidth: 180,
      height: 'fit-content',
      width: 'fit-content',
      marginLeft: 16,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#3C3129',
    },
    songThumbnail: {
      width: '100%',
      height: 160,
      backgroundColor: '#333',
      overflow: 'hidden',
    },
    thumbnailImage: {
      width: '100%',
      height: '100%',
    },
    playButton: {
      position: 'absolute',
      right: 8,
      bottom: 8,
      width: 32,
      height: 32,
      backgroundColor: '#ff6b6b',
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playIcon: {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderBottomWidth: 12,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: '#fff',
      transform: [{rotate: '90deg'}],
    },
    songTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
    },
    duration: {
      marginTop: 3,
      color: '#666',
      fontSize: 14,
    },
    audioPlayer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: '#ff8c42',
      borderRadius: 8,
      marginBottom: 10,
    },
    playerThumbnail: {
      width: 40,
      height: 40,
      borderRadius: 5,
    },
    playerInfo: {
      flex: 1,
      marginLeft: 12,
    },
    playerTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
    },
    playerSubtitle: {
      color: '#fff',
      opacity: 0.8,
      fontSize: 12,
    },
    playerDuration: {
      color: '#fff',
      opacity: 0.6,
      fontSize: 12,
    },
    pauseButton: {
      padding: 8,
    },
    pauseIcon: {
      width: 20,
      height: 20,
      backgroundColor: '#fff',
    },
    bottomNav: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#111',
    },
    navItem: {
      alignItems: 'center',
    },
    navText: {
      color: '#fff',
      marginTop: 4,
      fontSize: 12,
    },
    playButtonActive: {
      backgroundColor: '#4CAF50',
    },
    pauseIconActive: {
      width: 20,
      height: 20,
      backgroundColor: '#fff',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    playIconMini: {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: 10,
      borderRightWidth: 10,
      borderBottomWidth: 15,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: '#fff',
      transform: [{rotate: '90deg'}],
    },
    gradient: {
      flex: 1,
      width: '100%',
      height: 40,
      overflow: 'hidden',
      backgroundColor: '#3C3129',
    },
    contentContainer: {
      padding: 12,
    },
    title: {
      fontSize: 32,
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 32,
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

export default getStyles;
