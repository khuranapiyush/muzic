import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { screenHeight } from '../../../../../../utils/common';
import CText from '../../../../../common/core/Text';
import CView from '../../../../../common/core/View';
import styles from './style';

const TermsAndConditionsModal = ({
  isVisible,
  onClose,
  config = { type: 'custom' },
  terms,
}) => {
  return (
    <Modal
      useNativeDriver={true}
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection={null}
      propagateSwipe
      style={{ ...styles.modal }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={config.type == 'max' ? false : true}>
      <SafeAreaView
        style={{
          ...styles.modalContainer,
          height: screenHeight * (config.type == 'max' ? 1 : 0.5),
        }}>
        <CView style={styles.modalContent}>
          <CText
            style={{ marginVertical: 16, fontWeight: '700', fontSize: 18 }}>
            Info
          </CText>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{
              paddingHorizontal: 20,
              flex: 1,
            }}>
            {terms.map((term, idx) => (
              <CView key={idx} style={{ marginBottom: 10 }}>
                <CText key={idx} style={{ color: 'grey', fontSize: 14 }}>
                  {term}
                </CText>
              </CView>
            ))}
          </ScrollView>
        </CView>
      </SafeAreaView>
    </Modal>
  );
};

export default TermsAndConditionsModal;
