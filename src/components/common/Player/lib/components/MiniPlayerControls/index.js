import React from 'react';
import { Animated, Image, TouchableOpacity } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import appImages from '../../../../../../resource/images';
import { setPlayerPlayPauseState } from '../../../../../../stores/slices/player';
import { setIsWatchPageVisible } from '../../../../../../stores/slices/watch';
import CText from '../../../../core/Text';
import CView from '../../../../core/View';
import getStyles from './styles';
import { useTheme } from '@react-navigation/native';

const MiniPlayerControls = ({ handleMiniPlayerClick, customStyles = {} }) => {
  const { playerProps } = useSelector(state => state.player);

  const { videoDetail: currentVideo } = useSelector(state => state.watch);

  const { mode } = useTheme();

  const styles = getStyles(mode);
  const dispatch = useDispatch();

  const togglePlayPause = () => {
    dispatch(setPlayerPlayPauseState(playerProps.paused ? 'play' : 'pause'));
  };

  const handlePlayerClose = () => {
    dispatch(setIsWatchPageVisible(false));
  };

  return (
    <CView style={styles.miniPlayerContainer}>
      <Animated.View
        style={[
          customStyles?.miniPlayerExtendedStyles,
          styles.videoDetailContainer,
        ]}>
        <TouchableWithoutFeedback
          style={styles.videoDetailBtn}
          onPress={handleMiniPlayerClick}>
          <CText size="normal" numberOfLines={2}>
            {currentVideo?.title}
          </CText>
        </TouchableWithoutFeedback>
      </Animated.View>

      <Animated.View
        style={[
          customStyles?.miniPlayerExtendedStyles,
          styles.controlsContainer,
        ]}>
        <CView>
          <TouchableOpacity onPress={togglePlayPause}>
            <Image
              source={
                playerProps.paused
                  ? appImages.playerPlayIcon
                  : appImages.playerPauseIcon
              }
              style={styles.controlButtonIcon}
            />
          </TouchableOpacity>
        </CView>
        <CView>
          <TouchableOpacity onPress={handlePlayerClose}>
            <Image
              source={appImages.miniPlayerCloseIcon}
              style={styles.controlButtonIcon}
            />
          </TouchableOpacity>
        </CView>
      </Animated.View>
    </CView>
  );
};

export default MiniPlayerControls;
