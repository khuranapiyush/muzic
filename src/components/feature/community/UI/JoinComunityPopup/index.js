import React, { useState } from 'react'
import { Image, TouchableOpacity } from 'react-native'
import Modal from 'react-native-modal'
import Toaster from '../../../../common/Toaster'
import CText from '../../../../common/core/Text'
import CView from '../../../../common/core/View'
import styles from './styles'
import RenderHtml from 'react-native-render-html'

const JoinCommunityPopup = ({ isVisible, onClose, data }) => {
  const handleJoin = () => {
    onClose()
  }

  return (
    <Modal
      isVisible={isVisible}
      swipeDirection={null}
      propagateSwipe
      style={{ ...styles.modal }}
      animationIn="slideInUp"
      onBackdropPress={onClose}
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={true}>
      <CView>
        <CView style={styles.modalContainer}>
          <Image source={{ uri: data.background_img }} style={styles.bgImage} />
          <CView style={styles.innerModalItem}>
            <CView centered>
              <CText style={styles.mainTitle}>Join Now &</CText>
              <CText style={styles.mainTitle}>{data?.description}</CText>
            </CView>

            <CView style={{ paddingVertical: 20 }}>
              {data?.terms?.map((item, idx) => (
                <CView key={idx}>
                  <RenderHtml
                    source={{
                      html: `<p style="color: white; margin:0; font-weight:400; line-height:20px; font-size: 14px;"><span>${
                        idx + 1
                      }.</span> ${item}</p> `
                    }}
                    contentWidth={10}
                  />
                </CView>
              ))}
            </CView>
            <CView centered>
              <TouchableOpacity
                onPress={handleJoin}
                style={styles.checkInButton}>
                <CText size="normalBold" style={styles.color}>
                  Check in
                </CText>
              </TouchableOpacity>
            </CView>
          </CView>
          <Toaster />
        </CView>
      </CView>
    </Modal>
  )
}

export default JoinCommunityPopup
