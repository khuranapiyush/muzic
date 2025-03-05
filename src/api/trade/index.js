import config from 'react-native-config'
import fetcher from '../../dataProvider'

export const fetchDashboardInvestmentData = async ({ userId }) => {
  return fetcher.get(`${config.API_URL}/v1/user/${userId}/investment-portfolio`)
}

export const fetchDashboardListNft = async () => {
  return fetcher.get(`${config.API_URL}/v1/nft/dashboard`)
}

export const fetchOrderHistory = async (page = 1) => {
  return fetcher.get(
    `${config.API_URL}/v1/nft/order-history?page=${page}&sortBy=udpatedAt`
  )
}

export const fetchMarketScrollList = async () => {
  return fetcher.get(`${config.API_URL}/v1/nft/market`)
}

export const fetchMarketTypeList = async ({
  page = '64e0b6d8365735bf157ed4d5'
}) => {
  return fetcher.get(
    `${config.API_URL}/v1/nft/get-tiers-price-change-list?page=${page}&upcomingDrop=false`
  )
}

export const getNFTPrice = async data => {
  return fetcher.post(`${config.API_URL}/v1/nft/get-trading-price`, data)
}

export const getTradingGraph = async qp => {
  return fetcher.get(`${config.API_URL}/v1/nft/graph-web`, {
    params: qp || {}
  })
}
export const getNftDetails = async ({ slug }) => {
  return fetcher.get(
    `${config.API_URL}/api/artist-assets?filters[nft_slug][$eq]=${slug}&populate=*`
  )
}

export const getTopCollectors = async qp => {
  return fetcher.get(`${config.API_URL}/v1/nft/collectors`, {
    params: qp || {}
  })
}
export const getHistoricalCalData = async ({ slug }) => {
  return fetcher.get(
    `${config.API_URL}/api/historical-calculators?filters[song_category]=${slug}&populate=*`
  )
}

export const getStreamAndRoyaltyProjected = async ({ videoId, fromDate }) => {
  return fetcher.get(
    `${config.FANTV_API_URL}/v1/video/${videoId}/accrued-royalty`,
    {
      params: { fromDate: fromDate } || {}
    }
  )
}

export const getFanCardQuantityHave = async tier_id => {
  return fetcher.get(`${config.API_URL}/v1/nft/quantity?tierId=${tier_id}`)
}

export const applyPromoCode = async data => {
  return fetcher.post(`${config.API_URL}/v1/nft/apply-promocode`, data)
}

export const getFanCardBuySellStatus = async ({ orderId = '' }) => {
  return fetcher.get(`${config.API_URL}/v1/nft/buy-order?orderId=${orderId}`)
}

export const buyMarketPlaceFanCard = async data => {
  return fetcher.post(`${config.FANCARD}/v1/nft/buy`, data)
}

export const buyPreSaleFanCard = async data => {
  return fetcher.post(`${config.API_URL}/v1/nft/buy-tradable-nft`, data)
}
export const salePreSaleFanCard = async data => {
  return fetcher.post(`${config.API_URL}/v1/nft/sell-tradable-nft`, data)
}

export const sellMarketPlaceFanCard = async data => {
  return fetcher.post(`${config.FANCARD}/v1/nft/sell`, data)
}

export const cancelOrder = async (orderId = '') => {
  return fetcher.get(`${config.FANCARD}/v1/nft/cancel-order?orderId=${orderId}`)
}

export const validatePayment = async (orderId = '') => {
  return fetcher.get(
    `${config.API_URL}/v1/wallet/validate-payment?orderId=${orderId}`
  )
}
