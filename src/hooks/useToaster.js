import Toast from 'react-native-toast-message';
import { useCallback } from 'react';

const useToaster = () => {
  const showToaster = useCallback((data = {}) => {
    Toast.show(data);
  }, []);

  return { showToaster };
};

export default useToaster;
