import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch ({ message }) {
    console.log('🚀 ~ file: asyncStorage.js:8 ~ storeData ~ message:', message);
  }
};

export const getData = async key => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch ({ message }) {
    console.log('🚀 ~ file: asyncStorage.js:17 ~ getData ~ message:', message);
  }
};
