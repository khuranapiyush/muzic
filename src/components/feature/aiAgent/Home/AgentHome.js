import React from 'react'
import CView from '../../../common/core/View'
import getStyles from './AgentHome.styles'
import CText from '../../../common/core/Text'
import { useNavigation, useTheme } from '@react-navigation/native'
import AutoHeightImage from 'react-native-auto-height-image'
import appImages from '../../../../resource/images'
import { Image, ScrollView } from 'react-native'
import { TouchableOpacity } from 'react-native'
import ROUTE_NAME from '../../../../navigator/config/routeName'

const cardData = [
  {
    id: 1,
    icon: appImages.cinematicAIIcon,
    heading: 'Vdio AI',
    subHeading: 'Create text to video using AI ',
    navigationTab: 'video',
    isComingSoon: false,
    isIconRequired: false,
    iconsArray: []
  },
  {
    id: 2,
    icon: appImages.aiGeneratorIcon,
    heading: 'Muzic AI',
    subHeading: 'Create songs with lyrical / music video',
    navigationTab: 'music',
    isComingSoon: false,
    isIconRequired: false,
    iconsArray: []
  },
  {
    id: 3,
    icon: appImages.articulatAIIcon,
    heading: 'Script Gen',
    subHeading: 'Create Scripts, Lyrics, Content',
    navigationTab: 'lyrics',
    isComingSoon: false,
    isIconRequired: false,
    iconsArray: []
  },
  {
    id: 4,
    icon: appImages.reelAiIcon,
    heading: 'Reel AI',
    subHeading: 'Create short videos, movie and web series',
    navigationTab: '',
    isComingSoon: true,
    isIconRequired: false,
    iconsArray: []
  },
  {
    id: 5,
    icon: appImages.clickPublishIcon,
    heading: '1-click Publish',
    subHeading: '',
    navigationTab: '',
    isComingSoon: true,
    isIconRequired: true,
    iconsArray: [
      { id: 0, iconSource: appImages.tiktokIcon },
      { id: 1, iconSource: appImages.xIcon },
      { id: 2, iconSource: appImages.instagramIcon }
    ]
  }
]
const AgentHome = () => {
  const { mode } = useTheme()

  const styles = getStyles(mode)

  const navigation = useNavigation()

  const handleOnClick = route => {
    navigation.navigate(ROUTE_NAME.AIGenerator, {
      title: route.heading,
      tab: route.navigationTab
    })
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <CView style={styles.wrapper}>
        <CText size="bricolageHeading" style={styles.headingText}>
          Turn ideas into Reality
        </CText>
        <AutoHeightImage
          source={appImages.aiAgentIcon}
          width={120}
          height={120}
          style={styles.iconStyles}
        />
        <CText size="medium" style={styles.subHeadingText}>
          Your Ideas, Amplified - Transform Simple Text into Rich Digital
          Experiences.
        </CText>
      </CView>
      <CView style={styles.cardListContainer}>
        {cardData.map((item, index) => {
          return (
            <TouchableOpacity
              key={`AICard-${item.id}`}
              disabled={item.isComingSoon}
              style={styles.cardListContainer}
              onPress={() => handleOnClick(item)}>
              {item.isComingSoon && (
                <CView style={styles.tagContainer}>
                  <CText size="small" style={styles.tagText}>
                    Coming Soon
                  </CText>
                </CView>
              )}
              <CView row style={styles.cardWrapper} key={`AICard-${item.id}`}>
                <CView row style={styles.leftWrapper}>
                  <CView row>
                    <CView style={styles.leftIconWrapper}>
                      <Image source={item?.icon} style={styles.leftIcon} />
                    </CView>

                    <CView column>
                      <CText style={styles.labelText}>{item?.heading}</CText>
                      <CView row>
                        {item?.isIconRequired ? (
                          item?.iconsArray.map(icons => {
                            return (
                              <CView
                                row
                                style={styles.iconContainer}
                                key={`SocialIcon-${icons.id}`}>
                                <Image
                                  source={icons.iconSource}
                                  style={styles.iconStyle}
                                />
                              </CView>
                            )
                          })
                        ) : (
                          <CText style={styles.descriptionText}>
                            {item?.subHeading}
                          </CText>
                        )}
                      </CView>
                    </CView>
                  </CView>
                </CView>

                {!item.isComingSoon && (
                  <CView row style={styles.actionBtnWrapper}>
                    <Image
                      source={appImages.arrowRightAngle}
                      style={styles.actionIcon}
                    />
                  </CView>
                )}
              </CView>
            </TouchableOpacity>
          )
        })}
      </CView>
    </ScrollView>
  )
}

export default AgentHome
