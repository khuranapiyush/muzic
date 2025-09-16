import React from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import CView from '../../../common/core/View';
import CText from '../../../common/core/Text';
import appImages from '../../../../resource/images';

const styles = StyleSheet.create({
  privilegeText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 17,
    marginLeft: 8,
  },
  benefits: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 19,
    marginLeft: 8,
  },
});

const PrivilegeText = ({ text }) => {
  return (
    <CView>
      {text != '' && text != null && (
        <CView row style={{ alignItems: 'center', marginVertical: 5 }}>
          <Icon name={'checkmark'} size={20} />
          <CText style={{ ...styles.privilegeText }}>{text}</CText>
        </CView>
      )}
    </CView>
  );
};

const TopPrivilegeText = ({ text }) => {
  return (
    <CView row style={{ alignItems: 'center', marginVertical: 5 }}>
      <Image source={appImages.star} style={{ width: 20, height: 20 }} />
      <CText style={{ ...styles.privilegeText, fontWeight: 'bold' }}>
        {text}
      </CText>
    </CView>
  );
};

const BenefitsText = ({ text }) => {
  return (
    <>
      {text != '' && text != null && (
        <CView row style={{ alignItems: 'center', marginVertical: 8 }}>
          <Image source={appImages.star} style={{ width: 18, height: 18 }} />
          <CText style={{ ...styles.privilegeText }}>{text}</CText>
        </CView>
      )}
    </>
  );
};

export { PrivilegeText, TopPrivilegeText, BenefitsText };
