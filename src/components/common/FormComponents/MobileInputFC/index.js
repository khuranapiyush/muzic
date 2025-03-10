import React from 'react';
import {Controller} from 'react-hook-form';
import MobileInput from '../../MobileInput';

const MobileInputFC = ({control, name, rules, customStyles, ...rest}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={{
        pattern: {
          value: /^\d+$/,
          message: 'Invalid phone number',
        },
        minLength: {
          value: 6,
          message: 'Phone number must be at least 6 digits',
        },
        maxLength: {
          value: 14,
          message: 'Phone number must be at most 14 digits',
        },
        ...rules,
      }}
      render={({field}) => (
        <MobileInput
          mobileNumber={field.value}
          setMobileNumber={field.onChange}
          customStyles={customStyles}
          {...rest}
        />
      )}
    />
  );
};

export default MobileInputFC;
