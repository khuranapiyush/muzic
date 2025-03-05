import React from 'react'
import { Controller } from 'react-hook-form'
import MonetizeToggle from '../../../feature/uploadContent/MonetizeToggle'

const ToggleFC = ({ control, name, rules, ...rest }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <MonetizeToggle
          isActive={field.value}
          setToggle={field.onChange}
          {...rest}
        />
      )}
    />
  )
}

export default ToggleFC
