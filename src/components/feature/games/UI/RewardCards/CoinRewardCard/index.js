import LottieView from 'lottie-react-native'
import React from 'react'
import { Image, Modal, Pressable, TouchableOpacity } from 'react-native'
import { SvgUri } from 'react-native-svg'
import appAnimations from '../../../../../../resource/animation'
import appImages from '../../../../../../resource/images'
import CText from '../../../../../common/core/Text'
import CView from '../../../../../common/core/View'
import styles from './style'

const CoinRewardCard = ({ isVisible, handleClose, rewardsConfig }) => {
  return (
    <Modal
      hardwareAccelerated={true}
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}>
      <Pressable style={styles.wrapper} onPress={handleClose}>
        <CView style={styles.contentWrapper}>
          <CView style={styles.cardRewardLogoSlot}>
            {rewardsConfig.metaData.logo.includes('.svg') ? (
              <SvgUri
                uri={rewardsConfig.metaData.logo}
                width={50}
                height={50}
              />
            ) : (
              <Image
                source={{
                  uri: rewardsConfig.metaData.logo || appImages.gameIconLogo
                }}
                style={styles.logoIcon}
              />
            )}
          </CView>

          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtnWrapper}>
            <Image source={appImages.closeIcon} style={styles.closeIcon} />
          </TouchableOpacity>

          {!rewardsConfig.metaData.lost && (
            <CView row style={styles.headerWrapper}>
              <Image
                source={appImages.partyPopperGameIcon}
                style={styles.partyPopperIcon}
              />
              <CText style={styles.congratsText}>Congratulations!</CText>
              <Image
                source={appImages.partyPopperGameIcon}
                style={styles.partyPopperIcon}
              />
            </CView>
          )}

          <CText
            centered
            style={{
              ...styles.winMessageText,
              ...(rewardsConfig.metaData.lost && {
                marginVertical: 32,
                fontSize: 18
              })
            }}>
            {rewardsConfig.metaData.content}
          </CText>
        </CView>
      </Pressable>
      {!rewardsConfig?.metaData?.lost && (
        <LottieView
          pointerEvents="none"
          style={{
            flex: 1,
            position: 'absolute',
            // zIndex: 1,
            top: 0,
            width: '100%',
            height: '100%'
          }}
          source={appAnimations.partyPopperAnimation}
          autoPlay
          loop
        />
      )}
    </Modal>
  )
}

export default CoinRewardCard
