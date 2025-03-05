import React from 'react'
import CView from '../../../common/core/View'
import CText from '../../../common/core/Text'
import { Image, Pressable, TouchableOpacity } from 'react-native'
import appImages from '../../../../resource/images'
import styles from './style'
import CButton from '../../../common/core/Button'

const UploadShorties = ({ handleShortieUpload }) => {
  return (
    <CView>
      <CView>
        <CView centered style={styles.modalContainer}>
          <Pressable onPress={handleShortieUpload}>
            <CView centered style={styles.iconContainer}>
              <Image
                source={appImages.uploadIcon}
                style={{ height: '100%', width: '100%' }}
              />
            </CView>
          </Pressable>
          <CView style={{ marginTop: 15 }}>
            <CText size="normalMedium">Upload Your Shorties</CText>
          </CView>
          <CView style={{ marginTop: 20 }}>
            <TouchableOpacity>
              <CView>
                <CButton
                  size="large"
                  buttonType="primary"
                  text="Upload Shorties"
                  isGradientButton
                  onPress={() => handleShortieUpload()}
                  customStyles={styles.submitBtn}
                />
              </CView>
            </TouchableOpacity>
          </CView>
          <CView style={{ marginTop: 15 }}>
            <CText size="normalMedium">Maximum File Size: 800 MB</CText>
          </CView>
        </CView>
      </CView>
    </CView>
  )
}

export default UploadShorties
