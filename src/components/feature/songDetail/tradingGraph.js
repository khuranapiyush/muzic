import get from 'lodash/get'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { useMutation } from '@tanstack/react-query'
import { getNFTPrice, getTradingGraph } from '../../../api/trade'
import { dollarToInrWithRupeeSign } from '../../../utils/common'
import CText from '../../common/core/Text'
import CView from '../../common/core/View'
import NewGraphComponent from './newGrpahComponent'
import getStyles from './style'
import Colors from '../../common/Colors'

const TradingGraph = ({ slug = null, data, tierId = null, theme }) => {
  const styles = getStyles(theme)
  const [currentPrice, setCurrentPrice] = useState(null)
  const [isBuy, setIsBuy] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [allGraphData, setAllGraphData] = useState([])
  const renderRef = useRef(0)
  useEffect(() => {
    renderRef.current = renderRef.current + 1
  })

  const { mutate: getCurrentNFTPrice } = useMutation(
    data => getNFTPrice(data),
    {
      onSuccess: response => {
        setCurrentPrice(get(response, 'data.data', null))
      },
      onError: error => {
        console.log('Error', error.response.data)
      }
    }
  )

  const [graphLabel, setGraphLabel] = useState('1W')
  const tradeGraphInterval = ['1D', '1W', '1M', '6M']
  const [tradeGraphData, setTradeGraphData] = useState(null)

  useEffect(() => {
    if (tierId != null) {
      setCurrentPrice(null)
      getCurrentNFTPrice({
        tierId,
        quantity: 1
      })
    }
  }, [getCurrentNFTPrice, tierId])

  const { mutate: getTradingGraphData } = useMutation(
    data => getTradingGraph(data),
    {
      onSuccess: response => {
        setIsLoading(false)
        const graph_data = get(response, 'data.data', null)
        setTradeGraphData(graph_data)

        setAllGraphData(prev => [
          ...prev,
          {
            label: graphLabel,
            data: graph_data
          }
        ])
      },

      onError: error => {
        console.log('Error', error.response.data)
      }
    }
  )

  useEffect(() => {
    let obj
    if (tierId != null && currentPrice != null) {
      const selectedGraph = allGraphData?.filter(
        item => item?.label == graphLabel
      )
      if (selectedGraph?.length) {
        setTradeGraphData(selectedGraph[0]?.data)
      } else {
        let label = graphLabel
        if (label == '1D') {
          obj = {
            tierId,
            fromDate: moment().subtract(1, 'days'),
            interval: 300
          }
        } else if (label == '1W') {
          obj = {
            tierId,
            fromDate: moment().subtract(7, 'days'),
            interval: 900
          }
        } else if (label == '1M') {
          obj = {
            tierId,
            fromDate: moment().subtract(1, 'months'),
            interval: 7200
          }
        } else if (label == '6M') {
          obj = {
            tierId,
            fromDate: moment().subtract(6, 'months'),
            interval: 7200
          }
        }
        setIsLoading(true)
        getTradingGraphData(obj)
      }
    }
  }, [tierId, graphLabel, currentPrice, allGraphData, getTradingGraphData])

  const renderGraphInterval = ({ item, index }) => {
    const selected = graphLabel == item
    return (
      <TouchableOpacity
        disabled={selected}
        onPress={() => {
          setGraphLabel(item)
        }}>
        <CView
          style={
            selected ? styles.graphSelectedLabel : styles.graphLabelContainer
          }>
          <CText
            style={{
              color: selected
                ? Colors[theme].commonWhite
                : Colors[theme].commonBlack
            }}>
            {item}
          </CText>
        </CView>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    setAllGraphData([])
  }, [tierId])

  return (
    <CView>
      <CView style={styles.graphContainer}>
        <CView row>
          <CView>
            <TouchableOpacity
              onPress={() => {
                setIsBuy(!isBuy)
              }}>
              <CView row>
                <CText>
                  {isBuy ? 'Current Buy Price' : 'Current Sell Price'}
                </CText>
                <CView style={styles.marginLeft4}>
                  <IonIcon
                    color={Colors[theme].white}
                    name={'md-caret-up-sharp'}
                    size={10}
                  />
                  <IonIcon
                    color={Colors[theme].white}
                    name={'md-caret-down-sharp'}
                    size={10}
                  />
                </CView>
              </CView>
            </TouchableOpacity>
            <CView row style={{ alignItems: 'center' }}>
              <CText size="mediumBold">
                {dollarToInrWithRupeeSign(
                  isBuy ? currentPrice?.buyPrice : currentPrice?.sellPrice
                )}
              </CText>
              {tradeGraphData?.change != null && (
                <CView style={styles.marginLeft4} row>
                  {tradeGraphData?.change?.returnType == 'profit' && (
                    <CView row>
                      <IonIcon
                        name={'md-caret-up-sharp'}
                        color={Colors[theme].profit}
                        size={18}
                      />
                      <CText style={{ color: Colors[theme].profit }}>
                        {tradeGraphData?.change?.percent}%
                      </CText>
                    </CView>
                  )}
                  {tradeGraphData?.change?.returnType == 'loss' && (
                    <CView row>
                      <IonIcon
                        name={'md-caret-down-sharp'}
                        color={Colors[theme].loss}
                        size={18}
                      />
                      <CText style={{ color: Colors[theme].loss }}>
                        {tradeGraphData?.change?.percent}%
                      </CText>
                    </CView>
                  )}
                </CView>
              )}
            </CView>
          </CView>
          <CView style={styles.container} />
          <CView>
            <FlatList
              data={tradeGraphInterval}
              renderItem={renderGraphInterval}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </CView>
        </CView>
        <CView row style={styles.marginTop20}>
          <CView row>
            <CText>{graphLabel} Highest </CText>
            <CText size="normalBold">
              {dollarToInrWithRupeeSign(tradeGraphData?.high)}
            </CText>
          </CView>
          <CView style={styles.container} />
          <CView row>
            <CText>{graphLabel} Lowest </CText>
            <CText size="normalBold">
              {dollarToInrWithRupeeSign(tradeGraphData?.low)}
            </CText>
          </CView>
        </CView>
        {isLoading == true && (
          <ActivityIndicator
            style={{
              height: tradeGraphData == null ? 200 : null
            }}
            size={'large'}
            color={Colors[theme].brandPink}
          />
        )}

        {tradeGraphData != null && (
          <NewGraphComponent
            theme={theme}
            chartData={tradeGraphData}
            tradeSelectedGraphLabelforCal={graphLabel}
          />
        )}
      </CView>
    </CView>
  )
}

export default TradingGraph
