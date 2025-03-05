import { useQuery } from '@tanstack/react-query'
import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { useSelector } from 'react-redux'
import { fetchDashboardInvestmentData } from '../../../../../api/trade'
import CView from '../../../../common/core/View'
import DashboardInfoCard from '../UI/DashboardInfoCard'
import PortFolioCard from '../UI/PortfolioCard'
import styles from './style'
import { useAuthUser } from '../../../../../stores/selector'
import CText from '../../../../common/core/Text'
import CButton from '../../../../common/core/Button'
import useModal from '../../../../../hooks/useModal'
import ROUTE_NAME from '../../../../../navigator/config/routeName'
import { useIsFocused } from '@react-navigation/native'

const Portfolio = () => {
  const { isLoggedIn } = useSelector(useAuthUser)
  const { showModal, hideModal } = useModal()
  const [investmentData, setInvestmentData] = useState([])
  const { userId } = useSelector(state => state.user)
  const focused = useIsFocused()

  const { refetch } = useQuery({
    queryKey: ['fetchDashboardInvestmentData'],
    queryFn: fetchDashboardInvestmentData.bind(this, { userId: userId }),
    refetchOnMount: true,
    enabled: !!userId || focused,
    onSuccess: res => {
      const data = res.data.data
      setInvestmentData(data)
    }
  })

  useEffect(() => {
    if (userId || focused) {
      refetch()
    }
  }, [focused, refetch, userId])

  const handleLogin = useCallback(() => {
    showModal('auth', {
      isVisible: true,
      onClose: () => hideModal('auth'),
      navigationData: { redirectToPath: ROUTE_NAME.Trade }
    })
  }, [hideModal, showModal])

  return (
    <CView style={styles.wrapper}>
      {isLoggedIn ? (
        <ScrollView>
          <DashboardInfoCard data={investmentData} type="portfolio" />
          {investmentData?.nfts?.length > 0 ? (
            investmentData?.nfts.map((item, i) => (
              <CView key={i} style={styles.marginTop10}>
                <PortFolioCard data={item} />
              </CView>
            ))
          ) : (
            <CText style={styles.padding10}>You Don't have any FanCard</CText>
          )}
        </ScrollView>
      ) : (
        <CView centered style={styles.loginWrapper}>
          <CText>Please Login to</CText>
          <CText> view portfolio</CText>
          <CView style={styles.btnContainer}>
            <CButton
              size="large"
              buttonType="primary"
              text="Login"
              isGradientButton
              onPress={handleLogin}
              customStyles={{ buttonTextStyles: styles.submitBtn }}
            />
          </CView>
        </CView>
      )}
    </CView>
  )
}

export default Portfolio
