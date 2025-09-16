import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import CText from '../../core/Text';
import { screenWidth } from '../../../../utils/common';
import CView from '../../core/View';

const PrimaryButton = ({ label, handlePress }) => {
  return (
    <CView row style={{ flex: 1, justifyContent: 'center' }}>
      <TouchableOpacity
        //disabled={!isValid}
        onPress={() => handlePress}>
        <CText>Login</CText>
      </TouchableOpacity>
    </CView>
  );
};
