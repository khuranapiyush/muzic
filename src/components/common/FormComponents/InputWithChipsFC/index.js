import React from 'react';
import { Controller } from 'react-hook-form';
import InputWithChips from '../../../feature/uploadContent/InputWithChips';

const InputWithChipsFC = ({ control, name, rules, ...rest }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <InputWithChips
          text={field.value}
          setValue={field.onChange}
          name="tags"
          control={control}
        />
      )}
    />
  );
};

export default InputWithChipsFC;
