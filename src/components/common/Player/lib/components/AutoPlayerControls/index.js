import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import appImages from '../../../../../../resource/images';
import { setPlayerPreferences } from '../../../../../../stores/slices/player';
import CText from '../../../../core/Text';
import CView from '../../../../core/View';
import styles from './style';

const formatTime = seconds => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const AutoPlayerControls = ({
  playerProps,
  toggleMute,
  progress,
  duration,
}) => {
  const dispatch = useDispatch();

  let remainingTime = duration - progress?.currentTime;

  if (isNaN(remainingTime)) {
    remainingTime = 0;
  }

  const handleMute = () => {
    dispatch(
      setPlayerPreferences({
        type: 'autoPlayPlayer',
        data: { muted: !playerProps.muted },
      })
    );
    toggleMute();
  };

  return (
    <CView pointerEvents="box-none" style={styles.controlsContainer}>
      <CView style={styles.controlMuteButton}>
        <TouchableOpacity onPress={handleMute}>
          <Image
            source={
              playerProps.muted
                ? appImages.playerMuteIcon
                : appImages.playerUnMuteIcon
            }
            style={{ ...styles.controlButtonIcon }}
          />
        </TouchableOpacity>
      </CView>
      {remainingTime != 0 && (
        <CView style={styles.controlRemainingButton}>
          <CText style={styles.controlRemainingBtnText}>
            {formatTime(remainingTime)}
          </CText>
        </CView>
      )}
    </CView>
  );
};

export default AutoPlayerControls;
