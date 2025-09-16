import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuthUser } from '../../../stores/selector';
import useModal from '../../../hooks/useModal';

const WithAuth = Component => {
  const WithAuthWrapper = props => {
    const { showModal, hideModal } = useModal();
    const { isGuest, isLoggedIn } = useSelector(useAuthUser);

    const { handleClick: handleParentClick, ...rest } = props;

    const isAuth = useMemo(() => !isGuest && isLoggedIn, [isGuest, isLoggedIn]);

    const handleClick = useCallback(
      data => {
        if (isAuth) {
          handleParentClick(data);
        } else {
          showModal('auth', {
            isVisible: true,
            onClose: () => hideModal('auth'),
          });
        }
      },
      [handleParentClick, hideModal, showModal, isAuth]
    );

    return (
      <Component withAuth isAuth={isAuth} handleClick={handleClick} {...rest} />
    );
  };

  return WithAuthWrapper;
};

export default WithAuth;
