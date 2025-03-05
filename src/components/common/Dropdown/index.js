import React from 'react'
import { Controller } from 'react-hook-form'
import { Image } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import appImages from '../../../resource/images'
import Colors from '../Colors'
import { useTheme } from '@react-navigation/native'

const Dropdown = ({ control, name, options }) => {
  const { mode } = useTheme()
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <RNPickerSelect
          value={field.value}
          onValueChange={field.onChange}
          items={options}
          Icon={() => (
            <Image
              source={appImages.arrowDownIcon}
              style={{
                height: 24,
                width: 24
              }}
            />
          )}
          style={{
            inputIOS: {
              borderWidth: 1,
              borderColor: '#DADADA',
              borderRadius: 12,
              fontSize: 14,
              height: 44,
              width: '100%',
              color: Colors[mode].white,
              paddingHorizontal: 15
            },
            iconContainer: {
              paddingRight: 10,
              paddingTop: 10
            }
          }}
          placeholder={{ label: 'Select your gender', value: null }}
        />
      )}
    />
  )
}

export default Dropdown
