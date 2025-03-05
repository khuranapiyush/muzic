import config from 'react-native-config'
import fetcher from '../../dataProvider'

const { API_URL, FANTV_API_URL } = config

export const getTransactions = async page => {
  return fetcher.get(`${API_URL}/v1/wallet/history?page=${page}`)
}

export const getAllAccounts = async ({ userId }) => {
  return fetcher.get(`${API_URL}/v1/user/${userId}/bank-account?isGrouped=true`)
}

export const makeAccountActiveDeactive = async ({
  userId,
  bankId,
  isActive
}) => {
  return fetcher.patch(`${API_URL}/v1/user/${userId}/bank-account/${bankId}`, {
    isActive: isActive
  })
}
export const addBankAccounts = async ({ userId, payload }) => {
  return fetcher.post(`${API_URL}/v1/user/${userId}/bank-account`, payload)
}

export const sendOtpToVerifyBank = async ({ userId, bankId }) => {
  return fetcher.post(
    `${API_URL}/v1/user/${userId}/bank-account/${bankId}/send-otp`
  )
}

export const verifyOtpToAddBank = async ({ userId, bankId, data }) => {
  return fetcher.post(
    `${API_URL}/v1/user/${userId}/bank-account/${bankId}/verify-otp`,
    data
  )
}

export const getAllWithdrawableAccounts = async ({ userId }) => {
  return fetcher.get(
    `${API_URL}/v1/user/${userId}/bank-account?isActive=true&isVerified=true&isAccNameMatchedWithPancard=true&isRejected=false`
  )
}

export const withdrawMoney = async data => {
  return fetcher.post(`${API_URL}/v1/wallet/withdraw`, data)
}

export const evaluateXFanTVConvertion = async data => {
  return fetcher.post(`${FANTV_API_URL}/v1/user/evaluate-coin-token`, data)
}

export const convertCoinToToken = async data => {
  return fetcher.post(`${FANTV_API_URL}/v1/user/convert-coin-token`, data)
}

export const getConfig = async data => {
  return fetcher.get(`${FANTV_API_URL}/v1/common/config?populate=${data}`)
}
