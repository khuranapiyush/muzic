import {useEffect, useState} from 'react';
import DeviceInfo from 'react-native-device-info';

const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState();

  useEffect(() => {
    // Get the device ID
    const getDeviceId = async () => {
      try {
        const id = await DeviceInfo.getUniqueId();
        setDeviceId(id);
      } catch (error) {
        console.log('Error getting device ID:', error);
      }
    };

    getDeviceId();
  }, []);

  return deviceId;
};

export default useDeviceId;
