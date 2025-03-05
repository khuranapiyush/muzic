import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { videoDetailsBySlug } from '../api/watch'
import { linkType } from '../constants/constant'
import { setFullModePlayer } from '../stores/slices/watch'
import { get } from '../utils/common'
import useModal from './useModal'
import { useAuthUser } from '../stores/selector'
import useToaster from './useToaster'
import { shortieDetailsBySlug } from '../api/shortie'
import { getAppConfig } from '../constants/code'
import { setTrackData } from '../stores/slices/shortiePlayer'
import { useNavigation } from '@react-navigation/native'
import ROUTE_NAME from '../navigator/config/routeName'

const useIntent = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const { showModal, hideModal } = useModal()
  const { isLoggedIn } = useSelector(useAuthUser)
  const { showToaster } = useToaster()

  const {
    mutate: fetchVideoDetailsBySlug,
    isLoading: isHandleVideoIntentLoading
  } = useMutation(slug => videoDetailsBySlug(slug), {
    onSuccess: response => {
      let detail = get(response, 'data.data', null)
      dispatch(setFullModePlayer({ isVisible: true, videoDetail: detail }))
    },
    onError: error => {}
  })

  const { mutate: fetchShortieDetailsBySlug } = useMutation(
    slug => shortieDetailsBySlug(slug),
    {
      onSuccess: response => {
        let detail = get(response, 'data.data', null)
        const shortieData = {
          ...detail,
          meta: {
            pageId: getAppConfig('page', 'home'),
            eventName: 'shared',
            order: 1,
            viewType: '20',
            type: 'shorties'
          }
        }
        dispatch(setTrackData({ shortieDetail: shortieData }))
        navigation.navigate(ROUTE_NAME.Shorties, { data: shortieData })
      },
      onError: error => {}
    }
  )

  const handleVideoIntent = useCallback(
    (params, type) => {
      let slug = ''

      if (type == linkType.deferred) {
        const { slug: slugTitle, slug_key: slugKey } = params

        slug = `${slugTitle}-${slugKey}`
      } else if (type == linkType.deep) {
        const slugTitle = params.searchParams.get('slug')
        const slugKey = params.searchParams.get('slug_key')
        slug = `${slugTitle}-${slugKey}`
      } else if (type == linkType.universal) {
        const segments = params.split('/').filter(Boolean)

        slug = segments[1]

        !!slug && fetchVideoDetailsBySlug(slug)
      } else {
        throw Error('Please provide type of linking')
      }

      fetchVideoDetailsBySlug(slug)
    },
    [fetchVideoDetailsBySlug]
  )
  const handleReferralIntent = useCallback(
    (params, type = 'deferred') => {
      if (type == linkType.deferred) {
        if (!isLoggedIn) {
          showModal('auth', {
            isVisible: true,
            navigationData: {
              formData: { isReferralCode: true, referralCode: params?.ic }
            },
            onClose: () => hideModal('auth')
          })
        } else {
          showToaster({
            type: 'error',
            text1: 'Referral Not Applicable',
            text2: 'You are already registered '
          })
        }
      } else if (type == linkType.deep || type == linkType.universal) {
        const ic = params.searchParams.get('ic')
        if (!isLoggedIn) {
          showModal('auth', {
            isVisible: true,
            navigationData: {
              formData: { isReferralCode: true, referralCode: ic }
            },
            onClose: () => hideModal('auth')
          })
        } else {
          showToaster({
            type: 'error',
            text1: 'Referral Not Applicable',
            text2: 'You are already registered '
          })
        }
      } else if (type == linkType.universal) {
      } else {
        throw Error('Please provide type of linking')
      }
    },
    [hideModal, isLoggedIn, showModal, showToaster]
  )

  const handleVerifyEmail = useCallback(
    (params, type) => {
      if (type == linkType.deep) {
        const token = params.searchParams.get('token')

        showModal('mobileVerification', {
          isVisible: true,
          config: { type: 'custom' },
          navigationData: {
            useAs: { name: 'verifyEmail', params: { token } }
          },
          onClose: () => hideModal('mobileVerification')
        })
      }
    },
    [hideModal, showModal]
  )

  const handleShortieIntent = useCallback(
    (params, type) => {
      let slug = ''
      if (type == linkType.deferred) {
        const { slug: slugTitle, slug_key: slugKey } = params
        slug = `${slugTitle}-${slugKey}`
      } else if (type == linkType.deep) {
        const segments = params.split('/').filter(Boolean)
        slug = segments[1]
      } else if (type == linkType.universal) {
        const segments = params.split('/').filter(Boolean)
        slug = segments[1]
        !!slug && fetchShortieDetailsBySlug(slug)
      } else {
        throw Error('Please provide type of linking')
      }
      fetchShortieDetailsBySlug(slug)
    },
    [fetchShortieDetailsBySlug]
  )

  return {
    handleVideoIntent,
    handleReferralIntent,
    handleVerifyEmail,
    handleShortieIntent
  }
}

export default useIntent
