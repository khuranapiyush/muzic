import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native'
import AudioPlayer from '../../../screens/Home/AudioPlayer'
import config from 'react-native-config'
import { useMutation } from '@tanstack/react-query'
import fetcher from '../../../dataProvider'
import Sound from 'react-native-sound'
import { formatTime } from '../../../utils/common'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

const LibraryScreen = () => {
  const { API_BASE_URL } = config
  const [currentTrack, setCurrentTrack] = useState(null)
  const [audioList, setAudioList] = useState([])
  const [sound, setSound] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Fetch audio list mutation
  const { mutate: fetchAudioList, isLoading: isListLoading } = useMutation(
    () => fetcher.get(`${API_BASE_URL}/v1/audio-list`),
    {
      onSuccess: response => {
        if (response) {
          setAudioList(response.data.data)
        }
      },
      onError: error => {
        console.error('Error fetching audio list:', error)
      }
    }
  )

  useEffect(() => {
    fetchAudioList()
    return () => {
      if (sound) {
        sound.release() // Properly release the sound resource
      }
    }
  }, [])

  const handlePlayPause = () => {
    if (sound) {
      if (isPlaying) {
        sound.pause(() => {
          setIsPlaying(false)
        })
      } else {
        sound.play(success => {
          if (!success) {
            console.log('Sound playback failed')
          }
        })
        setIsPlaying(true)
      }
    }
  }

  const handleSongPress = (audioUrl, title, duration, imageUrl) => {
    try {
      // If the same song is clicked
      if (currentTrack?.audioUrl === audioUrl) {
        handlePlayPause()
        return
      }

      // Release previous sound if exists
      if (sound) {
        sound.release()
      }

      // Initialize new sound
      const newSound = new Sound(audioUrl, null, error => {
        if (error) {
          console.log('Failed to load sound', error)
          return
        }

        // Sound loaded successfully
        setSound(newSound)
        setCurrentTrack({ audioUrl, title, duration, imageUrl })

        // Play the sound
        newSound.play(success => {
          if (!success) {
            console.log('Sound playback failed')
          }
        })
        setIsPlaying(true)

        // Setup completion callback
        newSound.setNumberOfLoops(0) // Play once
        newSound.onEnded = () => {
          setIsPlaying(false)
        }
      })
    } catch (error) {
      console.error('Error playing sound:', error)
    }
  }

  const SongItem = ({ song }) => {
    return (
      <TouchableOpacity
        style={styles.songItem}
        onPress={() =>
          handleSongPress(
            song.audioUrl,
            song.title,
            song.duration,
            song.imageUrl
          )
        }>
        <Image source={{ uri: song.imageUrl }} style={styles.songImage} />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.songGenres}>{formatTime(song.duration)}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Library</Text>
      {isListLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          <ScrollView style={styles.content}>
            <View style={styles.songsList}>
              {audioList?.map(song => (
                <SongItem key={song._id} song={song} />
              ))}
            </View>
          </ScrollView>
          <AudioPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
          />
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A'
  },
  menuIcon: {
    width: 24,
    height: 24
  },
  logo: {
    width: 120,
    height: 24
  },
  searchIcon: {
    width: 24,
    height: 24
  },
  content: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FDF5E6',
    padding: 16
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32
  },
  libraryCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden'
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end'
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff'
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FDF5E6',
    marginBottom: 16
  },
  songsList: {
    marginBottom: 80
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  songImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12
  },
  songInfo: {
    flex: 1
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4
  },
  songGenres: {
    fontSize: 14,
    color: '#999'
  },
  createButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24
  },
  createButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000'
  },
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333'
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: '#666'
  },
  tabText: {
    fontSize: 12,
    color: '#666'
  },
  activeTab: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16
  },
  activeTabText: {
    color: '#F4A460'
  }
})

export default LibraryScreen
