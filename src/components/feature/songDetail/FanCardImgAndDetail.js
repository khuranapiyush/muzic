import React from 'react'
import CView from '../../common/core/View'
import CText from '../../common/core/Text'
import { Image } from 'react-native'
import { BenefitsText } from './UI/PrivilegeText'

const FanCardImgAndDetail = ({ nftDetail }) => {
  return (
    <CView>
      <CView row style={{ justifyContent: 'space-evenly' }}>
        <Image
          source={{
            uri: nftDetail?.asset_tiers?.data?.[0]?.attributes
              ?.nft_frontimage_url
          }}
          style={{ width: '40%', height: 270 }}
        />
        <Image
          source={{
            uri: nftDetail?.asset_tiers?.data?.[0]?.attributes
              ?.nft_backimage_url
          }}
          style={{ width: '40%', height: 270 }}
        />
      </CView>
      <CText size="mediumBold" style={{ paddingVertical: 10 }}>
        Additional Benifits
      </CText>
      <BenefitsText
        text={
          nftDetail?.asset_tiers?.data?.[0]?.attributes?.Privilege1_Detailed
        }
      />
      <BenefitsText
        text={
          nftDetail?.asset_tiers?.data?.[0]?.attributes?.Privilege2_Detailed
        }
      />
      <CView>
        <BenefitsText
          text={
            nftDetail?.asset_tiers?.data?.[0]?.attributes?.Privilege3_Detailed
          }
        />
        <BenefitsText
          text={
            nftDetail?.asset_tiers?.data?.[0]?.attributes?.Privilege4_Detailed
          }
        />
        <BenefitsText
          text={
            nftDetail?.asset_tiers?.data?.[0]?.attributes?.Privilege5_Detailed
          }
        />
        <BenefitsText
          text={
            nftDetail?.asset_tiers?.data?.[0]?.attributes?.Privilege6_Detailed
          }
        />
      </CView>
    </CView>
  )
}

export default FanCardImgAndDetail
