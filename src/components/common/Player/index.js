import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StatusBar, TouchableWithoutFeedback } from 'react-native';
import Orientation from 'react-native-orientation-locker';
import Video from 'react-native-video';
import { useDispatch, useSelector } from 'react-redux';
import { progressEvents } from '../../../constants/event';
import { handleVideoProgressEvent } from '../../../events/video';
import useEvent from '../../../hooks/useEvent';
import usePlayerTrackEvent from '../../../hooks/usePlayerTrackEvent';
import {
  setGlobalPlayerProps,
  setPlayerFullScreen,
  setPlayerPlayPauseState,
} from '../../../stores/slices/player';
import CView from '../core/View';
import AutoPlayerControls from './lib/components/AutoPlayerControls';
import BottomControls from './lib/components/BottomControls';
import MainControls from './lib/components/MainControls';
import PlayerLoader from './lib/components/PlayerLoader';
import SeekControls from './lib/components/SeekControls';
import TopControls from './lib/components/TopControls';
import styles from './style';

const defaultFanPlayerProps = {
  controls: false,
  paused: false,
  posterResizeMode: 'cover',
  muted: false,
  resizeMode: 'contain',
  isFullScreen: false,
  volume: 1,
  analytics: {
    events: [
      'ended',
      'interval',
      'start',
      'chapter',
      'playing',
      'progressEvents',
    ],
    interval: { secondsToCall: 5, strict: true, label: '5' },
  },
};

const getPlayerType = playerType => {
  switch (playerType) {
    case 'MainPlayer':
      return 'MainPlayer';

    case 'AutoPlayPlayer':
      return 'AutoPlayPlayer';
  }
};

