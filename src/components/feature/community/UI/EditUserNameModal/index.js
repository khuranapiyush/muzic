import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import React, {useState} from 'react';
import {ScrollView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import {useDispatch, useSelector} from 'react-redux';
import {updateUser, validateUserName} from '../../../../../api/user';
import {setUserData} from '../../../../../stores/slices/user';
import CTextInput from '../../../../common/CTextInput';
import Toaster from '../../../../common/Toaster';
import CButton from '../../../../common/core/Button';
import CText from '../../../../common/core/Text';
import CView from '../../../../common/core/View';
import styles from './styles';
import {showJoiningBonus} from '../../../../../stores/slices/community';
import ROUTE_NAME from '../../../../../navigator/config/routeName';
import {joinCommunity} from '../../../../../api/community';

const EditUserNameModal = ({isVisible, onClose, data, communityId}) => {
  const [username, setUsername] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    status: false,
    msg: '',
  });

  const {userId} = useSelector(state => state.user);

  const dispatch = useDispatch();

  const navigation = useNavigation();

  const {mutate: validateUsernameApi} = useMutation(
    data => validateUserName(data),
    {
      onSuccess: () => {
        updateUserApi({userId, data: {username: username.trim()}});
      },
      onError: err => {
        setValidationErrors({status: true, msg: err.response?.data.message});
      },
    },
  );

  const {mutate: joinCommunityApi} = useMutation(data => joinCommunity(data), {
    onSuccess: ({data}) => {
      dispatch(showJoiningBonus({status: true, data: data?.data}));
      onClose();
      navigation.navigate(ROUTE_NAME.CommunityChat);
    },
    onError: err => {
      console.log('🚀 ~ CommunityGroup ~ err:', err);
    },
  });

  const {mutate: updateUserApi} = useMutation(data => updateUser(data), {
    onSuccess: ({data}) => {
      dispatch(setUserData(data));
      joinCommunityApi({communityId});
    },
    onError: err => {
      setValidationErrors({status: true, msg: err.response?.data.message});
    },
  });

  const validateUsername = () => {
    const alphanumericRegex = /^[0-9a-z]+$/;
    let errors = [];

    if (username.length < 5 || username.length > 10) {
      errors.push('1. Must have min. 5 and max. 10 letters');
    }
    if (username !== username.toLowerCase()) {
      errors.push('2. Capital case not allowed');
    }
    if (!alphanumericRegex.test(username)) {
      errors.push('3. Must have an alphanumeric combination');
    }
    if (/[^0-9a-z]/.test(username)) {
      errors.push('4. No special characters allowed');
    }

    if (errors.length) {
    }

    return errors;
  };

  const handleCheckAvailability = () => {
    const errors = validateUsername();

    if (errors.length) {
      setValidationErrors({
        status: true,
        msg: 'Your typed Unique Username does not meet the criteria',
      });
    } else {
      setValidationErrors({
        status: false,
      });
      validateUsernameApi(username.trim());
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      swipeDirection={null}
      propagateSwipe
      style={{...styles.modal}}
      animationIn="slideInUp"
      onBackdropPress={onClose}
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={true}>
      <CView>
        <ScrollView contentContainerStyle={styles.content}>
          <LinearGradient
            colors={['#E14084', '#3454FA', '#54B5BB']}
            locations={[0.0373, 0.7343, 0.9658]}
            useAngle={true}
            style={{borderRadius: 10}}
            angle={117}>
            <CView style={styles.modalContainer}>
              <CView style={styles.innerModalItem}>
                <CView>
                  <CText style={styles.modalHeading}>Create Your</CText>
                  <CText style={styles.modalHeading}>Unique Username</CText>
                </CView>
                <CView centered style={styles.paddingLeftRight}>
                  <CTextInput
                    text={username}
                    autoComplete="off"
                    autoCorrect={false}
                    setText={setUsername}
                    placeholder="Enter your username"
                    autoCapitalize="none"
                    customStyles={{
                      input: {
                        marginTop: 20,
                        width: '100%',
                        backgroundColor: '#FFF',
                        borderRadius: 6,
                        borderWidth: 0.5,
                        borderColor: '#D1D1D1',
                      },
                    }}
                  />
                </CView>
                {validationErrors.status ? (
                  <CText style={styles.errorText}>{validationErrors.msg}</CText>
                ) : null}
                <CView centered>
                  <CButton
                    disabled={!username.length}
                    backgroundColor="#FFF"
                    size="large"
                    buttonType="secondary"
                    text="Check Availability"
                    onPress={handleCheckAvailability}
                    customStyles={{
                      buttonTextStyles: styles.submitBtn,
                      buttonStyle: {
                        borderRadius: 6,
                        borderColor: '#FFF',
                        marginTop: 12,
                      },
                    }}
                  />
                </CView>

                <CView style={{paddingTop: 10}}>
                  <CText
                    style={styles.textOpacityLight}
                    size="normal"
                    color="onSurface.primaryInv">
                    Unique Username must have
                  </CText>
                  {data?.data?.conditions?.map((item, idx) => (
                    <CView key={idx}>
                      <CText
                        style={styles.textOpacityLight}
                        color="onSurface.primaryInv"
                        size="extraSmall">
                        {item}
                      </CText>
                    </CView>
                  ))}
                </CView>
              </CView>
              <Toaster />
            </CView>
          </LinearGradient>
        </ScrollView>
      </CView>
    </Modal>
  );
};

export default EditUserNameModal;
