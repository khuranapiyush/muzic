import { Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import getStyles from './AIGenerator.styles';
import CView from '../../../common/core/View';
import CText from '../../../common/core/Text';
import { Slider } from '@miblanchard/react-native-slider';
import Sound from 'react-native-sound';
import appAudios from '../../../../resource/audio';
import useToaster from '../../../../hooks/useToaster';

const MusicPlayer = (songItem, isPlayingStarted, songProgress) => {
  const { mode } = useTheme();
  const styles = getStyles(mode);
  const soundRef = useRef(null);
  const { showToaster } = useToaster();

  const [currentSong, setCurrentSong] = useState(songItem);
  const [currentSound, setCurrentSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(isPlayingStarted);
  const [progress, setProgress] = useState(songProgress);

  useEffect(() => {
    const sound = new Sound(appAudios.SifarSafar, '', error => {
      // console.log('error')
    });
    // console.log(sound)
    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play(success => {
        if (success) {
          // console.log('Successfully finished playing')
        } else {
          // console.log('Playback failed due to audio decoding errors')
        }
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSongPress = song => {
    if (soundRef.current) {
      soundRef.current.release();
    }
    if (song.audioUrl) {
      //   const sound = new Sound(song.audioUrl, '', error => {
      //     if (error) {
      //       showToaster('Failed to load the song', error)
      //       return
      //     }
      //   })
      //   setCurrentSound(sound)
      //   soundRef.current = currentSound
      //   setCurrentSong(song)
      //   soundRef.current?.play(success => {
      //     if (success) {
      //       setIsPlaying(true)
      //       return
      //     } else {
      //       setIsPlaying(false)
      //       showToaster({
      //         type: 'error',
      //         text1: 'Playback failed due to audio decoding errors'
      //       })
      //     }
      //   })
      // console.log('Initializing Sound...')
      const sound = new Sound(song.audioUrl, '', error => {
        if (error) {
          showToaster('Failed to load the song', error);
          return;
        }
      });
      setCurrentSound(sound);
      soundRef.current = currentSound;
      //   soundRef.current.play(success => {
      //     if (success) {
      //       setIsPlaying(true)
      //       console.log('Finished playing')
      //     } else {
      //       setIsPlaying(false)
      //       showToaster({
      //         type: 'error',
      //         text1: 'Playback failed due to audio decoding errors'
      //       })
      //     }
      //   })
      // console.log(sound, 'sound')
      // console.log(soundRef, 'soundRef')
      if (soundRef.current && soundRef.current.isLoaded()) {
        // console.log(soundRef.current.isLoaded(), 'soundRef.current.isLoaded')
        soundRef.current.play(success => {
          if (success) {
            setIsPlaying(true);
            // console.log('Finished playing')
          } else {
            setIsPlaying(false);
            showToaster({
              type: 'error',
              text1: 'Playback failed due to audio decoding errors',
            });
            // console.error('Playback failed')
          }
        });
      }
      //   setProgress(soundRef.current.getDuration())
      setCurrentSong(song);
    }
  };

  return (
    <CView style={styles.playerContainer}>
      <CView style={styles.playerWrapper}>
        <CView style={styles.playerDetailContainer}>
          <CView style={styles.leftIconWrapper}>
            <Image source={currentSong?.icon} style={styles.playerIcon} />
          </CView>
          <CView style={styles.playerHeadingContainer}>
            <CView style={styles.subHeadingContainer}>
              <CText style={styles.currentSongHeading}>
                {currentSong.heading}
              </CText>
              <CText style={styles.currentSongSubHeading}>
                {currentSong.subHeading}
              </CText>
            </CView>
            <CView row>
              <CText style={styles.currentSongHeading}>
                {currentSong.heading}
              </CText>
              <CText style={styles.currentSongSubHeading}>
                / {currentSong.duration}
              </CText>
            </CView>
          </CView>
          <TouchableOpacity onPress={handlePlayPause}>
            <CText style={styles.playPauseButton}>
              {isPlaying ? 'Pause' : 'Play'}
            </CText>
          </TouchableOpacity>
        </CView>
      </CView>
      <Slider
        value={progress}
        disabled={true}
        onValueChange={value => {
          if (soundRef.current) {
            soundRef.current.setCurrentTime(
              value * soundRef.current.getDuration()
            );
          }
        }}
        startFromZero={true}
        containerStyle={styles.sliderContainer}
        maximumTrackStyle={styles.maxTrackStyle}
        minimumTrackStyle={styles.minTrackStyle}
      />
    </CView>
  );
};

export default MusicPlayer;
