import { useNavigation, useTheme } from '@react-navigation/native'
import React, { memo, useRef } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  View
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useDispatch } from 'react-redux'
import { getAppConfig } from '../../../../constants/code'
import ROUTE_NAME from '../../../../navigator/config/routeName'
import { setTrackData } from '../../../../stores/slices/shortiePlayer'
import { numberFormatter } from '../../../../utils/common'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import styles from './style'
import Colors from '../../../common/Colors'
import { setIsWatchPageVisible } from '../../../../stores/slices/watch'
import appImages from '../../../../resource/images'

export const SLIDER_WIDTH = Dimensions.get('window').width
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.95)

const Live45 = ({ data }) => {
  const cgRef = useRef()
  const navigation = useNavigation()

  const handleCardClick = (item, index) => {
    navigation.navigate(ROUTE_NAME.ConsumerInstaLive, {
      roomId: item?.roomId,
      data: item
    })
  }

  const renderItem = ({ item, index }) => (
    <CView style={styles.Card30Container}>
      <Pressable
        style={styles.NewCardBody}
        onPress={() => handleCardClick(item, index)}>
        <CView style={styles.shadow}>
          <Image source={{ uri: item?.backgroundImg }} style={styles.image} />
        </CView>

        <CView row style={styles.topCardContent}>
          <CView row centered style={styles.liveTagContainer}>
            <CText color="commonWhite" size="normal" text="Live" />
            <Image
              source={appImages.liveIcon}
              style={{ width: 20, height: 20, marginLeft: 5 }}
            />
          </CView>
          {item?.userCount && (
            <CView row centered style={styles.joinTagContainer}>
              <Image
                source={{ uri: item?.userCount?.logo }}
                style={{
                  width: 20,
                  height: 20,
                  marginLeft: 2,
                  marginRight: 5,
                  tintColor: '#fff',
                  opacity: 1
                }}
              />
              <CText
                color="commonWhite"
                size="normal"
                text={item?.userCount?.count}
              />
            </CView>
          )}
        </CView>

        <LinearGradient
          colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 0.8)']}
          style={styles.cardContent}>
          <CView>
            <CText
              size="smallBold"
              numberOfLines={3}
              color={'commonWhite'}
              text={item?.title}
            />
            <CView row centered style={styles.viewContainer}>
              <Image
                source={{ uri: item?.profilePic }}
                style={{
                  height: 30,
                  width: 30,
                  borderRadius: 100,
                  backgroundColor: 'red',
                  marginRight: 8
                }}
              />
              <CText
                size="normalBold"
                color={'commonWhite'}
                style={styles.txtColor}>
                {item?.username}
              </CText>
            </CView>
          </CView>
        </LinearGradient>
      </Pressable>
    </CView>
  )
  return (
    <CView>
      <CView style={styles.sectionTitleStyle}>
        {data?.titleIcon && (
          <Image source={{ uri: data?.titleIcon }} style={styles.sectionIcon} />
        )}
        <CText size="mediumBold">{data?.title}</CText>
      </CView>

      <ScrollView
        contentContainerStyle={styles.container}
        showsHorizontalScrollIndicator={false}>
        {data.items.map((item, index) => (
          <View key={index} style={{ padding: 5 }}>
            {renderItem({ item })}
          </View>
        ))}
      </ScrollView>
    </CView>
  )
}

export default memo(Live45)
