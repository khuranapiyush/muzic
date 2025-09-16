import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import CView from '../../../common/core/View';
import CText from '../../../common/core/Text';
import { Slider } from '@miblanchard/react-native-slider';
import CButton from '../../../common/core/Button';

const StreamSlider = ({ sliderValue = 20, setSliderValue }) => {
  const onValueChange = newValue => {
    setSliderValue(newValue);
  };

  const renderThumb = useCallback(() => {
    return (
      <CView>
        <CButton
          size="small"
          buttonType="primary"
          text={sliderValue + ' Mn'}
          isGradientButton
          onPress={null}
          customStyles={{
            buttonStyle: {
              borderRadius: 4,
              height: 28,
              minWidth: 55,
              width: 64,
              fontSize: 10,
              paddingHorizontal: 2,
            },
          }}
        />
      </CView>
    );
  }, [sliderValue]);

  const renderTrackMark = item => {
    return (
      <CView>
        <CText>|</CText>
      </CView>
    );
  };
  return (
    <CView style={styles.container}>
      <Slider
        minimumValue={1}
        maximumValue={1000}
        value={sliderValue}
        step={10}
        onValueChange={onValueChange}
        renderThumbComponent={renderThumb}
        trackMarks={[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]}
        minimumTrackTintColor="#E14084"
        renderTrackMarkComponent={renderTrackMark}
        renderTrackMark={renderTrackMark}
        containerStyle={{ paddingHorizontal: 20 }}
        trackRightPadding={10}
        trackStyle={styles.trackStyle}
      />
    </CView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 10,
  },
  trackStyle: {
    backgroundColor: '#E14084',
    height: 2,
  },
});

export default StreamSlider;
