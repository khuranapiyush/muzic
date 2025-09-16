import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SvgUri } from 'react-native-svg';
import appImages from '../../../../../resource/images';
import ProgressBar from '../../../../common/ProgressBar';
import CText from '../../../../common/core/Text';
import CView from '../../../../common/core/View';
import styles from './style';

const LevelProgress = ({ config }) => {
  const navigator = useNavigation();

  const handleWatchVideos = () => {
    navigator.navigate('Home');
  };

  return (
    <CView>
      <LinearGradient
        colors={['#30237E', '#282440']}
        locations={[0.0006, 0.9357]}
        useAngle={true}
        angle={184}
        style={styles.gradient}>
        <CView row style={styles.gradientContainer}>
          <CView style={styles.levelLeftWrapper}>
            <CText style={styles.levelText}>Level</CText>
            {config.currentLevel?.includes('.svg') ? (
              <SvgUri uri={config.currentLevel} width={28} height={28} />
            ) : (
              <Image
                source={{
                  uri: config.currentLevel,
                }}
                style={styles.levelIcon}
              />
            )}
          </CView>

          <CView style={styles.progressWrapper}>
            <CText style={styles.progressText}>{config.text}</CText>
            <ProgressBar
              progress={config.watchedSec}
              height={14}
              leftPos={'46%'}
            />
          </CView>

          <CView style={styles.levelRightWrapper}>
            <CText style={styles.levelText}>Level</CText>
            {config.nextLevel?.includes('.svg') ? (
              <SvgUri uri={config.nextLevel} width={28} height={28} />
            ) : (
              <Image
                source={{
                  uri: config.nextLevel,
                }}
                style={styles.levelIcon}
              />
            )}
          </CView>
        </CView>
      </LinearGradient>
      <Pressable onPress={handleWatchVideos} style={styles.btnWrapper}>
        <CText style={styles.btnText}>Watch Videos</CText>
        <Image style={styles.backIcon} source={appImages.arrowBack} />
      </Pressable>
    </CView>
  );
};

export default LevelProgress;
