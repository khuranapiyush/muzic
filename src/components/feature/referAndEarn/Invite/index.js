import React, {useCallback, useMemo, useState} from 'react';
import CView from '../../../common/core/View';
import CText from '../../../common/core/Text';
import {useQuery} from '@tanstack/react-query';
import {fetchInviteCondition} from '../../../../api/referAndEarn';
import Share from 'react-native-share';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import getStyle from './style';
import {screenWidth} from '../../../../utils/common';
import {useSelector} from 'react-redux';
import config from 'react-native-config';
import appImages from '../../../../resource/images';
import Clipboard from 'react-native';
import useToaster from '../../../../hooks/useToaster';
import {useTheme} from '@react-navigation/native';
import Colors from '../../../common/Colors';

const Invite = () => {
  const {showToaster} = useToaster();
  const [inviteConditions, setInviteConditions] = useState([]);
  const {mode} = useTheme();
  const styles = getStyle(mode);

  const tagsStyles = {
    body: {
      whiteSpace: 'normal',
      color: Colors[mode].white,
    },
    a: {
      color: 'green',
    },
  };

  const {referralId} = useSelector(state => state.user);

  const referralLink = useMemo(
    () => `https://fantv.app.link/refer?ic=${referralId?.refCode}`,
    [referralId?.refCode],
  );

  useQuery({
    queryKey: ['fetchInviteCondition'],
    queryFn: fetchInviteCondition,
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data;
      setInviteConditions(data);
    },
  });

  const handleLinkCopy = useCallback(() => {
    Clipboard.setString(referralLink);
    showToaster({
      type: 'success',
      text1: 'Link Copied',
      text2: '',
    });
  }, [referralLink, showToaster]);

  const handleWhatsAppPress = useCallback(async () => {
    const shareOptions = {
      title:
        '\nDiscover New Music, Invest and Own Music | Earn Royalty and Rewards',
      url: referralLink,
      social: Share.Social.WHATSAPP,
    };
    Share.shareSingle(shareOptions)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        err && console.log(err);
      });
  }, [referralLink]);

  const shareOptions = useMemo(
    () => ({
      title:
        '\nDiscover New Music, Invest and Own Music | Earn Royalty and Rewards',
      url: referralLink,
    }),
    [referralLink],
  );

  const handleMoreIconPress = useCallback(async () => {
    const result = await Share.open({
      ...shareOptions,
    });
    if (result.action === Share.sharedAction) {
    } else if (result.action === Share.dismissedAction) {
    }
  }, [shareOptions]);

  return (
    <ScrollView>
      <CView>
        {inviteConditions?.length > 0 ? (
          inviteConditions.map((item, i) => (
            <CView row key={i} style={styles.container}>
              <Image source={{uri: item.icon}} style={styles.iconStyle} />
              <CText style={styles.textStyle}>
                <RenderHtml
                  contentWidth={screenWidth}
                  source={{html: item.text}}
                  tagsStyles={tagsStyles}
                />
              </CText>
            </CView>
          ))
        ) : (
          <ActivityIndicator
            style={styles.container}
            color={Colors[mode].brandPink}
            size={'large'}
          />
        )}

        <CView style={styles.paddingTop20}>
          <CText centered style={styles.grayColor}>
            Your Referral code:
          </CText>

          <CView row centered style={styles.codeWrapper}>
            <CText size="normalBold" style={styles.linkStyle} centered>
              {referralLink}
            </CText>
            <TouchableOpacity onPress={handleLinkCopy}>
              <Image
                source={appImages.copyIcon}
                style={styles.smallIconStyle}
              />
            </TouchableOpacity>
          </CView>
        </CView>
        <CView style={styles.paddingTop20}>
          <CText centered style={styles.grayColor}>
            or share via
          </CText>
        </CView>
        <CView row centered>
          {/* <TouchableOpacity onPress={handleWhatsAppPress}>
            <Image
              source={appImages.whatsappIcon}
              style={styles.shareIconStyle}
            />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={handleLinkCopy}>
            <Image source={appImages.copyIcon} style={styles.shareIconStyle} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMoreIconPress}>
            <Image
              source={appImages.moreCircleIcon}
              style={styles.shareIconStyle}
            />
          </TouchableOpacity>
        </CView>
      </CView>
    </ScrollView>
  );
};

export default Invite;
