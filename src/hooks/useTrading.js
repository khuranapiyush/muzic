import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { getFanCardQuantityHave, getNFTPrice } from '../api/trade';
import { get, percentHigh, percentLow } from '../utils/common';
import { useSelector } from 'react-redux';

const useTrading = currentVideo => {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [quantityIHave, setQuantityIHave] = useState(0);
  const { fanCardDetails, fanCardPriceDetail } = useSelector(
    state => state.trade
  );

  const { appData } = useSelector(state => state.app);

  const maxQuantityPerUser = useMemo(
    () =>
      fanCardDetails?.asset_tiers?.data[0].attributes.max_token_per_user -
      quantityIHave,
    [fanCardDetails?.asset_tiers?.data, quantityIHave]
  );
  const maxQuantityForSell = useMemo(() => quantityIHave, [quantityIHave]);

  const lowerLimit = useMemo(
    () =>
      percentLow(
        currentPrice?.buyPrice * 80,
        appData?.marketPlaceLimitPerc || 5
      ),
    [appData?.marketPlaceLimitPerc, currentPrice?.buyPrice]
  );

  const higherLimit = useMemo(
    () =>
      percentHigh(
        currentPrice?.buyPrice * 80,
        appData?.marketPlaceLimitPerc || 5
      ),
    [appData?.marketPlaceLimitPerc, currentPrice?.buyPrice]
  );

  const { mutate: getCurrentNFTPrice } = useMutation(
    data => getNFTPrice(data),
    {
      onSuccess: response => {
        setCurrentPrice(get(response, 'data.data', null));
      },
      onError: error => {
        console.log('Error', error.response.data);
      },
    }
  );

  const { mutate: getAlreadyPurchasedFanCard } = useMutation(
    data => getFanCardQuantityHave(data),
    {
      onSuccess: ({ data }) => {
        setQuantityIHave(data?.data?.tokenCount);
      },
      onError: error => {
        console.log('Error', error.response.data);
      },
    }
  );

  useEffect(() => {
    const tierId = get(currentVideo, 'tierId', null);
    if (tierId != null) {
      getCurrentNFTPrice({
        tierId: currentVideo.tierId,
        quantity: 1,
      });
      getAlreadyPurchasedFanCard(currentVideo.tierId);
    }
  }, [currentVideo, getCurrentNFTPrice, getAlreadyPurchasedFanCard]);

  return {
    maxQuantityPerUser,
    maxQuantityForSell,
    currentPrice,
    setCurrentPrice,
    lowerLimit,
    higherLimit,
  };
};

export default useTrading;
