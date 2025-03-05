import React from 'react'
import { StyleSheet } from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import { screenWidth } from '../../../utils/common'
import CView from '../core/View'

const styles = StyleSheet.create({
  container: {
    width: '100%'
  }
})

const defaultSkeletonSettings = {
  backgroundColor: '#c1c1c1'
}

const ShimmerEffect = ({ type, config = {} }) => {
  const videoDetailShimmer = () => {
    return (
      <CView style={styles.container}>
        <SkeletonPlaceholder borderRadius={50} {...defaultSkeletonSettings}>
          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between">
            <SkeletonPlaceholder.Item width={screenWidth - 80} height={20} />
            <SkeletonPlaceholder.Item width={30} height={30} />
          </SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item
            width={screenWidth / 2 - 20}
            marginTop={6}
            height={20}
          />
        </SkeletonPlaceholder>
        <SkeletonPlaceholder borderRadius={50} {...defaultSkeletonSettings}>
          <SkeletonPlaceholder.Item
            flexDirection="row"
            marginTop={20}
            justifyContent="space-between">
            <SkeletonPlaceholder.Item flexDirection="row">
              <SkeletonPlaceholder.Item
                width={50}
                height={50}
                borderRadius={50}
              />
              <SkeletonPlaceholder.Item justifyContent="center" marginLeft={16}>
                <SkeletonPlaceholder.Item width={140} height={20} />
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width={80}
                  height={20}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>

            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              marginLeft={16}
              borderRadius={5}>
              <SkeletonPlaceholder.Item
                width={35}
                height={35}
                marginRight={10}
              />
              <SkeletonPlaceholder.Item width={35} height={35} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      </CView>
    )
  }

  const videoListShimmer = () => {
    const { times = 1 } = config
    return Array.from(Array(times).keys()).map(item => (
      <CView key={item} style={{ marginBottom: 40 }}>
        <SkeletonPlaceholder {...defaultSkeletonSettings}>
          <SkeletonPlaceholder.Item flexDirection="column">
            <SkeletonPlaceholder.Item
              width={screenWidth - 20}
              height={200}
              borderRadius={8}
            />
            <SkeletonPlaceholder.Item
              width={screenWidth - 100}
              height={20}
              marginTop={10}
              borderRadius={20}
            />
            <SkeletonPlaceholder.Item
              width={160}
              height={20}
              marginTop={10}
              borderRadius={20}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      </CView>
    ))
  }

  const tradeListShimmer = () => {
    const { times = 1 } = config
    return Array.from(Array(times).keys()).map(item => (
      <CView key={item} style={{ marginBottom: 20 }}>
        <SkeletonPlaceholder {...defaultSkeletonSettings}>
          <SkeletonPlaceholder.Item flexDirection="column">
            <SkeletonPlaceholder.Item
              width={screenWidth - 20}
              height={50}
              borderRadius={8}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      </CView>
    ))
  }

  const getShimmerComponent = () => {
    switch (type) {
      case 'videoDetail':
        return videoDetailShimmer()
      case 'videoList':
        return videoListShimmer()
      case 'tradeList':
        return tradeListShimmer()
      default:
        return null
    }
  }

  return <>{getShimmerComponent()}</>
}

export default ShimmerEffect
