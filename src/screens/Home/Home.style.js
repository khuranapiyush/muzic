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
      marginVertical: 18,
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
      width: 170,
      marginRight: 8,
      marginBottom: 0,
      borderRadius: 12,
      overflow: 'hidden',
    },
    songThumbnail: {
      width: '100%',
      height: 150,
      position: 'relative',
      overflow: 'hidden',
    },
    thumbnailImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    playButton: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: [{translateX: -20}, {translateY: -20}],
      width: 50,
      height: 50,
      backgroundColor: '#FD893A',
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    playIcon: {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderRadius: 4,
      borderStyle: 'solid',
      borderLeftWidth: 12,
      borderRightWidth: 12,
      borderBottomWidth: 18,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: '#fff',
      transform: [{rotate: '90deg'}],
    },
    songTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
      width: '100%',
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
      // backgroundColor: '#4CAF50',
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
      height: 70,
      overflow: 'hidden',
      backgroundColor: '#3C3129',
    },
    contentContainer: {
      padding: 12,
      height: '100%',
      justifyContent: 'space-between',
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
    playPauseIcon: {
      width: 24,
      height: 24,
      tintColor: '#FFFFFF',
      zIndex: 1,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionContainer: {
      marginBottom: 20,
    },
    songListContainer: {
      paddingLeft: 16,
      paddingRight: 4,
    },
  });
};

export default getStyles;
