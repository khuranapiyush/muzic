import {SafeAreaView, ScrollView} from 'react-native';
import React from 'react';
import CView from '../../../common/core/View';
import CText from '../../../common/core/Text';
import {useTheme} from '@react-navigation/native';
import getStyles from './AIHistory.styles';
import {screenHeight} from '../../../../utils/common';
import Modal from 'react-native-modal';
import MusicCard from '../AIGenerator/MusicCard';

const AIHistoryModal = ({
  isVisible,
  setIsModalVisible,
  selectedItem,
  tabHeading,
}) => {
  const {mode} = useTheme();
  const styles = getStyles(mode);

  const onClose = () => {
    setIsModalVisible(prev => ({...prev, isVisible: false}));
  };

  const getRenderDetail = tab => {
    switch (tab) {
      case 'video':
        return {
          heading: 'Video Description',
          placeholderText:
            'Describe the style of video and the topic you want, AI will generate a video for you',
          component: selectedItem ? (
            <MusicCard
              key={0}
              item={selectedItem?.data}
              songList={[selectedItem?.data]}
            />
          ) : null,
        };
      case 'lyrics':
        return {
          heading: 'Lyrics Description',
          placeholderText:
            'Describe the style of lyrics and the topic you want, AI will generate lyrics for you',
          component: selectedItem ? (
            <CView style={styles.lyricsContainer}>
              <CView style={styles.lyricsContent}>
                <CText style={styles.lyricsText}>{selectedItem?.data}</CText>
              </CView>
            </CView>
          ) : null,
        };
      default:
        return {
          heading: 'Description',
          component: null,
          placeholderText: 'Describe what you want to generate',
        };
    }
  };

  return (
    <Modal
      useNativeDriver={true}
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection={null}
      propagateSwipe
      style={{...styles.modal}}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={true}>
      <SafeAreaView
        style={{
          ...styles.modalContainer,
          height: screenHeight * 0.6,
        }}>
        <CView style={styles.modalContent}>
          <CView style={styles.headingContainer}>
            <CText style={styles.modalTitle}>Prompt</CText>
          </CView>
          <CView style={styles.promptContainer}>
            <CText style={styles.modalPromptText}>{selectedItem?.prompt}</CText>
          </CView>

          <ScrollView>{getRenderDetail(tabHeading).component}</ScrollView>
        </CView>
      </SafeAreaView>
    </Modal>
  );
};

export default AIHistoryModal;
