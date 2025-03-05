import React from 'react'
import CView from '../core/View'
import appImages from '../../../resource/images'
import CText from '../core/Text'
import { Image } from 'react-native'

const ToggleThemeBtn = ({ theme }) => {
  return (
    <>
      {!!theme && (
        <CView
          center
          style={{
            backgroundColor: theme.mode === 'dark' ? '#F4F6FA' : '#000',
            alignSelf: 'flex-start',
            paddingRight: 5,
            paddingLeft: 15,
            paddingVertical: 5,
            borderRadius: 50
          }}>
          {theme?.mode === 'dark' ? (
            <CView row center>
              <CText
                size="medium"
                color="commonBlack"
                style={{ alignSelf: 'center' }}>
                Light Mode{' '}
              </CText>
              <CView
                style={{
                  backgroundColor: '#FFF',
                  padding: 5,
                  borderRadius: 100,
                  borderWidth: 1,
                  borderColor: '#E7E7E7',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1
                  },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 1
                }}>
                <Image
                  source={appImages.lightIcon}
                  style={{
                    width: 24,
                    height: 24
                  }}
                />
              </CView>
            </CView>
          ) : (
            <CView row>
              <CText
                size="medium"
                color="commonWhite"
                style={{ alignSelf: 'center' }}>
                Dark Mode{' '}
              </CText>
              <CView
                style={{
                  backgroundColor: '#FFF',
                  padding: 5,
                  borderRadius: 100,
                  borderWidth: 1,
                  borderColor: '#E7E7E7',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1
                  },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 1
                }}>
                <Image
                  source={appImages.darkIcon}
                  style={{
                    width: 24,
                    height: 24
                  }}
                />
              </CView>
            </CView>
          )}
        </CView>
      )}
    </>
  )
}

export default ToggleThemeBtn
