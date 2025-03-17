import React, {useContext} from 'react';
import {Image, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import useModal from '../../../../hooks/useModal';
import appImages from '../../../../resource/images';
import {useAuthUser} from '../../../../stores/selector';
import Avatar from '../../Avatar';
import CButton from '../../core/Button';
import CText from '../../core/Text';
import CView from '../../core/View';
import styles from './style';
import {ThemeContext} from '../../../../context/ThemeContext';
import Colors from '../../Colors';
import {useTheme} from '@react-navigation/native';

const DrawerHeader = ({navigation}) => {
  const {showModal, hideModal} = useModal();
  const {isGuest, isLoggedIn} = useSelector(useAuthUser);
  const user = useSelector(state => state.user);
  const {isShowFeature} = useSelector(state => state.app);

  const {mode} = useTheme();

  const closeDrawer = () => {
    navigation.closeDrawer();
  };
  const handleLogin = () => {
    showModal('auth', {
      isVisible: true,
      onClose: () => hideModal('auth'),
    });
  };

  return (
    <CView style={styles.wrapper}>
      <CView row style={styles.container}>
        {!isGuest && isLoggedIn ? (
          <CView row style={{flex: 3}}>
            <CView>
              <Avatar
                name={user?.name || 'User'}
                imageUrl={user?.profilePic}
                customStyles={{avatarContainer: {width: 48, height: 48}}}
              />
              {isShowFeature && (
                <Image
                  source={{uri: user?.badgeUrl}}
                  style={styles.badgeStyle}
                />
              )}
            </CView>
            <CView style={styles.contentContainer}>
              <CText style={styles.userStyle}>{user?.name}</CText>
              {isShowFeature && (
                <CText style={styles.userStyle}>{user?.userSubTitle}</CText>
              )}
            </CView>
          </CView>
        ) : (
          <CView>
            <CView>
              <CButton
                size="large"
                buttonType="primary"
                text="Login"
                isGradientButton
                onPress={handleLogin}
                customStyles={styles.submitBtn}
              />
            </CView>
          </CView>
        )}
        <CView row style={styles.closeButtonContainer}>
          <TouchableOpacity onPress={closeDrawer}>
            <Image
              source={appImages.closeIcon}
              style={{
                ...styles.closeButtonStyle,
                tintColor: Colors[mode].white,
              }}
            />
          </TouchableOpacity>
        </CView>
      </CView>
    </CView>
  );
};

export default DrawerHeader;
