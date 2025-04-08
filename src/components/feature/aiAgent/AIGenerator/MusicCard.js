/* eslint-disable react-native/no-inline-styles */
import {Image, View} from 'react-native';
import React, {useMemo, useRef, useState} from 'react';
import CView from '../../../common/core/View';
import {TouchableOpacity} from 'react-native';
import Popover from 'react-native-popover-view';
import {AuthShareButton} from '../../../common/Button/ShareButton';
import {useTheme} from '@react-navigation/native';
import getStyles from './AIGenerator.styles';
import appImages from '../../../../resource/images';
import CText from '../../../common/core/Text';
import {formatTime} from '../../../../utils/common';
import useMusicPlayer from '../../../../hooks/useMusicPlayer';

const MusicCard = ({item, index, songList}) => {
  const {mode} = useTheme();
  const touchable = useRef();
  const styles = getStyles(mode);
  const [showPopover, setShowPopover] = useState(false);

  // Use our custom music player hook
  const {play, currentSong, isPlaying, togglePlayPause} =
    useMusicPlayer('AIGenerator');

  const shareOptions = {
    title: item?.title,
    message: 'Check out this awesome song!',
    url: item?.audioUrl,
  };

  const handleSongPress = () => {
    if (item?.audioUrl) {
      // Format the song to match the expected format for the global player
      const formattedSong = {
        id: item.audioUrl, // Use audioUrl as unique ID
        title: item.title,
        artist: item.artist || 'Artist',
        uri: item.audioUrl,
        thumbnail: item.imageUrl,
        poster: item.imageUrl,
        duration: item.duration,
      };

      // Format the songList if available
      const formattedSongList = songList?.map(song => ({
        id: song.audioUrl,
        title: song.title,
        artist: song.artist || 'Artist',
        uri: song.audioUrl,
        thumbnail: song.imageUrl,
        poster: song.imageUrl,
        duration: song.duration,
      }));

      // If the same song is playing, toggle play/pause
      if (currentSong && currentSong.uri === item.audioUrl) {
        togglePlayPause();
      } else {
        // Otherwise play the new song
        play(formattedSong, formattedSongList);
      }
    }
  };

  // Check if this song is currently playing
  const isCurrentlyPlaying =
    currentSong && currentSong.uri === item?.audioUrl && isPlaying;

  return (
    <>
      <CView style={styles.cardListContainer} key={index}>
        <TouchableOpacity
          style={{
            ...styles.cardListContainer,
            opacity: 1,
          }}
          onPress={handleSongPress}>
          <CView row style={styles.cardWrapper}>
            <CView row style={styles.leftWrapper}>
              <CView style={styles.leftIconWrapper}>
                <Image source={{uri: item?.imageUrl}} style={styles.leftIcon} />
                {/* Optional: Add a play indicator when the song is playing */}
                {isCurrentlyPlaying && (
                  <View style={styles.playingIndicator}>
                    <Image
                      source={appImages.playerPauseIcon}
                      style={styles.playPauseIcon}
                    />
                  </View>
                )}
              </CView>
              <CView style={{width: '65%'}}>
                {item?.title && (
                  <CText numberOfLines={1} style={styles.labelText}>
                    {item?.title}
                  </CText>
                )}
                {item?.subHeading && (
                  <CText numberOfLines={1} style={styles.descriptionText}>
                    {item?.subHeading}
                  </CText>
                )}
                {item?.duration && (
                  <CText numberOfLines={1} style={styles.descriptionText}>
                    {formatTime(item?.duration)}
                  </CText>
                )}
                {item?.status && (
                  <CText numberOfLines={1} style={styles.descriptionText}>
                    {item?.status}
                  </CText>
                )}
              </CView>
            </CView>

            <CView row style={styles.iconContainer}>
              <TouchableOpacity
                ref={touchable}
                onPress={() => setShowPopover(true)}>
                <Image
                  source={appImages.shareIcon}
                  style={styles.shareIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Popover
                from={touchable}
                isVisible={showPopover}
                backgroundStyle={styles.popoverBg}
                onRequestClose={() => setShowPopover(false)}>
                <CView style={styles.popoverContainer}>
                  <AuthShareButton
                    shareOptions={shareOptions}
                    customStyles={{
                      shareContainer: styles.shareContainer,
                    }}
                  />
                </CView>
              </Popover>
              <TouchableOpacity
                ref={touchable}
                onPress={() => setShowPopover(true)}>
                <Image
                  source={appImages.threeDotIcon}
                  style={styles.dotIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Popover
                from={touchable}
                isVisible={showPopover}
                backgroundStyle={styles.popoverBg}
                onRequestClose={() => setShowPopover(false)}>
                <CView style={styles.popoverContainer}>
                  <AuthShareButton
                    shareOptions={shareOptions}
                    customStyles={{
                      shareContainer: styles.shareContainer,
                    }}
                  />
                </CView>
              </Popover>
            </CView>
          </CView>
        </TouchableOpacity>
      </CView>
    </>
  );
};

export default MusicCard;
