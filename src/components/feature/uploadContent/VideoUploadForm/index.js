import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { fetchUploadMetaData } from '../../../../api/uploadContent'
import CustomDropdownFC from '../../../common/FormComponents/CustomDropdownFC'
import InputWithChipsFC from '../../../common/FormComponents/InputWithChipsFC'
import ToggleFC from '../../../common/FormComponents/ToggleFC'
import CButton from '../../../common/core/Button'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import styles from './style'

const privacyData = [
  { label: 'Public', id: 1 },
  { label: 'Private', id: 2 }
]
const VideoUploadForm = ({ handleBack, control, handleUpload, watch }) => {
  const [formMetaData, setFormMetaData] = useState({
    languages: [],
    contentTypes: []
  })

  const { categories, language } = watch()

  useQuery({
    queryKey: ['fetchUploadMetaData'],
    queryFn: fetchUploadMetaData.bind(this, {
      dropdown: encodeURIComponent(JSON.stringify(['language', 'contentType']))
    }),
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      const contentTypes = data.contentType.map(item => ({
        label: item.name,
        value: item._id
      }))
      const languages = data.language.map(item => ({
        label: item.name,
        value: item._id
      }))
      setFormMetaData({ contentTypes, languages })
    }
  })

  return (
    <CView style={styles.wrapper}>
      <CText size="mediumBold">Category*</CText>
      <CustomDropdownFC
        control={control}
        name="categories"
        data={formMetaData.contentTypes}
        title="Choose Video Language"
        rules={{ required: 'Video Category is required' }}
      />

      <CView style={styles.containerSpacing}>
        <CText size="mediumBold">Language of Video*</CText>
        <CustomDropdownFC
          control={control}
          name="language"
          title="Choose Video Language"
          data={formMetaData.languages}
          rules={{ required: 'Video Language is required' }}
        />
      </CView>

      <CView style={styles.containerSpacing}>
        <CText size="mediumBold">Tags</CText>
        <InputWithChipsFC name="tags" control={control} />
      </CView>

      <CView style={styles.containerSpacing}>
        <CText size="mediumBold">Artist names(Optional)</CText>
        <InputWithChipsFC name="casts" control={control} />
      </CView>

      <CView style={styles.containerSpacing}>
        <CText size="mediumBold">Privacy Settings</CText>
        <CustomDropdownFC
          config={{ height: 0.3 }}
          control={control}
          name="privacySettings"
          title="Choose privacy settings"
          data={privacyData}
        />
      </CView>

      <CView row centered style={styles.toggleSpacing}>
        <CText size="mediumBold">Monitize</CText>
        <ToggleFC control={control} name="monetizeSettings" />
      </CView>

      <CView>
        <CView row style={styles.submitBtnContainer}>
          <CView style={styles.backContainer}>
            <CButton
              size="large"
              buttonType="secondary"
              text="Back"
              onPress={handleBack}
              customStyles={styles.submitBtn}
            />
          </CView>
          <CButton
            size="large"
            buttonType="primary"
            text="Upload"
            disabled={!categories || !language}
            isGradientButton
            onPress={handleUpload}
            customStyles={styles.submitBtn}
          />
        </CView>
      </CView>
    </CView>
  )
}

export default VideoUploadForm
