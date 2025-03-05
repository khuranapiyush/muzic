import React, { useCallback, useMemo, useState } from 'react'
import { Image, TouchableOpacity } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import CText from '../../../../common/core/Text'
import CView from '../../../../common/core/View'
import { AuthFollowButton } from '../../../watch/UI/FollowButton'
import styles from './style'
import { useMutation } from '@tanstack/react-query'
import {
  shortieCreatorFollowUnfollow,
  shortieDislike,
  shortieLike
} from '../../../../../api/shortie'
import { AuthLikeButton } from '../../../watch/UI/LikeButton'
import { AuthShareButton } from '../../../../common/Button/ShareButton'
import { Slider } from '@miblanchard/react-native-slider'
import { useNavigation } from '@react-navigation/native'
import ROUTE_NAME from '../../../../../navigator/config/routeName'

const ShortieBottomItemComponent = ({ item, seekValue, duration }) => {
  const navigation = useNavigation()
  const [isLike, setIsLike] = useState(item.isLiked)
  const [isFollowed, setIsFollowed] = useState(item?.profile?.isFollowed)

  const handleFollowPressed = () => {
    creatorFollowing(item?.profile?._id)
  }

  const { mutate: creatorFollowing } = useMutation(
    id => shortieCreatorFollowUnfollow(id),
    {
      onSuccess: response => {
        setIsFollowed(!isFollowed)
      },
      onError: error => {
        console.log(error.response.data)
      }
    }
  )

  const shareOptions = useMemo(
    () => ({
      title: item?.title,
      url: `https://fantv.in/shorties/${item?.slugKey}`
    }),
    [item?.slugKey, item?.title]
  )

  const handleLikePressed = () => {
    if (isLike) {
      userDislikeShortie({
        id: item?._id
      })
    } else {
      userLikeShortie({ id: item?._id })
    }
  }

  const { mutate: userLikeShortie } = useMutation(data => shortieLike(data), {
    onSuccess: response => {
      setIsLike(true)
    },
    onError: error => {}
  })

  const { mutate: userDislikeShortie } = useMutation(
    data => shortieDislike(data),
    {
      onSuccess: response => {
        setIsLike(false)
      },
      onError: error => {}
    }
  )

  const handleCreatorProfile = useCallback(() => {
    navigation.pop()

    navigation.navigate(ROUTE_NAME.CreatorProfile, {
      creatorObj: item.profile
    })
  }, [item.profile, navigation])

  return (
    <LinearGradient
      colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 0.8)']}
      style={styles.bottomLeftItemContainer}>
      <CView row>
        <CView style={styles.leftSideItemContainer}>
          <CView style={styles.leftSideItems}>
            <TouchableOpacity onPress={handleCreatorProfile}>
              <CView row style={styles.alignItemsCenter}>
                <Image
                  source={{ uri: item?.profile?.avatar }}
                  style={styles.profileIcon}
                />
                <CText
                  size="smallBold"
                  color="commonWhite"
                  style={{ fontWeight: '600' }}>
                  {item?.profile?.name}
                </CText>
                <AuthFollowButton
                  following={isFollowed}
                  handleClick={handleFollowPressed}
                  customStyles={{
                    followContainer: styles.followContainer,
                    follow: styles.follow
                  }}
                />
              </CView>
            </TouchableOpacity>
            <CText
              numberOfLines={3}
              size="smallBold"
              color="commonWhite"
              style={styles.paddingInline10}>
              {item?.title}
            </CText>
          </CView>
        </CView>
        <CView style={{ flex: 1 }} />
        <CView style={styles.rightSideItemContainer}>
          <AuthLikeButton
            liked={isLike}
            likeFollow={item}
            countColor="commonWhite"
            handleClick={handleLikePressed}
            customStyles={{
              shareContainer: styles.btnContainer,
              likeBtnStyle: styles.btnIcon
            }}
          />
          <AuthShareButton
            shareOptions={shareOptions}
            onlyIcon
            customStyles={{
              shareContainer: styles.btnContainer,
              shareIconStyle: styles.btnIcon
            }}
          />
        </CView>
      </CView>
      <Slider
        containerStyle={[styles.sliderContainer]}
        value={seekValue}
        minimumValue={0}
        maximumValue={duration}
        minimumTrackTintColor="#EA4359"
        renderThumbComponent={() => null}
        maximumTrackTintColor="#ccc"
        thumbTouchSize={{ width: 0, height: 0 }}
        trackStyle={styles.trackStyle}
      />
    </LinearGradient>
  )
}

export default ShortieBottomItemComponent
