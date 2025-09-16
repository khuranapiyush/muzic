import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import getStyles from './Home.style';
import { useTheme } from 'react-native-elements';

const AudioPlayer = ({ currentTrack, isPlaying, onPlayPause }) => {
  const { mode } = useTheme();
  const styles = getStyles(mode);

  if (!currentTrack) {
    return null;
  }

  return (
    <View style={styles.audioPlayer}>
      <Image
        source={{ uri: currentTrack.imageUrl }}
        style={styles.playerThumbnail}
      />
      <View style={styles.playerInfo}>
        <Text style={styles.playerTitle}>{currentTrack.title}</Text>
        <Text style={styles.playerSubtitle}>Rock, Bold, Rage</Text>
        <Text style={styles.playerDuration}>{currentTrack.duration}</Text>
      </View>
      <TouchableOpacity style={styles.pauseButton} onPress={onPlayPause}>
        <View
          style={[
            styles.pauseIcon,
            isPlaying ? styles.pauseIconActive : styles.playIconMini,
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

export default AudioPlayer;
