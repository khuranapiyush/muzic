/* eslint-disable react-native/no-inline-styles */
import React, {memo, useContext} from 'react';
import {SafeAreaView} from 'react-native';
import CView from '../core/View';
import HeaderLeft from './HeaderLeft';
import HeaderRight from './HeaderRight';
import {ThemeContext} from '../../../context/ThemeContext';

const CustomHeader = props => {
  const {
    theme: {mode},
  } = useContext(ThemeContext);
  return (
    <SafeAreaView style={{backgroundColor: 'transparent'}}>
      <CView
        row
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 15,
          backgroundColor: 'transparent',
          marginTop: 15,
        }}>
        <HeaderLeft mode={mode} />
        <HeaderRight mode={mode} />
      </CView>
    </SafeAreaView>
  );
};

export default memo(CustomHeader);
