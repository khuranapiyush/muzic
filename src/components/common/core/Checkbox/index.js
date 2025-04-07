import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Icon} from 'react-native-elements';

const CheckBox = ({
  checked,
  setIsChecked,
  title,
  customStyles = {},
  ...rest
}) => {
  return (
    <TouchableOpacity
      onPress={setIsChecked}
      style={[styles.container, customStyles.containerStyle]}
      activeOpacity={0.7}
      {...rest}>
      <View
        style={[
          styles.checkboxContainer,
          checked ? styles.checkboxChecked : styles.checkboxUnchecked,
          customStyles.checkboxStyle,
        ]}>
        {checked && (
          <Icon
            name="check"
            type="material"
            size={16}
            color="#FFFFFF"
            style={styles.checkIcon}
          />
        )}
      </View>
      {title && (
        <Text style={[styles.title, customStyles.titleStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#6B61FF',
    borderWidth: 0,
  },
  checkboxUnchecked: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6B61FF',
  },
  checkIcon: {
    marginTop: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
  },
});

export default CheckBox;
