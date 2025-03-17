import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import config from 'react-native-config';
import fetcher from '../../dataProvider';
import {useMutation} from '@tanstack/react-query';
import Sound from 'react-native-sound';
import {formatTime} from '../../utils/common';
import getStyles from './Home.style';
import {useTheme} from '@react-navigation/native';
import AudioPlayer from './AudioPlayer';
import LinearGradient from 'react-native-linear-gradient';

Sound.setCategory('Playback');

const SongCard = ({
  title,
  duration,
  audioUrl,
  onPress,
  isPlaying,
  imageUrl,
}) => {
  const {mode} = useTheme();
  const styles = getStyles(mode);
  return (
    <TouchableOpacity
      style={styles.songCard}
      onPress={() => onPress(audioUrl, title, duration, imageUrl)}>
      <View style={styles.songThumbnail}>
        <Image source={{uri: imageUrl}} style={styles.thumbnailImage} />
        <View style={[styles.playButton, isPlaying && styles.playButtonActive]}>
          <View style={styles.playIcon} />
        </View>
      </View>
      <LinearGradient
        colors={['#18181B', '#3C3129']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        locations={[0.35, 1]}
        style={styles.gradient}>
        <View style={styles.contentContainer}>
          <Text style={styles.songTitle}>{title}</Text>
          <Text style={styles.duration}>{formatTime(duration)}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const SectionHeader = ({title}) => {
  const {mode} = useTheme();
  const styles = getStyles(mode);
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
};

// Song Section Component
const SongSection = ({title, data, onSongPress, currentTrack}) => {
  const {mode} = useTheme();
  const styles = getStyles(mode);

  // Limit to top 10 songs
  const limitedData = data.slice(0, 10);

  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      <FlatList
        horizontal
        data={limitedData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <SongCard
            title={item.title}
            duration={item.duration}
            audioUrl={item.audioUrl}
            onPress={onSongPress}
            isPlaying={currentTrack?.audioUrl === item.audioUrl}
            imageUrl={item.imageUrl}
          />
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default function App() {
  const {API_BASE_URL} = config;
  const [currentTrack, setCurrentTrack] = useState(null);
  const [audioList, setAudioList] = useState([]);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const {mode} = useTheme();
  const styles = getStyles(mode);

  // Fetch audio list mutation
  const {mutate: fetchAudioList, isLoading: isListLoading} = useMutation(
    () => fetcher.get(`${API_BASE_URL}/v1/audio-list`),
    {
      onSuccess: response => {
        if (response) {
          setAudioList(response.data.data);
        }
      },
      onError: error => {
        console.error('Error fetching audio list:', error);
      },
    },
  );

  useEffect(() => {
    fetchAudioList();
    return () => {
      if (sound) {
        sound.release(); // Properly release the sound resource
      }
    };
  }, [fetchAudioList, sound]);

  const handlePlayPause = () => {
    if (sound) {
      if (isPlaying) {
        sound.pause(() => {
          setIsPlaying(false);
        });
      } else {
        sound.play(success => {
          if (!success) {
            console.log('Sound playback failed');
          }
        });
        setIsPlaying(true);
      }
    }
  };

  const handleSongPress = (audioUrl, title, duration, imageUrl) => {
    try {
      // If the same song is clicked
      if (currentTrack?.audioUrl === audioUrl) {
        handlePlayPause();
        return;
      }

      // Release previous sound if exists
      if (sound) {
        sound.release();
      }

      // Initialize new sound
      const newSound = new Sound(audioUrl, null, error => {
        if (error) {
          console.log('Failed to load sound', error);
          return;
        }

        // Sound loaded successfully
        setSound(newSound);
        setCurrentTrack({audioUrl, title, duration, imageUrl});

        // Play the sound
        newSound.play(success => {
          if (!success) {
            console.log('Sound playback failed');
          }
        });
        setIsPlaying(true);

        // Setup completion callback
        newSound.setNumberOfLoops(0); // Play once
        newSound.onEnded = () => {
          setIsPlaying(false);
        };
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const sections = [
    {
      title: 'Trending Songs',
      data: audioList,
    },
    {
      title: 'New Songs',
      data: audioList,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {sections.map((section, index) => (
          <SongSection
            key={index}
            title={section.title}
            data={section.data}
            onSongPress={handleSongPress}
            currentTrack={currentTrack}
          />
        ))}
      </ScrollView>

      <AudioPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
      />
    </SafeAreaView>
  );
}
