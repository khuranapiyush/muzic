import React /*, { useContext }*/ from 'react';
import {useDispatch} from 'react-redux';
// import { ThemeContext } from '../../../../context/ThemeContext'
import appImages from '../../../../resource/images';
import {resetUser} from '../../../../stores/slices/user';
import CView from '../../core/View';
import CustomDrawerItem from '../DrawerItem';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import {useNavigation} from '@react-navigation/native';
// import { TouchableOpacity } from 'react-native'
// import ToggleThemeBtn from '../../ToggleThemeBtn'
// import { storeData } from '../../../../utils/asyncStorage'

const DrawerFooter = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  // const { theme, updateTheme } = useContext(ThemeContext)

  const handleLogout = () => {
    dispatch(resetUser());
  };

  const deleteAccount = () => {
    // Handle the case when the user has no credits
    navigation.navigate(ROUTE_NAME.SubscriptionScreen);
  };

  // const updateCurrentTheme = () => {
  //   let mode
  //   mode = theme.mode === 'dark' ? 'light' : 'dark'
  //   let newTheme = { mode }
  //   storeData('appTheme', newTheme)
  //   updateTheme(newTheme)
  // }

  return (
    <CView>
      <CustomDrawerItem
        arrow={false}
        label="Subscribe"
        logoUrl={appImages.deleteIcon}
        onPress={deleteAccount}
      />
      <CustomDrawerItem
        arrow={false}
        label="Logout"
        logoUrl={appImages.logout}
        onPress={handleLogout}
      />
      {/* <TouchableOpacity onPress={() => updateCurrentTheme()}>
        <ToggleThemeBtn theme={theme} />
      </TouchableOpacity> */}
    </CView>
  );
};

export default DrawerFooter;
