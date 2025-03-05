import React from 'react';
import {TextInput} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Colors from '../Colors';
import getStyles from './style';

const CTextInput = ({
  text,
  setText,
  placeholder = '',
  customStyles = {},
  onChangeText = () => {},
  ...rest
}) => {
  const handleTextChange = inputText => {
    setText(inputText);
    onChangeText(inputText);
  };

  const {mode} = useTheme();

  const styles = getStyles(mode);

  return (
    <TextInput
      {...rest}
      style={{
        color: Colors[mode].white,
        ...styles.input,
        ...customStyles,
      }}
      placeholder={placeholder}
      value={text}
      onChangeText={handleTextChange}
    />
  );
};

export default CTextInput;