const Player = ({
  playerType = 'MainPlayer',
  videoDetails: initialVideoDetails,
  watchId,
  configPlayerProps = {},
  handleLoad: propsHandleLoad,
  handleVideoStart: propsHandleVideoStart,
  handleNextPress: propsHandleNextPress,
  handlePreviousPress: propsHandlePreviousPress,
  handleVideoEnd: propsHandleVideoEnd,
  handleMiniPlayerClick: propsHandleMiniPlayerClick,
  handleAutoPlayPlayerClick: propsHandleAutoPlayPlayerClick,

  handlePlayerDestroyed,
}) => {
  const videoRef = useRef(null);

  const [videoDetails, setVideoDetails] = useState(initialVideoDetails);

  const [playerProps, setPlayerProps] = useState(() => ({
    ...defaultFanPlayerProps,
    ...configPlayerProps,
  }));

  const [showControls, setShowControls] = useState(false);

  const [isPlayerBuffering, setIsPlayerBuffering] = useState(false); //

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const [progress, setProgress] = useState({});
  const [duration, setDuration] = useState(0);

  const [videoResolution, setVideoResolution] = useState({
    initial: {
      width: 0,
      height: 0,
    },
    current: {
      width: 0,
      height: 0,
    },
  });

  const [lastIntervalTriggered, setLastIntervalTriggered] = useState(-1);

  const controlsOpacity = useRef(new Animated.Value(0)).current;

  const controlsTimerRef = useRef(null);

  const { isMiniPlayer, playerPlayPauseState } = useSelector(
    state => state.player
  );

  const { watchEvent } = useSelector(state => state.watch);

  const dispatch = useDispatch();

  const { videoEventData, defaultEventData } = useEvent();

  const { logPlayerEvents } = usePlayerTrackEvent({
    playerType,
    playerProps,
    duration,
    watchId,
    videoResolution,
  });

  useEffect(() => {
    setVideoDetails(initialVideoDetails);
  }, [initialVideoDetails]);

  useEffect(() => {
    if (playerProps) {
      dispatch(setGlobalPlayerProps(playerProps));
    }
  }, [dispatch, playerProps]);

  useEffect(() => {
    if (playerPlayPauseState) {
      const aboutToPlay = playerPlayPauseState == 'play' ? true : false;
      handlePlayerPlaying(aboutToPlay);

      setPlayerProps(prev => ({
        ...prev,
        paused: playerPlayPauseState == 'play' ? false : true,
      }));

      dispatch(setPlayerPlayPauseState(null));
    }
  }, [playerPlayPauseState, dispatch, handlePlayerPlaying]);

  const hideControls = useCallback(() => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setShowControls(false);
    });
  }, [controlsOpacity]);

  const handleMiniPlayerClick = () => {
    !!propsHandleMiniPlayerClick && propsHandleMiniPlayerClick();
  };

  const handleAutoPlayPlayerClick = () => {
    !!propsHandleAutoPlayPlayerClick && propsHandleAutoPlayPlayerClick();
  };

  const handleVideoTap = () => {
    if (isMiniPlayer) {
      handleMiniPlayerClick();
    } else if (playerType == 'AutoPlayPlayer') {
      handleAutoPlayPlayerClick();
    } else {
      setShowControls(prev => !prev);

      Animated.timing(controlsOpacity, {
        toValue: showControls ? 0 : 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const togglePlayPause = () => {
    const aboutToPlay = playerProps.paused;
    handlePlayerPlaying(aboutToPlay);

    setPlayerProps(prev => ({
      ...prev,
      paused: !prev.paused,
    }));
  };

  const handleIntervalEvent = (data, config) => {
    logPlayerEvents({
      data: {
        category: 'interval',
        name: data?.label,
        playerType: getPlayerType(playerType),
        mode: 'Normal',
        videoTimeStamp: config.currentTime,
      },
    });
  };

  const handleChapterEvent = (data, config) => {
    logPlayerEvents({
      data: {
        category: 'chapter',
        name: `${data?.percent}%`,
        playerType: getPlayerType(playerType),
        mode: 'Normal',
        videoTimeStamp: config.currentTime,
      },
    });
  };

  const handleProgressEvent = data => {
    handleVideoProgressEvent(data.analyticsName, {
      ...defaultEventData,
      ...videoEventData,
    });
  };

  const handleInterval = currentTime => {
    if (currentTime !== 0 && currentTime !== lastIntervalTriggered) {
      setLastIntervalTriggered(currentTime);

      if (playerProps?.analytics?.events?.includes('interval')) {
        const { interval } = playerProps.analytics;

        if (currentTime % interval.secondsToCall === 0) {
          const data = {
            label: interval?.label,
            secondsToCall: interval.secondsToCall,
          };

          if (interval.strict) {
            !playerProps.paused && handleIntervalEvent(data, { currentTime });
          } else {
            handleIntervalEvent(data, { currentTime });
          }
        }
      }

      if (
        playerProps?.analytics?.events.includes('chapter') &&
        Object.keys(watchEvent).length
      ) {
        const { chapter: chapterConfig } = playerProps.analytics;
        const chapterTriggers = Object.keys(chapterConfig.chapters);

        if (chapterTriggers.includes(currentTime.toString())) {
          handleChapterEvent(chapterConfig.chapters[currentTime], {
            currentTime,
          });
        }
      }

      if (
        playerProps?.analytics?.events.includes('progressEvents') &&
        Object.keys(progressEvents).length
      ) {
        // eslint-disable-next-line no-shadow
        const { progressEvents } = playerProps.analytics;
        const progressEventsTriggers = Object.keys(progressEvents);

        if (progressEventsTriggers.includes(currentTime.toString())) {
          handleProgressEvent(progressEvents[currentTime]);
        }
      }
    }
  };

  const handleVideoStart = () => {
    !!propsHandleVideoStart && propsHandleVideoStart();

    playerProps?.analytics?.events?.includes('start') &&
      logPlayerEvents({
        data: {
          category: 'player',
          name: 'start',
          playerType: getPlayerType(playerType),
          mode: 'Normal',
          videoTimeStamp: videoDetails?.startTime || 0,
        },
      });
  };

  const handleNextPress = () => {
    !!propsHandleNextPress && propsHandleNextPress();
  };

  const handlePreviousPress = () => {
    !!propsHandlePreviousPress && propsHandlePreviousPress();
  };

  const handleVideoEnd = () => {
    !!propsHandleVideoEnd && propsHandleVideoEnd();

    playerProps?.analytics?.events?.includes('ended') &&
      logPlayerEvents({
        data: {
          category: 'player',
          name: 'ended',
          playerType: getPlayerType(playerType),
          mode: 'Normal',
          videoTimeStamp: duration,
        },
      });
  };

  const handlePlayerPlaying = useCallback(
    playing => {
      if (playerProps?.analytics?.events.includes('playing')) {
        if (!!progress.currentTime && progress.currentTime !== 0 && playing) {
          logPlayerEvents({
            data: {
              category: 'player',
              name: 'playing',
              playerType: getPlayerType(playerType),
              mode: 'Normal',
              videoTimeStamp: progress.currentTime,
            },
          });
        }
      }
    },
    [
      logPlayerEvents,
      playerProps?.analytics?.events,
      playerType,
      progress.currentTime,
    ]
  );

  const toggleMute = useCallback(() => {
    setPlayerProps(prev => ({
      ...prev,
      muted: !prev.muted,
    }));
  }, []);

  const toggleFullScreen = useCallback(() => {
    const isFullScreen = playerProps.isFullScreen;

    if (isFullScreen) {
      Orientation.lockToPortrait();
    } else {
      Orientation.lockToLandscape();
    }

    setPlayerProps(prev => ({
      ...prev,
      isFullScreen: !prev.isFullScreen,
    }));

    dispatch(setPlayerFullScreen(!isFullScreen));
  }, [dispatch, playerProps.isFullScreen]);

  const handleLoad = data => {
    const { width, height } = data.naturalSize;
    setVideoResolution(prev => ({ ...prev, initial: { width, height } }));
    !!propsHandleLoad && propsHandleLoad();

    if (videoDetails?.startTime) {
      handleSeek(videoDetails?.startTime);
    }
    setDuration(videoDetails?.isLiveStream ? 1 : data.duration);
  };

  const handleProgress = data => {
    const progressWidth = (data.currentTime / duration) * 100;
    const bufferWidth = (data.playableDuration / duration) * 100;
    const currentTime = Math.trunc(data.currentTime);

    handleInterval(currentTime);

    setProgress({ ...data, progressWidth, bufferWidth, currentTime });
    setSeekValue(currentTime);
  };

  const resetControlsTimer = useCallback(() => {
    controlsTimerRef.current = setTimeout(() => {
      hideControls(false);
    }, 4000);
  }, [hideControls]);

  useEffect(() => {
    if (!playerProps.paused) {
      resetControlsTimer();
    }

    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = null;
      }
    };
  }, [
    showControls,
    playerProps.paused,
    resetControlsTimer,
    handlePlayerPlaying,
  ]);

  useEffect(() => {
    Orientation.getOrientation(orientation => {
      const isFullScreen =
        orientation === 'LANDSCAPE-LEFT' || orientation === 'LANDSCAPE-RIGHT';

      dispatch(setPlayerFullScreen(isFullScreen));

      setPlayerProps(prevProps => ({
        ...prevProps,
        isFullScreen,
      }));
    });
  }, [dispatch]);

  useEffect(() => {
    if (playerProps.isFullScreen) {
      StatusBar.setHidden(true);
    } else {
      StatusBar.setHidden(false);
    }
  }, [playerProps.isFullScreen]);

  useEffect(() => {
    if (Object.keys(watchEvent).length) {
      setPlayerProps(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          chapter: {
            chapters: watchEvent.reduce((acc, curr) => {
              const triggerPoint = Math.trunc((duration * curr.percent) / 100);

              return { ...acc, [triggerPoint]: { ...curr, status: false } };
            }, {}),
          },
        },
      }));
    }
  }, [duration, watchEvent]);

  useEffect(() => {
    if (Object.keys(progressEvents).length) {
      setPlayerProps(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          progressEvents: {
            ...progressEvents.reduce((acc, curr) => {
              const triggerPoint =
                curr.type == 'percent'
                  ? Math.trunc((duration * curr.value) / 100)
                  : curr.value;

              return { ...acc, [triggerPoint]: { ...curr, status: false } };
            }, {}),
          },
        },
      }));
    }
  }, [duration, watchEvent]);

  const handleSeek = value => {
    if (videoRef.current) {
      videoRef.current.seek(Math.trunc(value));
      setSeekValue(value);
    }
  };

  const handleSeekStart = () => {
    if (videoDetails?.isLiveStream) {
      return;
    }
    setIsSeeking(true);
    setShowControls(true);
    clearTimeout(controlsTimerRef.current);
  };

  const handleSeekMove = value => {
    if (videoDetails?.isLiveStream) {
      return;
    }
    if (isSeeking) {
      //setIsSeeking(true)
      //handleSeek(value)
    }
  };

  const handleSeekEnd = value => {
    if (videoDetails?.isLiveStream) {
      return;
    }
    setIsSeeking(false);
    handleSeek(value);
    resetControlsTimer();
  };

  const handleBuffer = ({ isBuffering }) => {
    setIsPlayerBuffering(isBuffering);
  };

  useEffect(() => {
    return () => {
      !!handlePlayerDestroyed && handlePlayerDestroyed();
      if (videoRef?.current) {
        videoRef.current = null;
      }
    };
  }, [handlePlayerDestroyed]);

  return (
    <CView
      style={
        playerProps.isFullScreen
          ? styles.playerFullScreenContainer
          : styles.playerContainer
      }>
      <TouchableWithoutFeedback onPress={handleVideoTap}>
        <CView style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={videoDetails}
            poster={videoDetails.poster}
            onLoad={handleLoad}
            onReadyForDisplay={handleVideoStart}
            onProgress={handleProgress}
            onEnd={handleVideoEnd}
            onBuffer={handleBuffer}
            ignoreSilentSwitch="ignore"
            {...playerProps}
            style={[
              playerProps.isFullScreen
                ? styles.fullScreenVideo
                : styles.backgroundVideo,
            ]}
          />

          {!isMiniPlayer && playerType == 'MainPlayer' && (
            <TopControls
              isFullScreen={playerProps.isFullScreen}
              toggleFullScreen={toggleFullScreen}
            />
          )}

          {playerType == 'AutoPlayPlayer' && (
            <AutoPlayerControls
              playerProps={playerProps}
              toggleMute={toggleMute}
              progress={progress}
              duration={duration}
            />
          )}

          <Animated.View
            style={[styles.controlsContainer, { opacity: controlsOpacity }]}>
            {showControls && !isMiniPlayer && playerType == 'MainPlayer' && (
              <>
                <MainControls
                  playerProps={playerProps}
                  handlePreviousPress={handlePreviousPress}
                  togglePlayPause={togglePlayPause}
                  handleNextPress={handleNextPress}
                />
                <BottomControls
                  isLiveStream={videoDetails?.isLiveStream}
                  progress={progress}
                  duration={duration}
                  playerProps={playerProps}
                  toggleMute={toggleMute}
                  toggleFullScreen={toggleFullScreen}
                />
                <SeekControls
                  playerProps={playerProps}
                  seekValue={seekValue}
                  duration={duration}
                  handleSeekStart={handleSeekStart}
                  handleSeekMove={handleSeekMove}
                  handleSeekEnd={handleSeekEnd}
                  isSeeking={isSeeking}
                />
              </>
            )}
          </Animated.View>
          {!isMiniPlayer && isPlayerBuffering && playerType == 'MainPlayer' && (
            <PlayerLoader />
          )}
        </CView>
      </TouchableWithoutFeedback>
    </CView>
  );
};

export default Player;
