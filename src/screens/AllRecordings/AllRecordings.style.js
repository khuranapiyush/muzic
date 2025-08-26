import {StyleSheet, Platform, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

const getStyles = mode =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      flex: 1,
      paddingTop: Platform.OS === 'ios' ? 10 : 80,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      marginBottom: 16,
    },
    backArrowIcon: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      width: 40,
      height: 40,
      tintColor: '#FFF',
    },
    backButtonText: {
      color: '#F4A460',
      fontSize: 16,
      fontWeight: '600',
    },
    headerTitle: {
      color: '#FFF',
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: 24,
    },
    placeholder: {
      width: 60,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: '#FFF',
      fontSize: 16,
      marginTop: 16,
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
    recordingCard: {
      marginHorizontal: 10,
      marginBottom: 12,
      borderRadius: 16,
      overflow: 'hidden',
    },
    cardGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    recordingInfo: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    recordingIconContainer: {
      position: 'relative',
      marginRight: 16,
    },
    recordingIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#333',
      justifyContent: 'center',
      alignItems: 'center',
    },
    micIcon: {
      fontSize: 20,
    },
    playingIndicator: {
      position: 'absolute',
      top: -5,
      right: -5,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#F4A460',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playingText: {
      fontSize: 10,
      color: '#000',
    },
    recordingDetails: {
      flex: 1,
    },
    recordingName: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    recordingDuration: {
      color: '#999',
      fontSize: 14,
    },
    moreOptionsButton: {
      padding: 8,
    },
    moreOptionsText: {
      color: '#999',
      fontSize: 20,
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: 100,
    },
    emptyTitle: {
      color: '#FFF',
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 16,
      textAlign: 'center',
    },
    emptySubtitle: {
      color: '#999',
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#1A1A1A',
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 32,
      maxWidth: width - 64,
    },
    modalTitle: {
      color: '#FFF',
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 16,
      textAlign: 'center',
    },
    modalMessage: {
      color: '#CCC',
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#333',
    },
    deleteButton: {
      backgroundColor: '#FF4444',
    },
    cancelButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
    deleteButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default getStyles;
