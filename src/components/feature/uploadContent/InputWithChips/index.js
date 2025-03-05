import React, {useState} from 'react';
import {Image, TextInput, TouchableOpacity} from 'react-native';
import appImages from '../../../../resource/images';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import style from './style';

const InputWithChips = ({text, setValue, ...rest}) => {
  const [chips, setChips] = useState(text);
  const [textInputValue, setTextInputValue] = useState('');

  const handleAddChip = () => {
    if (textInputValue.trim() !== '') {
      setChips([...chips, textInputValue]);
      setValue([...chips, textInputValue]);
      setTextInputValue('');
    }
  };

  const handleTextInputChange = text => {
    setTextInputValue(text);
  };

  const handleRemoveChip = index => {
    const updatedChips = [...chips];
    updatedChips.splice(index, 1);
    setChips(updatedChips);
    setValue(updatedChips);
  };

  return (
    <CView style={style.container}>
      <CView style={style.chipsContainer}>
        {chips?.length > 0 &&
          chips.map((label, index) => (
            <TouchableOpacity
              key={index}
              style={style.chip}
              onPress={() => handleRemoveChip(index)}>
              <CView centered row style={style?.inputContainer}>
                <CText color="commonBlack" size="medium" style={style.label}>
                  {label}
                </CText>
                <Image style={style.arrowIcon} source={appImages.closeIcon} />
              </CView>
            </TouchableOpacity>
          ))}
        <TextInput
          style={style.textInput}
          value={textInputValue}
          onChangeText={handleTextInputChange}
          placeholder="Add"
          onSubmitEditing={handleAddChip}
        />
      </CView>
    </CView>
  );
};

export default InputWithChips;
