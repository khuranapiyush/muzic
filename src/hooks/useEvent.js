import { useSelector } from 'react-redux'
import { APP_VERSION } from '../constants/app'

const useEvent = () => {
  const { userId, email, languagePreference } = useSelector(state => state.user)
  const { sessionId } = useSelector(state => state.app)
  const { isGuest } = useSelector(state => state.auth)
  const { watchId, videoDetail } = useSelector(state => state.watch)

  return {
    defaultEventData: {
      userId,
      email,
      userStatus: isGuest ? 'guest' : 'loggedIn',
      LanguagePrefId: languagePreference?.join(','),
      LanguagePrefName: '',
      DeviceSource: 'ios',
      session_id: sessionId,
      App_Version: APP_VERSION,
      timestamp: new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(new Date())
    },
    videoEventData: {
      videoId: videoDetail?._id || videoDetail?.id || videoDetail?.videoId,
      WatchID: watchId,
      videoTitle: videoDetail?.title,
      pageName: '',
      PreviousSourceName: '',
      action: videoDetail?.meta?.eventName,
      position: videoDetail?.meta?.order,
      CurrentSourceName: ''
    }
  }
}

export default useEvent
