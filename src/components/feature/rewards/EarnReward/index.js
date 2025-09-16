import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import {
  fetchGameData,
  fetchGameFeed,
  fetchPastWinners,
  fetchUserLevelProgress,
} from '../../../../api/game';
import useToaster from '../../../../hooks/useToaster';
import CView from '../../../common/core/View';
import GameRenderer from '../../games/GameRenderer';
import LevelProgress from '../UI/LevelProgress';
import PastWinners from '../UI/PastWinners';
import styles from './style';

import Card100 from '../UI/viewType/Card100';
import Card30 from '../UI/viewType/Card30';
import Card40 from '../UI/viewType/Card40';
import Card50 from '../UI/viewType/Card50';
import Card60 from '../UI/viewType/Card60';
import Card80 from '../UI/viewType/Card80';
import Card90 from '../UI/viewType/Card90';
import Custom30 from '../UI/viewType/Custom30';
import { useNavigation } from '@react-navigation/native';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import GameZop from '../UI/viewType/GameZop';
import Toaster from '../../../common/Toaster';

const viewTypeMapping = {
  CARD30: {
    component: Card30,
  },
  CARD40: {
    component: Card40,
  },
  CARD50: {
    component: Card50,
  },
  CARD60: {
    component: Card60,
  },
  CARD80: {
    component: Card80,
  },
  CARD90: {
    component: Card90,
  },
  CARD100: {
    component: Card100,
  },
  CUSTOM30: {
    component: Custom30,
  },
  CUSTOMGAME: {
    component: GameZop,
  },
};

const EarnReward = ({ platform }) => {
  const [gameFeeds, setGameFeeds] = useState([]);

  const [levelProgress, setLevelProgress] = useState({
    currentLevel: '',
    nextLevel: '',
    text: '',
    watchedSec: '',
  });

  const [pastWinnerFeed, setPastWinnerFeed] = useState();

  const [gameConfig, setGameConfig] = useState({ type: '', metaData: {} });

  const [isShowGame, setIsShowGame] = useState(false);

  const { showToaster } = useToaster();

  const navigation = useNavigation();

  useQuery({
    queryKey: ['gameFeed'],
    queryFn: fetchGameFeed,
    refetchOnMount: true,
    onSuccess: ({ data }) => {
      setGameFeeds(data?.data || []);
    },
  });

  useQuery({
    queryKey: ['user-level-progress'],
    queryFn: fetchUserLevelProgress,
    refetchOnMount: true,
    onSuccess: ({ data }) => {
      setLevelProgress(data?.data);
    },
  });

  useQuery({
    queryKey: ['game-past-winners'],
    queryFn: fetchPastWinners,
    refetchOnMount: true,
    onSuccess: ({ data }) => {
      setPastWinnerFeed(data?.data);
    },
  });

  const handleErrorCodes = code => {
    switch (code) {
      case 'kyc': {
        navigation.navigate(ROUTE_NAME.Wallet);
        return;
      }
      case 'mobile': {
        return;
      }
      case 'bankAccount': {
        return;
      }
    }
  };

  const redirectToGame = item => {
    if (item.redirectUrl) {
      if (item?.redirectUrl) {
        navigation.navigate(ROUTE_NAME.CWebView, {
          url: item?.redirectUrl,
        });
      }
    }
  };

  const { mutate: getGameData } = useMutation(gameId => fetchGameData(gameId), {
    onSuccess: ({ data }) => {
      const gameData = data?.data;
      if (!gameData?.eligible) {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: gameData.message,
        });
        return;
      }
      if (gameData?.type == 'gamezop') {
        redirectToGame(gameData?.metaData);
      } else {
        setGameConfig({
          type: gameData?.type,
          metaData: {
            gameId: gameData?._id,
            ...gameData?.metaData,
            ...gameConfig.metaData,
          },
        });

        setIsShowGame(true);
      }
    },
    onError: err => {
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response.data.message,
      });
    },
  });

  const bindGameAction = config => {
    const { gameId } = config?.action;

    if (config?.subGameId) {
      setGameConfig({
        type: {},
        metaData: { subGameId: config?.subGameId },
      });
    }
    getGameData(gameId);
  };

  const handleGameClose = useCallback(() => {
    setIsShowGame(false);
  }, []);

  return (
    <CView style={styles.wrapper}>
      <FlatList
        data={gameFeeds}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item._id}
        renderItem={({ item, index }) => {
          const { _id, type, ...rest } = item;
          const ViewComponent = viewTypeMapping[type]?.component;

          return index === 0 ? (
            <>
              <CView style={styles.levelProgressWrapper}>
                {!!levelProgress.currentLevel && (
                  <LevelProgress config={levelProgress} />
                )}
              </CView>
              <ViewComponent
                key={_id}
                type={type}
                handleGameAction={bindGameAction}
                {...rest}
              />
            </>
          ) : (
            <>
              <ViewComponent
                key={_id}
                type={type}
                handleGameAction={bindGameAction}
                {...rest}
              />
              {index === gameFeeds.length - 1 &&
                !!pastWinnerFeed &&
                !!pastWinnerFeed.items.length && (
                  <CView style={styles.pastWinnersWrapper}>
                    {!!pastWinnerFeed && (
                      <PastWinners config={pastWinnerFeed} />
                    )}
                  </CView>
                )}
            </>
          );
        }}
      />
      {isShowGame && (
        <GameRenderer
          isVisible={isShowGame}
          onClose={handleGameClose}
          gameConfig={gameConfig}
        />
      )}
      <Toaster />
    </CView>
  );
};

export default EarnReward;
