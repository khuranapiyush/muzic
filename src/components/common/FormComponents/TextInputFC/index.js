import React from 'react';
import {Controller} from 'react-hook-form';
import CTextInput from '../../CTextInput';

const TextInputFC = ({
  control,
  name,
  rules,
  customStyles,
  onChangeText = () => {},
  ...rest
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({field}) => (
        <CTextInput
          text={field.value}
          setText={field.onChange}
          customStyles={customStyles}
          onChangeText={onChangeText}
          {...rest}
        />
      )}
    />
  );
};

export default TextInputFC;
