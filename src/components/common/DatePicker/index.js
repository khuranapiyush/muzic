import moment from 'moment';
import React, {useState} from 'react';
import {Controller} from 'react-hook-form';
import {TouchableOpacity} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CTextInput from '../CTextInput';
import CView from '../core/View';

const DatePicker = ({control, name, placeholder}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date, onChange) => {
    const formattedDate = moment(date).format('YYYY/MM/DD');
    onChange(formattedDate);
    hideDatePicker();
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({field: {onChange, value}}) => (
        <CView>
          <TouchableOpacity onPress={showDatePicker}>
            <CView pointerEvents="none">
              <CTextInput
                value={value || ''}
                autoComplete="off"
                autoCorrect={false}
                placeholder={placeholder}
                editable={false}
              />
            </CView>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={date => handleConfirm(date, onChange)}
            onCancel={hideDatePicker}
            maximumDate={new Date()}
          />
        </CView>
      )}
    />
  );
};

export default DatePicker;
