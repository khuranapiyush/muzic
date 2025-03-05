import React, { memo, useMemo } from 'react'
import {
  Button,
  Dimensions,
  Image,
  Pressable,
  TouchableOpacity
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { getAppConfig } from '../../../../constants/code'
import useEvent from '../../../../hooks/useEvent'
import { setFullModePlayer } from '../../../../stores/slices/watch'
import CarouselView from '../CarouselView'
import styles from './style'
import { handleVideoStartBannerEvent } from '../../../../events/video'
import CView from '../../../common/core/View'
import AutoHeightImage from 'react-native-auto-height-image'
import { screenWidth } from '../../../../utils/common'
import appImages from '../../../../resource/images'
import Colors from '../../../common/Colors'
import { useNavigation, useTheme } from '@react-navigation/native'
import CButton from '../../../common/core/Button'
import { resetCreatorBannerShow } from '../../../../stores/slices/home'
import ROUTE_NAME from '../../../../navigator/config/routeName'
import { useAuthUser } from '../../../../stores/selector'
import useModal from '../../../../hooks/useModal'

export const SLIDER_WIDTH = Dimensions.get('window').width
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH)

const CreatorBanner = ({ data }) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()

  const { showModal, hideModal } = useModal()

  const { isShowFeature } = useSelector(state => state.app)

  const { isGuest, isLoggedIn } = useSelector(useAuthUser)
  const isAuth = useMemo(() => !isGuest && isLoggedIn, [isGuest, isLoggedIn])

  const { isCreatorBannerShow } = useSelector(state => state.home)

  const handleClose = () => {
    dispatch(resetCreatorBannerShow())
  }
  const handleJoinNow = () => {
    if (isAuth) {
      navigation.push(ROUTE_NAME.Wallet)
    } else {
      showModal('auth', {
        isVisible: true,
        onClose: () => hideModal('auth')
      })
    }
  }

  return (
    <>
      {isCreatorBannerShow && isShowFeature && (
        <CView>
          <AutoHeightImage
            width={screenWidth}
            source={{ uri: data.items[0].image.imageUrl }}
          />
          <CView row style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={handleClose}>
              <Image
                source={appImages.closeIcon}
                style={{
                  ...styles.closeButtonStyle,
                  tintColor: '#FFF'
                }}
              />
            </TouchableOpacity>
          </CView>

          <CView style={styles.joinButtonContainer}>
            <CButton
              size="small"
              buttonType="tertiary"
              text={'Join Now'}
              isGradientButton={false}
              onPress={handleJoinNow}
              customStyles={{
                buttonTextStyles: styles.submitBtn,
                buttonStyle: {
                  alignSelf: 'flex-start',
                  height: 35,
                  backgroundColor: '#FFF',
                  borderColor: '#FFF'
                }
              }}
            />
          </CView>
        </CView>
      )}
    </>
  )
}

export default memo(CreatorBanner)
