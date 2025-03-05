import React, { memo } from 'react'
import { Image, TouchableOpacity } from 'react-native'
import Modal from 'react-native-modal'
import appImages from '../../../../../resource/images'
import { screenWidth } from '../../../../../utils/common'
import CText from '../../../../common/core/Text'
import styles from './styles'

const MessageContextMenu = ({
  isVisible,
  onRequestClose,
  messageId,
  handleDeleteMessage,
  isSentByCurrentUser,
  contextMenuPos
}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onRequestClose}
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}
      style={{
        flex: 1,
        margin: 0,
        padding: 0
      }}>
      <TouchableOpacity
        onPress={() => handleDeleteMessage(messageId)}
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
          zIndex: 4,
          width: screenWidth * 0.8 - 50,
          ...(isSentByCurrentUser ? { right: 25 } : { left: 25 }),
          position: 'absolute',
          zIndex: 4,
          top: contextMenuPos.y,
          ...styles.modalContent
        }}>
        <CText style={{ fontSize: 12, fontWeight: '400' }}>Delete</CText>
        <Image
          source={appImages.deleteIcon}
          style={{ width: 16, height: 16 }}
        />
      </TouchableOpacity>
    </Modal>
  )
}
export default memo(MessageContextMenu)
