import React, { useState } from 'react';
import { Image, SafeAreaView, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { SvgUri } from 'react-native-svg';
import appImages from '../../../resource/images';
import { screenHeight, screenWidth } from '../../../utils/common';
import CText from '../../common/core/Text';
import CView from '../../common/core/View';
import getStyles from './style';
import { ScrollView } from 'react-native-gesture-handler';
import Colors from '../../common/Colors';

const TopCollectors = ({ title = 'Top Collectors', topCollectors, theme }) => {
  let collectors = topCollectors?.slice(0, 5);
  const styles = getStyles(theme);
  const [showAllCollectors, setShowAllCollectors] = useState(false);

  const rendCollectors = (item, index) => {
    const isSvg = item?.user?.profilePic?.includes('.svg');
    return (
      <CView key={index}>
        {isSvg ? (
          <SvgUri
            key={index}
            width={screenWidth / 6}
            height={screenWidth / 6}
            uri={item?.user?.profilePic}
            style={{
              width: screenWidth / 6,
              height: screenWidth / 6,
              borderRadius: screenWidth / 12,
              ...styles.largeCollectorIcon,
            }}
          />
        ) : (
          <Image
            key={index}
            source={{ uri: item?.user?.profilePic }}
            style={{
              width: screenWidth / 6,
              height: screenWidth / 6,
              borderRadius: screenWidth / 12,
              ...styles.largeCollectorIcon,
            }}
          />
        )}
      </CView>
    );
  };

  const handleModalClose = () => {
    setShowAllCollectors(false);
  };

  return (
    <CView>
      <CText size="mediumBold" style={styles.newHeading}>
        {title}
      </CText>
      <CView row style={styles.collectorWrapper}>
        <CView row centered>
          {collectors?.map((item, index) => {
            const isSvg = item?.user?.profilePic?.includes('.svg');
            return (
              <CView
                key={index}
                style={
                  index == 0
                    ? styles.collectorIconWrapper
                    : styles.overlappedCollectorIconWrapper
                }>
                {isSvg ? (
                  <SvgUri
                    key={index}
                    height={32}
                    width={32}
                    uri={item?.user?.profilePic}
                    style={styles.collectorIcon}
                  />
                ) : (
                  <Image
                    key={index}
                    source={{ uri: item?.user?.profilePic }}
                    style={styles.collectorIcon}
                  />
                )}
              </CView>
            );
          })}
        </CView>
        <TouchableOpacity onPress={() => setShowAllCollectors(true)}>
          <CView row style={styles.smallTopCollectorWrapper}>
            <CView row>
              {collectors?.slice(0, 3)?.map((item, index) => {
                return (
                  <CText size="small" key={index * 50}>
                    {item?.user?.name?.split(' ')[0] + ', '}
                  </CText>
                );
              })}
            </CView>
            <CText
              style={{
                color: Colors[theme].brandPink,
              }}>
              +more
            </CText>
          </CView>
        </TouchableOpacity>
      </CView>

      <Modal
        isVisible={showAllCollectors}
        transparent={true}
        onBackdropPress={handleModalClose}
        onBackButtonPress={handleModalClose}
        swipeDirection={['down']}
        propagateSwipe
        style={{ ...styles.modal }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        onSwipeComplete={handleModalClose}>
        <SafeAreaView
          style={{
            ...styles.modalContainer,
            height: screenHeight * 0.8,
          }}>
          <CView style={styles.modalContent}>
            <CView row style={styles.titleContainer}>
              <CView centered>
                <CText
                  centered
                  size="large"
                  style={{ color: Colors[theme].commonBlack }}>
                  Top Collectors
                </CText>
              </CView>
              <CView>
                <TouchableOpacity onPress={handleModalClose}>
                  <Image
                    source={appImages.closeIcon}
                    style={styles.closeButton}
                  />
                </TouchableOpacity>
              </CView>
            </CView>

            <ScrollView style={{ flex: 1 }}>
              <CView style={styles.topCollectorWrapper}>
                {topCollectors.map((item, index) =>
                  rendCollectors(item, index)
                )}
              </CView>
            </ScrollView>
          </CView>
        </SafeAreaView>
      </Modal>
    </CView>
  );
};

export default TopCollectors;
