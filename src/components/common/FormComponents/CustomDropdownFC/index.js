import React from 'react'
import { Controller } from 'react-hook-form'
import CustomDropdown from '../../../feature/uploadContent/CustomDropdown'

const CustomDropdownFC = ({ control, name, rules, ...rest }) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <CustomDropdown
          text={field.value}
          setSelectedOption={field.onChange}
          {...rest}
        />
      )}
    />
  )
}

export default CustomDropdownFC
