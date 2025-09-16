import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView } from 'react-native';
import { Divider } from 'react-native-elements';
import Modal from 'react-native-modal';
import { screenHeight } from '../../../../utils/common';
import Toaster from '../../../common/Toaster';
import CButton from '../../../common/core/Button';
import CheckBox from '../../../common/core/Checkbox';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';

const DropdownModal = ({
  isVisible,
  onClose,
  config = { type: 'custom', height: 0.5 },
  data,
  setItem,
  title,
}) => {
  const handleSwipeComplete = () => {
    onClose(false);
  };
  const [selectedItem, setSelectedItem] = useState([]);

  const handleDone = () => {
    setItem(selectedItem);
    onClose(false);
  };

  const handleItemSelection = item => {
    setSelectedItem(prevSelectedItem =>
      prevSelectedItem === item ? null : item
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleSwipeComplete}
      onBackButtonPress={handleSwipeComplete}
      swipeDirection={['down']}
      propagateSwipe
      style={{ ...styles.modal }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={config.type == 'max' ? false : true}
      onSwipeComplete={handleSwipeComplete}>
      <SafeAreaView
        style={{
          ...styles.modalContainer,
          height: screenHeight * (config.type == 'max' ? 1 : config.height),
        }}>
        <CView style={styles.modalContent}>
          <CView row style={styles.titleContainer}>
            <CView centered>
              <CText color="commonBlack" centered size="large">
                {title}
              </CText>
            </CView>
          </CView>
          <Divider />

          <ScrollView>
            {data?.map(item => (
              <Pressable
                key={item?.value}
                onPress={() => handleItemSelection(item)}>
                <CView row style={styles.itemContainer}>
                  <CText
                    color="commonBlack"
                    centered
                    size="medium"
                    style={styles.labelStyle}>
                    {item.label}
                  </CText>
                  <CheckBox
                    checked={selectedItem === item}
                    onPress={() => handleItemSelection(item)}
                  />
                </CView>
              </Pressable>
            ))}
          </ScrollView>
        </CView>
        <CView style={styles.buttonContainer}>
          <CButton
            size="large"
            buttonType="primary"
            text="Done"
            isGradientButton
            onPress={handleDone}
            customStyles={styles.submitBtn}
          />
        </CView>
        <Toaster />
      </SafeAreaView>
    </Modal>
  );
};

export default DropdownModal;
