import {useNavigation, useTheme} from '@react-navigation/native';
import React from 'react';
import {Image, TouchableOpacity} from 'react-native';
import Colors from '../../Colors';
import CView from '../../core/View';
import {useSelector} from 'react-redux';
import mixpanelAnalytics from '../../../utils/mixpanelAnalytics';

const HeaderLink = ({icon, link}) => {
  const {mode} = useTheme();

  const user = useSelector(state => state.user);

  const navigation = useNavigation();
  return (
    <CView>
      {link == 'Settings' ? (
        user.isInternational ? (
          <></>
        ) : (
          <TouchableOpacity
            onPress={() => {
              try {
                mixpanelAnalytics.trackEvent('settings_clicked', {
                  screen_name: 'Settings',
                  button_id: 'hdr_set_btn',
                });
              } catch (_) {}
              navigation.navigate(link);
            }}>
            <Image
              source={icon}
              style={{height: 24, width: 24, tintColor: Colors[mode].white}}
            />
          </TouchableOpacity>
        )
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate(link)}>
          <Image
            source={icon}
            style={{height: 24, width: 24, tintColor: Colors[mode].white}}
          />
        </TouchableOpacity>
      )}
    </CView>
  );
};

export default HeaderLink;
