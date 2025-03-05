import { useNavigationState } from '@react-navigation/native'
import ROUTE_NAME from '../navigator/config/routeName'

const useIfHomeStack = () => {
  const routes = useNavigationState(state => state.routes)
  const mainStack = routes.find(route => route.name === ROUTE_NAME.MainStack)

  if (!mainStack) {
    // Handle the case where MainStack is not found in the routes
    return false
  }

  const homeStackIdx = mainStack.state?.routeNames.indexOf(ROUTE_NAME.HomeStack)

  if (homeStackIdx === -1) {
    // Handle the case where HomeStack is not found in the routeNames
    return false
  }

  const currentIdx = mainStack.state?.index

  return homeStackIdx === currentIdx
}

export default useIfHomeStack
