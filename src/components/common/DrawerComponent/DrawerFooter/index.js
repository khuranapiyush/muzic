import React /*, { useContext }*/ from 'react'
import { useDispatch } from 'react-redux'
// import { ThemeContext } from '../../../../context/ThemeContext'
import useModal from '../../../../hooks/useModal'
import appImages from '../../../../resource/images'
import { resetUser } from '../../../../stores/slices/user'
import CView from '../../core/View'
import CustomDrawerItem from '../DrawerItem'
// import { TouchableOpacity } from 'react-native'
// import ToggleThemeBtn from '../../ToggleThemeBtn'
// import { storeData } from '../../../../utils/asyncStorage'

const DrawerFooter = () => {
  const dispatch = useDispatch()
  const { showModal, hideModal } = useModal()
  // const { theme, updateTheme } = useContext(ThemeContext)

  const handleLogout = () => {
    dispatch(resetUser())
  }

  const deleteAccount = () => {
    showModal('deleteAccount', {
      isVisible: true,
      config: { type: 'custom' },
      onClose: () => hideModal('deleteAccount')
    })
  }

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
        label="Logout"
        logoUrl={appImages.logout}
        onPress={handleLogout}
      />
      {/* <CustomDrawerItem
        arrow={false}
        label="Delete Account"
        logoUrl={appImages.deleteIcon}
        onPress={deleteAccount}
      /> */}
      {/* <TouchableOpacity onPress={() => updateCurrentTheme()}>
        <ToggleThemeBtn theme={theme} />
      </TouchableOpacity> */}
    </CView>
  )
}

export default DrawerFooter
