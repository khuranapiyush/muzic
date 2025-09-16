import { useSelector } from 'react-redux';

const useKycCheckHook = () => {
  const userData = useSelector(state => state.user);
  const isKycCompleted = () => {
    if (
      userData?.kycStatus == 'auto_approved' ||
      userData?.kycStatus == 'manually_approved'
    ) {
      return true;
    } else {
      return false;
    }
  };

  return [isKycCompleted];
};
export default useKycCheckHook;
