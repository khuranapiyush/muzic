import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getVideoLikeFollow, trackEvents, videoDetails } from '../api/watch'
import { setWatchEvent } from '../stores/slices/watch'
import { get } from '../utils/common'

const useVideoDetails = currentVideo => {
  const { sessionId } = useSelector(state => state.app)
  const { watchId } = useSelector(state => state.watch)
  const [videoDetail, setVideoDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [likeFollow, setLikeFollow] = useState(null)
  const [liked, setLiked] = useState(false)
  const [following, setFollowing] = useState(false)

  const dispatch = useDispatch()

  const { mutate: userLikeFollowVideo } = useMutation(
    data => getVideoLikeFollow(data),
    {
      onSuccess: response => {
        setLikeFollow(get(response, 'data.data', null))
        setLiked(get(response, 'data.data.isLiked', false))
        setFollowing(get(response, 'data.data.creator.isFollowed', false))
      },
      onError: error => {}
    }
  )
  const { mutate: fetchVideoDetails } = useMutation(
    data => videoDetails(data),
    {
      onSuccess: response => {
        let detail = get(response, 'data', null)
        dispatch(setWatchEvent(detail?.data?.watchEvent))
        setVideoDetails(detail)
        setLoading(false)
      },
      onError: error => {}
    }
  )

  const { mutate: handleTrackEvents } = useMutation(data => trackEvents(data))

  useEffect(() => {
    const videoId =
      get(currentVideo, '_id', null) || get(currentVideo, 'id', null)
    if (videoId != null) {
      setLoading(true)
      fetchVideoDetails({ id: videoId })
      userLikeFollowVideo({ id: videoId })
    }
  }, [currentVideo, fetchVideoDetails, userLikeFollowVideo])

  useEffect(() => {
    const videoId =
      get(currentVideo, '_id', null) || get(currentVideo, 'id', null)
    if (videoId != null && watchId && sessionId) {
      let obj = {
        ...currentVideo.meta,
        watchId: watchId,
        platform: 'ios',
        sessionId: sessionId
      }
      handleTrackEvents({ id: videoId, data: obj })
    }
  }, [currentVideo, handleTrackEvents, sessionId, watchId])

  return {
    videoDetail,
    loading,
    likeFollow,
    liked,
    following,
    setLikeFollow,
    setLiked,
    setFollowing
  }
}

export default useVideoDetails
