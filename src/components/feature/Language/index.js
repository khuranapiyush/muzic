import { useNavigation } from '@react-navigation/native'
import { useMutation } from '@tanstack/react-query'
import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { updateLanguage } from '../../../api/language'
import {
  handleLanguageSelectedEvent,
  handleLanguageSkipEvent
} from '../../../events/language'
import useEvent from '../../../hooks/useEvent'
import useToaster from '../../../hooks/useToaster'
import appImages from '../../../resource/images'
import { updateUserData } from '../../../stores/slices/user'
import CButton from '../../common/core/Button'
import CText from '../../common/core/Text'
import CView from '../../common/core/View'
import styles from './style'
import ROUTE_NAME from '../../../navigator/config/routeName'
import { ThemeContext } from '../../../context/ThemeContext'
import Colors from '../../common/Colors'

const LanguagePreference = ({ masterData }) => {
  const [selectedLanguage, setSelectedLanguage] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const navigator = useNavigation()
  const { showToaster } = useToaster()
  const {
    theme: { mode }
  } = useContext(ThemeContext)

  const { defaultEventData } = useEvent()

  const handleSkip = () => {
    handleLanguageSkipEvent({ ...defaultEventData })
    navigator.goBack()
  }
  const handlePress = id => {
    const newArray = [...selectedLanguage]
    const index = selectedLanguage.findIndex(item => item == id)
    if (index !== -1) {
      newArray.splice(index, 1)
      setSelectedLanguage(newArray)
    } else {
      newArray.push(id)
      setSelectedLanguage(newArray)
    }
  }

  const { mutate: updateLanguagePreference } = useMutation(
    data => updateLanguage(data),
    {
      onSuccess: res => {
        showToaster({
          type: 'success',
          text1: 'Success',
          text2: 'Language Updated Successfully!'
        })
        dispatch(updateUserData({ ...res.data }))
        navigator.navigate(ROUTE_NAME.Home, { isRefresh: true })
      },
      onError: err => {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: err.response.data
        })
      },
      onSettled: res => {
        setIsLoading(false)
      }
    }
  )

  useEffect(() => {
    setSelectedLanguage(user.languagePreference || [])
  }, [user.languagePreference])

  const handleUpdate = () => {
    if (selectedLanguage?.length > 0) {
      handleLanguageSelectedEvent({ ...defaultEventData })
      setIsLoading(true)
      updateLanguagePreference({
        userId: user.id,
        data: {
          languagePreference: selectedLanguage
        }
      })
    } else {
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: 'Please select any language'
      })
    }
  }

  return (
    <CView style={styles.wrapper}>
      {masterData?.length > 0 ? (
        <CView>
          <CText
            size="bricolageHeading"
            text="Which Language content do you like?"
          />
          <CView row style={styles.headingContainer}>
            <CText
              size="normal"
              text="Let us know you better"
              style={{ color: Colors[mode]?.textLightGray }}
            />
            <Pressable onPress={handleSkip}>
              <CText
                style={{ color: Colors[mode]?.buttonBackground }}
                size="normal"
                text="Skip"
              />
            </Pressable>
          </CView>
          <FlatList
            data={masterData}
            numColumns={2}
            style={{ height: '100%' }}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handlePress(item._id)}
                style={{
                  ...(selectedLanguage?.includes(item._id)
                    ? {
                        ...styles.selectedLanguageBox,
                        borderColor: Colors[mode]?.white
                      }
                    : styles.languageBox),
                  backgroundColor: Colors[mode]?.cardBg
                }}>
                <CView row style={styles.itemContainer}>
                  <CText
                    size="mediumBold"
                    color={Colors[mode]?.primaryText}
                    text={item.name}
                  />
                  <Image
                    source={{ uri: item.url }}
                    style={styles.imageContainer}
                  />
                </CView>
                {selectedLanguage?.includes(item._id) && (
                  <Image
                    source={appImages.coloredTick}
                    style={{
                      ...styles.tickStyle
                    }}
                  />
                )}
              </Pressable>
            )}
          />
        </CView>
      ) : (
        <ActivityIndicator
          style={styles.loadingStyle}
          color={Colors[mode].brandPink}
          size={'large'}
        />
      )}
      <CView style={styles.buttonContainer}>
        <CButton
          size="large"
          buttonType="primary"
          text="Done"
          onPress={handleUpdate}
          disabled={selectedLanguage?.length === 0}
          isLoading={isLoading}
          customStyles={{
            buttonStyle: styles.buttonStyle,
            buttonTextStyles: styles.submitBtn
          }}
        />
      </CView>
    </CView>
  )
}

export default LanguagePreference
