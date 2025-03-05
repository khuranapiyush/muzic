import React, {Fragment, createContext, useCallback, useState} from 'react';
import SoftUpdateModal from '../components/common/Modal/SoftUpdate';
import HardUpdateModal from '../components/common/Modal/HardUpdate';
import MobileVerification from '../components/common/Modal/MobileVerification';
import AuthModal from '../components/common/Modal/Auth';

const ModalContext = createContext();

export const ModalProvider = ({children}) => {
  const [isModalVisible, setIsModalVisible] = useState({
    auth: {state: false, props: {}},
    softUpdate: {state: false, props: {}},
    hardUpdate: {state: false, props: {}},
    deleteAccount: {state: false, props: {}},
    videoDescription: {state: false, props: {}},
    mobileVerification: {state: false, props: {}},
    liveChat: {state: false, props: {}},
    tippingModal: {state: false, props: {}},
  });

  const showModal = useCallback((type, props) => {
    setIsModalVisible(prev => ({
      ...prev,
      [type]: {state: true, props: props || {}},
    }));
  }, []);

  const hideModal = useCallback((type, props) => {
    setIsModalVisible(prev => ({
      ...prev,
      [type]: {state: false, props: props || {}},
    }));
  }, []);

  const getModalComponent = useCallback((type, props) => {
    switch (type) {
      case 'auth':
        return <AuthModal {...props} />;
      case 'softUpdate':
        return <SoftUpdateModal {...props} />;
      case 'hardUpdate':
        return <HardUpdateModal {...props} />;
      case 'mobileVerification':
        return <MobileVerification {...props} />;
      default:
        return null;
    }
  }, []);

  const renderModals = useCallback(() => {
    return Object.keys(isModalVisible).map(type => {
      const {state, props} = isModalVisible[type];
      return state ? (
        <Fragment key={type}>{getModalComponent(type, props)}</Fragment>
      ) : null;
    });
  }, [getModalComponent, isModalVisible]);

  return (
    <ModalContext.Provider value={{showModal, hideModal}}>
      {children}
      {renderModals()}
    </ModalContext.Provider>
  );
};

export default ModalContext;
