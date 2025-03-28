import React from 'react';
import {Image, TouchableOpacity} from 'react-native';
import appImages from '../../../../resource/images';
import CText from '../../core/Text';
import CView from '../../core/View';
import getStyles from './style';
import {useTheme} from '@react-navigation/native';

const CustomDrawerItem = ({
  label,
  logoUrl,
  onPress,
  customStyles,
  arrow = true,
}) => {
  const {mode} = useTheme();
  const styles = getStyles(mode);

  return (
    <TouchableOpacity onPress={onPress}>
      <CView row style={{...styles.drawerItem, ...customStyles?.drawerItem}}>
        {logoUrl && (
          <Image
            source={logoUrl}
            style={{...styles.logo, ...customStyles?.logoStyles}}
          />
        )}
        <CText style={styles.drawerLabel}>{label}</CText>
        {arrow && <Image style={styles.icon} source={appImages.arrowBack} />}
      </CView>
    </TouchableOpacity>
  );
};

export default CustomDrawerItem;
