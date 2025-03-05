import Clipboard from 'react-native';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {Image, Pressable, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import useToaster from '../../../../../hooks/useToaster';
import ROUTE_NAME from '../../../../../navigator/config/routeName';
import appImages from '../../../../../resource/images';
import {
  dollarToInrWithRupeeSign,
  formatWalletAddress,
} from '../../../../../utils/common';
import Avatar from '../../../../common/Avatar';
import CText from '../../../../common/core/Text';
import CView from '../../../../common/core/View';
import getStyles from './styles';
import Colors from '../../../../common/Colors';
import LinearGradient from 'react-native-linear-gradient';

const ProfileCard = ({theme}) => {
  const user = useSelector(state => state.user);

  const styles = getStyles(theme);
  const {isShowFeature} = useSelector(state => state.app);

  const {
    fantigerCoin: fanTvCoin,
    ioutoken: fantvToken,
    balance,
  } = useSelector(state => state.walletStats);

  const {showToaster} = useToaster();

  const navigation = useNavigation();

  const copyWalletAddress = useCallback(() => {
    Clipboard.setString(user?.walletAddress);
    showToaster({
      type: 'success',
      text1: 'Copied',
    });
  }, [showToaster, user?.walletAddress]);

  const handleDashBoardClick = () => {
    navigation.navigate(ROUTE_NAME.CreatorDashboard);
  };

  const openWalletOnChain = () => {
    navigation.navigate(ROUTE_NAME.CWebView, {url: user.walletUrl});
  };

  const handleUserNameClick = () => {
    navigation.navigate(ROUTE_NAME.CreatorDashboard);

    let obj = {
      _id: user?.userId || user?.id,
      name: user?.name,
      username: user?.username,
      stats: {follower: 0},
      isVerified: true,
      profilePic: user?.profilePic,
    };

    navigation.navigate(ROUTE_NAME.CreatorProfile, {
      creatorObj: obj,
    });
  };

  return (
    <CView centered style={styles.wrapper}>
      {user?.username && (
        <TouchableOpacity onPress={handleUserNameClick}>
          <LinearGradient
            colors={['#696969', '#4C4C4C']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={{
              borderRadius: 8,
              paddingHorizontal: 5,
              paddingVertical: 3,
            }}>
            <CText style={styles.userName}>@{user?.username}</CText>
          </LinearGradient>
        </TouchableOpacity>
      )}
      <CView style={styles.profileStyleContainer}>
        <Pressable
          onPress={() => {
            navigation.navigate(ROUTE_NAME.EditProfile);
          }}
          style={{marginTop: 18}}>
          <Avatar
            name={user?.name || 'User'}
            imageUrl={user?.profilePic}
            customStyles={{
              avatarContainer: {
                width: 72,
                height: 72,
                borderWidth: 1,
                borderColor: Colors[theme].cardBorderColor,
              },
            }}
          />
          {isShowFeature && (
            <Image source={{uri: user?.badgeUrl}} style={styles.badgeIcon} />
          )}
          <CView style={styles.editWrapper}>
            <Image source={appImages.editIcon} style={styles.editIcon} />
          </CView>
        </Pressable>
      </CView>

      <CText centered style={styles.name}>
        {user?.name}
      </CText>

      {isShowFeature && (
        <CView row style={styles.userNameDashBoardContainer}>
          {!!user.showDashboard && (
            <TouchableOpacity
              style={styles.dashboardContainer}
              onPress={handleDashBoardClick}>
              <CText style={styles.dashboardText}>View DashBoard</CText>
              <Image
                source={appImages.arrowRightAngle}
                style={styles.dashboardAngleIcon}
              />
            </TouchableOpacity>
          )}
        </CView>
      )}

      {user?.walletAddress && isShowFeature ? (
        <CView row style={styles.walletContainer}>
          <CText style={styles.walletIdText}>Wallet ID : {''}</CText>
          <CText style={styles.walletAddressText}>
            {formatWalletAddress(user?.walletAddress)}
          </CText>

          <CView row style={styles.walletActionBtnWrapper}>
            <TouchableOpacity
              style={styles.walletOpenBtn}
              onPress={openWalletOnChain}>
              <Image
                source={appImages.exportIcon}
                style={styles.walletActionBtnIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={copyWalletAddress}>
              <Image
                source={appImages.copyIcon}
                style={styles.walletActionBtnIcon}
              />
            </TouchableOpacity>
          </CView>
        </CView>
      ) : (
        <CView>
          <CText size="mediumBold">{user?.mobile || user?.email}</CText>
        </CView>
      )}

      {isShowFeature && (
        <CView row style={styles.txnStatsContainer}>
          <Pressable style={styles.txnStatsBtnWrapper}>
            <Image source={appImages.coin} style={styles.txnStatsIcon} />
            <CText style={styles.txnStatsValue}>{fanTvCoin}</CText>
          </Pressable>

          <Pressable style={{...styles.txnStatsBtnWrapper, marginLeft: 8}}>
            <Image
              source={appImages.xFanTvTokenIcon}
              style={styles.txnStatsIcon}
            />
            <CText style={styles.txnStatsValue}>{fantvToken}</CText>
          </Pressable>

          <Pressable style={{...styles.txnStatsBtnWrapper, marginLeft: 8}}>
            <Image
              source={appImages.walletIcon}
              style={{
                ...styles.txnStatsIcon,
              }}
            />
            <CText style={styles.txnStatsValue}>
              {dollarToInrWithRupeeSign(balance)?.toString()}
            </CText>
          </Pressable>
        </CView>
      )}
    </CView>
  );
};

export default ProfileCard;
