/* eslint-disable react-native/no-inline-styles */
import React, { memo } from 'react'
import CView from '../../core/View'
import appImages from '../../../../resource/images'
import { Image } from 'react-native'

const HeaderLeft = ({ mode }) => {
  return (
    <CView row style={{ alignItems: 'center' }}>
      {/* <TouchableOpacity onPress={openDrawer}>
        <Image
          source={appImages.newMenuIcon}
          style={{
            width: 30,
            height: 30,
            resizeMode: 'contain',
            tintColor: Colors[mode].white
          }}
        />
      </TouchableOpacity> */}
      <Image
        source={appImages.appLogo}
        style={{
          height: 35,
          width: 130,
          resizeMode: 'contain'
        }}
      />
    </CView>
  )
}

export default memo(HeaderLeft)
