import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import {
  getHistoricalCalData,
  getNFTPrice,
  getNftDetails,
  getTopCollectors,
} from '../../../api/trade';
import {
  setFanCardDetails,
  setFanCardPriceDetail,
} from '../../../stores/slices/trade';
import { get } from '../../../utils/common';
import CView from '../../common/core/View';
import FanCardDetail from './FanCardDetail';
import FanCardImgAndDetail from './FanCardImgAndDetail';
import RoyaltyStreamAndProjection from './RoyaltyProjection';
import TopCollectors from './TopCollectors';
import ExpandableTextBox from './UI/ExpandableTextBox';
import StreamingGoalAndPreviousRecord from './UI/StreamingGoalAndPreviousRecord';
import getStyles from './style';
import TradePlayer from './tradePlayer';
import TradingGraph from './tradingGraph';
import CButton from '../../common/core/Button';
import { useNavigation, useTheme } from '@react-navigation/native';
import ROUTE_NAME from '../../../navigator/config/routeName';
import useKycCheckHook from '../../../hooks/useKycCheckHook';
import CheckKycPopup from './CheckKycPopup';
import { useAuthUser } from '../../../stores/selector';
import useModal from '../../../hooks/useModal';

const SongDetail = ({ route }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isKycCompleted] = useKycCheckHook();
  const { isLoggedIn } = useSelector(useAuthUser);
  const { showModal, hideModal } = useModal();
  const [nftDetail, setNftDetails] = useState([]);
  const [topCollectors, setTopCollectors] = useState([]);
  const [fanCardPrice, setFanCardPrice] = useState();
  const [historyData, setHistoryData] = useState();

  const { mode } = useTheme();
  const [isKycPopupOpen, setIsKycPopupOpen] = useState(false);

  const styles = getStyles(mode);
  useQuery({
    queryKey: [`getNftDetails-${route.params?.songData?.nftSlug}`],
    queryFn: getNftDetails.bind(this, {
      slug: route.params?.songData?.nftSlug,
    }),
    enabled: !!route.params?.songData?.nftSlug,
    refetchOnMount: true,
    onSuccess: response => {
      const data = response.data.data;
      dispatch(setFanCardDetails(data?.[0]?.attributes));
      setNftDetails(data?.[0]?.attributes);
    },
    onError: err => {
      console.log('🚀 ~ SongDetail ~ err:', err);
    },
  });
  useQuery({
    queryKey: [`getTopCollectors-${route.params?.songData?.nftSlug}`],
    queryFn: getTopCollectors.bind(this, {
      slug: route.params?.songData?.nftSlug,
      limit: 300,
    }),
    enabled: !!route.params?.songData?.nftSlug,
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.result;
      setTopCollectors(data);
    },
  });

  useQuery({
    queryKey: [`getHistoricalCalculator-${route.params?.songData?.nftSlug}`],
    queryFn: getHistoricalCalData.bind(this, {
      slug: nftDetail?.song_category,
    }),
    enabled: !!nftDetail?.song_category,
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data;
      setHistoryData(data?.[0]?.attributes);
    },
  });

  const { mutate: getCurrentNFTPrice } = useMutation(
    data => getNFTPrice(data),
    {
      onSuccess: response => {
        const data = get(response, 'data.data', null);
        setFanCardPrice(data);
        dispatch(setFanCardPriceDetail(data));
      },
      onError: error => {
        console.log('Error', error.response.data);
      },
    }
  );

  useEffect(() => {
    if (route.params?.songData?.tierId != null) {
      getCurrentNFTPrice({
        tierId: route.params?.songData?.tierId,
        quantity: 1,
      });
    }
  }, [getCurrentNFTPrice, route.params?.songData?.tierId]);

  const handleLogin = useCallback(() => {
    showModal('auth', {
      isVisible: true,
      onClose: () => hideModal('auth'),
      navigationData: { redirectToPath: ROUTE_NAME.SongDetail },
    });
  }, [hideModal, showModal]);

  const handleBuy = useCallback(() => {
    if (isLoggedIn) {
      if (isKycCompleted()) {
        if (route?.params?.songData?.isMarketplaceNft) {
          navigation.navigate(ROUTE_NAME.MarketPlaceBuy, {
            songData: route.params?.songData,
            title: route.params?.songData?.tierName,
          });
        } else {
          navigation.navigate(ROUTE_NAME.PreSaleBuy, {
            songData: route.params?.songData,
            title: route.params?.songData?.tierName,
          });
        }
      } else {
        setIsKycPopupOpen(true);
      }
    } else {
      handleLogin();
    }
  }, [
    handleLogin,
    isKycCompleted,
    isLoggedIn,
    navigation,
    route.params?.songData,
  ]);

  const handleSell = useCallback(() => {
    if (isLoggedIn) {
      if (isKycCompleted()) {
        if (route?.params?.songData?.isMarketplaceNft) {
          navigation.navigate(ROUTE_NAME.MarketPlaceSell, {
            songData: route.params?.songData,
            title: route.params?.songData?.tierName,
          });
        } else {
          navigation.navigate(ROUTE_NAME.PreSale, {
            songData: route.params?.songData,
            title: route.params?.songData?.tierName,
          });
        }
      } else {
        setIsKycPopupOpen(true);
      }
    } else {
      handleLogin();
    }
  }, [
    handleLogin,
    isKycCompleted,
    isLoggedIn,
    navigation,
    route.params?.songData,
  ]);

  const handleClose = useCallback(() => {
    setIsKycPopupOpen(false);
  }, []);

  const handlePressBtn = useCallback(() => {
    setIsKycPopupOpen(false);
    navigation.navigate(ROUTE_NAME.Wallet);
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
        <TradingGraph
          theme={mode}
          data={route?.params?.songData}
          slug={route?.params?.songData?.nftSlug}
          showActivity={false}
          tierId={route?.params?.songData?.tierId}
        />
        {nftDetail && (
          <CView>
            <FanCardDetail theme={mode} data={nftDetail} />
          </CView>
        )}
        {nftDetail && (
          <CView style={{ marginHorizontal: 10 }}>
            <FanCardImgAndDetail theme={mode} nftDetail={nftDetail} />
          </CView>
        )}
        {topCollectors && (
          <CView style={{ marginHorizontal: 10, marginTop: 10 }}>
            {topCollectors && (
              <TopCollectors theme={mode} topCollectors={topCollectors} />
            )}
          </CView>
        )}
        <CView>
          {route?.params?.songData && (
            <TradePlayer theme={mode} songData={route?.params?.songData} />
          )}
        </CView>
        <CView style={styles.paddingTopLeftRight10}>
          <ExpandableTextBox theme={mode} text={nftDetail?.Description} />
        </CView>
        <CView style={styles.paddingTopLeftRight10}>
          <StreamingGoalAndPreviousRecord
            theme={mode}
            buyPrice={fanCardPrice?.buyPrice}
            tradingRoyaltyShare={
              nftDetail?.asset_tiers?.data?.[0]?.attributes?.revenue_share
            }
            roi={historyData?.roi || 0}
          />
        </CView>
        <CView>
          <RoyaltyStreamAndProjection
            theme={mode}
            videoId={route?.params?.songData?.videoId}
          />
        </CView>
      </ScrollView>
      <CView centered row style={styles.btnContainer}>
        <CButton
          size="large"
          buttonType="secondary"
          text="Sell Now"
          isGradientButton={false}
          onPress={handleSell}
          customStyles={{
            buttonTextStyles: styles.submitBtn,
            buttonStyle: {
              minWidth: '45%',
            },
          }}
        />
        <CButton
          size="large"
          buttonType="primary"
          text="Buy Now"
          isGradientButton
          onPress={handleBuy}
          customStyles={{
            buttonTextStyles: styles.submitBtn,
            buttonStyle: {
              minWidth: '45%',
            },
          }}
        />
      </CView>
      <CheckKycPopup
        isOpen={isKycPopupOpen}
        handleClose={handleClose}
        handlePressBtn={handlePressBtn}
      />
    </SafeAreaView>
  );
};

export default SongDetail;
