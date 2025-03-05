import React from 'react'
import { Controller } from 'react-hook-form'
import CheckBox from '../../core/Checkbox'

const CheckBoxFC = ({ control, name, rules, ...rest }) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <CheckBox
          checked={field.value}
          onPress={() => field.onChange(!field.value)}
          {...rest}
        />
      )}
    />
  )
}

export default CheckBoxFC
