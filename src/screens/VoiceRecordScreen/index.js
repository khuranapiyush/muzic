/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  PermissionsAndroid,
  Alert,
  Image
} from 'react-native'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import LinearGradient from 'react-native-linear-gradient'
import CText from '../../components/common/core/Text'
import appImages from '../../resource/images'
import axios from 'axios'
import RNFS from 'react-native-fs'
import config from 'react-native-config'

const VoiceRecordScreen = ({ navigation }) => {
  const { API_BASE_URL } = config
  const [isRecording, setIsRecording] = useState(false)
  const [audioRecorder, setAudioRecorder] = useState(null)
  const [selectedRecording, setSelectedRecording] = useState(null)
  const [recordings, setRecordings] = useState(null)
  const [recordBackListener, setRecordBackListener] = useState(null)

  useEffect(() => {
    const initializeRecorder = async () => {
      await requestPermissions()
      const recorder = new AudioRecorderPlayer()
      setAudioRecorder(recorder)
    }

    initializeRecorder()

    return () => {
      if (audioRecorder) {
        if (isRecording) {
          stopRecording()
        }
        if (recordBackListener) {
          audioRecorder.removeRecordBackListener(recordBackListener)
        }
      }
    }
  }, [])

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        ])

        const allGranted = Object.values(grants).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        )

        if (!allGranted) {
          Alert.alert(
            'Permissions Required',
            'Please grant all permissions to use voice recording features.'
          )
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to request permissions')
      }
    }
  }

  const saveCoverAudio = async (audioId, walrusUrl) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/v1/cover-audio`, {
        audioId,
        coverAudioUrl: walrusUrl
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to save cover audio')
    }
  }

  const uploadToWalrus = async uri => {
    try {
      const fileContent = await RNFS.readFile(uri, 'base64')
      const fileName = `audio-${Date.now()}.mp3`

      const response = await axios({
        method: 'put',
        url: 'https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=5',
        data: fileContent,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Transfer-Encoding': 'base64'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      })

      return response.data
    } catch (error) {
      throw new Error('Failed to upload audio')
    }
  }

  const startRecording = async recordingId => {
    if (!audioRecorder) {
      Alert.alert('Error', 'Audio recorder not initialized')
      return
    }

    if (isRecording) {
      await stopRecording()
      return
    }

    const path = Platform.select({
      ios: `recording_${recordingId}.m4a`,
      android: `${recordingId}.mp4`
    })

    try {
      setSelectedRecording(recordingId)
      await audioRecorder?.startRecorder(path)
      const listener = audioRecorder.addRecordBackListener(e => {
        console.log('Recording....', e.currentPosition)
      })

      setRecordBackListener(listener)

      setIsRecording(true)
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording')
      setIsRecording(false)
      setSelectedRecording(null)
    }
  }

  const handleRecordPress = async () => {
    if (isRecording) {
      await stopRecording()
    } else {
      await startRecording(Date.now())
    }
  }

  const stopRecording = async () => {
    if (!audioRecorder || !isRecording) {
      return
    }

    try {
      if (recordBackListener) {
        audioRecorder.removeRecordBackListener(recordBackListener)
        setRecordBackListener(null)
      }

      const uri = await audioRecorder.stopRecorder()
      audioRecorder.removeRecordBackListener()
      setRecordings(uri)
      setIsRecording(false)
      setSelectedRecording(null)

      try {
        const walrusResponse = await uploadToWalrus(uri)
        const blobId = walrusResponse.newlyCreated.blobObject.blobId
        const walrusAudioUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`

        const audioId = blobId
        const apiResponse = await saveCoverAudio(audioId, walrusAudioUrl)
        console.log(
          {
            localUri: uri,
            blobId,
            audioUrl: walrusAudioUrl,
            timestamp: new Date().toISOString()
          },
          apiResponse,
          'RESPONSE'
        )
        Alert.alert('Success', 'Recording uploaded successfully')
      } catch (uploadError) {
        Alert.alert(
          'Upload Failed',
          'Recording saved locally but upload failed'
        )
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image
            source={appImages.arrowLeftIcon}
            style={styles.backArrowIcon}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Record your Voice</Text>
        <LinearGradient
          colors={['#18181B', '#231F1F', '#3A2F28']}
          locations={[0.35, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.vocalGradient}>
          <View style={styles.textContainer}>
            <Text style={styles.headerText}>
              You can read this while recording:
            </Text>
            <CText size={'normal'} style={styles.paragraphText}>
              Music has always been a powerful way to express emotions and tell
              stories. Whether it's a soft, melodic tune or an upbeat rhythm
              that gets everyone moving, every note and every beat carries
              meaning. I love how music can take us on a journey, from the
              quietest ballads to the most energetic anthems. The beauty of a
              song lies in its ability to blend harmony, rhythm, and lyrics,
              creating something that resonates deeply. Sometimes, the lyrics
              speak louder than words, and sometimes, the instruments tell the
              story all on their own. From classical symphonies to modern pop
              hits, music connects us all, no matter where we are or what we're
              going through.
            </CText>
          </View>
        </LinearGradient>

        <View style={styles.recordingContainer}>
          <TouchableOpacity
            onPress={handleRecordPress}
            style={styles.recordButton}>
            <LinearGradient
              colors={
                isRecording ? ['#FFB672', '#DEB887'] : ['#DEB887', '#FFB672']
              }
              style={styles.recordButtonGradient}>
              <View style={styles.micIconContainer}>
                <Text style={styles.micIcon}>🎤</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <View
            style={{
              padding: 8,
              justifyContent: 'flex-end',
              alignItems: 'center',
              borderRadius: 100,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.10)',
              backgroundColor: 'rgba(255, 255, 255, 0.10)',
              shadowColor: 'rgba(255, 213, 169, 0.20)',
              shadowOffset: {
                width: 0,
                height: 0
              },
              shadowOpacity: 1,
              shadowRadius: 8,
              elevation: 4,
              ...Platform.select({
                ios: {
                  overflow: 'hidden',
                  backgroundColor: 'transparent'
                },
                android: {
                  overflow: 'hidden'
                }
              })
            }}>
            <Text style={styles.recordingText}>
              {isRecording ? 'Recording...' : 'Start recording'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  content: {
    flex: 1,
    paddingHorizontal: 12
  },
  backButton: {
    padding: 2,
    marginBottom: 12
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 24
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FDF5E6',
    marginBottom: 24
  },
  textContainer: {
    backgroundColor: 'rgba(40, 40, 40, 0.6)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  },
  headerText: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 12
  },
  paragraphText: {
    color: '#787878'
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    overflow: 'hidden'
  },
  recordButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  micIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  micIcon: {
    fontSize: 24
  },
  recordingText: {
    color: '#999',
    fontSize: 16
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#333'
  },
  navItem: {
    alignItems: 'center'
  },
  activeNavItem: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: '#666'
  },
  navText: {
    fontSize: 12,
    color: '#666'
  },
  activeNavText: {
    color: '#FFB672'
  },
  vocalCardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    padding: 2,
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#564A3F',
    zIndex: 999
  },
  vocalGradient: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 2,
    marginBottom: 20
  }
})

export default VoiceRecordScreen
