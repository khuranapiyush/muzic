import NetInfo from '@react-native-community/netinfo';
import {useMutation} from '@tanstack/react-query';
import {useCallback, useEffect, useState} from 'react';
import DeviceInfo from 'react-native-device-info';
import {VolumeManager} from 'react-native-volume-manager';
import {useSelector} from 'react-redux';
import {postPlayerEvent} from '../api/watch';
import {getKafkaSchema, getPlayerEventInfo} from '../utils/playerEvent';
import useToaster from './useToaster';

const usePlayerTrackEvent = ({
  playerType,
  playerProps,
  duration,
  watchId,
  videoResolution,
}) => {
  const [networkConfig, setNetworkConfig] = useState({
    networkType: null,
    ipAddress: null,
    dataSpeed: null,
  });

  const [currentVolume, setCurrentVolume] = useState(0);

  const [userAgent, setUserAgent] = useState(null);

  const {showToaster} = useToaster();

  const {videoDetail} = useSelector(state => state.watch);

  const {userId} = useSelector(state => state.user);

  const {mutate: handlePlayerEventApi} = useMutation(
    data => postPlayerEvent(data),
    {
      onSuccess: res => {},
      onError: err => {},
    },
  );

  const logPlayerEvents = useCallback(
    async ({data}) => {
      if (['MainPlayer'].includes(playerType)) {
        const kafkaSchema = getKafkaSchema(
          [
            getPlayerEventInfo(null, {
              data: {
                ...data,
                videoId:
                  videoDetail?._id || videoDetail?.id || videoDetail?.videoId,
                watchId,
                muted: playerProps?.muted,
                videoDuration: duration,
                volume: currentVolume,
                userId,
                initialResolution: videoResolution?.initial,
                userAgent,
                networkType: networkConfig?.networkType,
                ipAddress: networkConfig?.ipAddress,
              },
            }),
          ],
          watchId,
        );
        handlePlayerEventApi(kafkaSchema);
      } else if (['ShortiePlayer'].includes(playerType)) {
        const kafkaSchema = getKafkaSchema(
          [
            getPlayerEventInfo(null, {
              data: {
                ...data,
                watchId,
                muted: playerProps?.muted,
                videoDuration: duration,
                volume: currentVolume,
                userId,
                initialResolution: videoResolution?.initial,
                userAgent,
                networkType: networkConfig?.networkType,
                ipAddress: networkConfig?.ipAddress,
              },
            }),
          ],
          watchId,
        );

        handlePlayerEventApi(kafkaSchema);
      }
    },
    [
      currentVolume,
      duration,
      handlePlayerEventApi,
      networkConfig?.ipAddress,
      networkConfig.networkType,
      playerProps.muted,
      playerType,
      userAgent,
      userId,
      videoDetail?._id,
      videoDetail?.id,
      videoDetail?.videoId,
      videoResolution.initial,
      watchId,
    ],
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      let generation = 'Unknown';

      if (state.type === 'cellular') {
        if (state?.details && state?.details?.cellularGeneration) {
          switch (state.details.cellularGeneration) {
            case '2g':
              generation = '2G';
              break;
            case '3g':
              generation = '3G';
              break;
            case '4g':
              generation = '4G';
              break;
            case '5g':
              generation = '5G';
              break;
            default:
              generation = null;
          }
        }
      } else {
        generation = state.type;
      }

      setNetworkConfig(prev => ({
        ...prev,
        networkType: generation,
        ipAddress: state.details.ipAddress,
        dataSpeed: state.details.linkSpeed,
      }));
    });

    // Cleanup the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getVolume = async () => {
      const {volume} = await VolumeManager.getVolume();
      setCurrentVolume(Math.trunc(volume * 100));
    };

    getVolume();

    const volumeListener = VolumeManager.addVolumeListener(data => {
      setCurrentVolume(Math.trunc(data?.volume * 100));
    });

    return () => {
      volumeListener?.remove();
    };
  }, []);

  useEffect(() => {
    const getUserAgent = async () => {
      const value = await DeviceInfo.getUserAgent();
      setUserAgent(value);
    };

    getUserAgent();
  }, []);

  return {logPlayerEvents};
};

export default usePlayerTrackEvent;
