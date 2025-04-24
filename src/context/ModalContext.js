import React, {Fragment, createContext, useCallback, useState} from 'react';
import SoftUpdateModal from '../components/common/Modal/SoftUpdate';
import HardUpdateModal from '../components/common/Modal/HardUpdate';
import MobileVerification from '../components/common/Modal/MobileVerification';
import AuthModal from '../components/common/Modal/Auth';
import DeleteAccount from '../components/feature/auth/DeleteAccount';

// Create and export the context
export const ModalContext = createContext();

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
    console.log(`Showing modal: ${type}`, props);
    setIsModalVisible(prev => ({
      ...prev,
      [type]: {state: true, props: props || {}},
    }));
  }, []);

  const hideModal = useCallback((type, props) => {
    console.log(`Hiding modal: ${type}`, props);
    setIsModalVisible(prev => ({
      ...prev,
      [type]: {state: false, props: props || {}},
    }));
  }, []);

  const getModalComponent = useCallback(
    (type, props) => {
      switch (type) {
        case 'auth':
          return <AuthModal {...props} />;
        case 'softUpdate':
          return <SoftUpdateModal {...props} />;
        case 'hardUpdate':
          return <HardUpdateModal {...props} />;
        case 'mobileVerification':
          return <MobileVerification {...props} />;
        case 'deleteAccount':
          return (
            <DeleteAccount
              isVisible={true}
              onClose={() => hideModal('deleteAccount')}
              {...props}
            />
          );
        default:
          return null;
      }
    },
    [hideModal],
  );

  const renderModals = useCallback(() => {
    const visibleModals = Object.keys(isModalVisible).filter(
      type => isModalVisible[type].state,
    );

    if (visibleModals.length > 0) {
      console.log('Currently visible modals:', visibleModals);
    }

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

// Also export a default for backward compatibility
export default ModalContext;
