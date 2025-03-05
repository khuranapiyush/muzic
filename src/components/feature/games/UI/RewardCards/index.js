import React from 'react'
import CoinRewardCard from './CoinRewardCard'
import CouponRewardCard from './CouponRewardCard'

const WinningCardTypeMapping = {
  coupon: CouponRewardCard,
  coin: CoinRewardCard
}

const defaultPlayerType = 'CoinRewardCard'

const RewardCards = ({ as, ...rest }) => {
  const WinningCardType =
    (as && WinningCardTypeMapping[as]) ??
    WinningCardTypeMapping[defaultPlayerType]

  if (!WinningCardType) {
    return null
  }

  return <WinningCardType {...rest} />
}

export default RewardCards
