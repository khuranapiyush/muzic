import React from 'react';
import {Controller} from 'react-hook-form';
import CountryPickerDropdown from '../../CountryPickerDropdown';
const CountryPickerDropdownFC = ({control, name, rules, ...rest}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({field}) => (
        <CountryPickerDropdown
          country={field.value}
          setSelectedCountry={field.onChange}
          {...rest}
        />
      )}
    />
  );
};

export default CountryPickerDropdownFC;
