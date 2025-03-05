import fetcher from '../../../dataProvider'
import Config from 'react-native-config'
const authToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2Mjk4N2E0ZGUzNjM5YjJkNzkyNmJmMTciLCJpYXQiOjE2ODgzNjI3MTUsImV4cCI6MTcxOTkyMDMxNSwidHlwZSI6ImFjY2VzcyJ9.iUosk2kYmTH7S70KftnpROP_OpM9USFhblh5WvtOx6M'

export const videoCategoriesRequest = async data => {
  const response = await fetcher.get(
    `${Config.FANTV_API_URL}/v1/category?sectionId=64510b0241ba4ea19b07d85c&pageId=63e5da01abfab507559d26c1`
  )
  return response
}

export const getHomeFeedData = async data => {
  let page = data?.page || 1
  let categoryId = data?.categoryId || '648c3f1605adb5d058c5d500'
  const response = await fetcher.get(
    `${Config.FANTV_API_URL}/v1/category/homefeed`,
    { params: data }
  )
  return response
}

module.exports = {
  videoCategoriesRequest,
  getHomeFeedData
}
