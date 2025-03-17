import React, {useState, useEffect} from 'react';
import {ActivityIndicator} from 'react-native';
import CView from '../../../../core/View';
import styles from './style';
import CText from '../../../../core/Text';

const PlayerLoader = ({isVideoLoading}) => {
  const [textIndex, setTextIndex] = useState(0);

  const sentences = [
    'Creating script...',
    'Creating thumbnail...',
    'Creating audio...',
  ];

  useEffect(() => {
    if (textIndex < sentences.length - 1) {
      const randomDelay = Math.floor(Math.random() * (7000 - 3000 + 1)) + 3000; // Random delay between 3000 and 7000 ms
      const timer = setTimeout(() => {
        setTextIndex(textIndex + 1);
      }, randomDelay);

      return () => clearTimeout(timer);
    }
  }, [textIndex]);

  return (
    <CView pointerEvents="none" style={styles.loadingContainer}>
      <CView>
        <ActivityIndicator size="large" color="#6B61FF" />
        <CView style={styles.loadingText}>
          {isVideoLoading ? (
            <CText size="medium">{sentences[textIndex]}</CText>
          ) : (
            <CText size="medium">Creating lyrics...</CText>
          )}
        </CView>
      </CView>
    </CView>
  );
};

export default PlayerLoader;
