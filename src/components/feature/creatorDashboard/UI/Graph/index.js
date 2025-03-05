import React from 'react'

import { BarChart } from 'react-native-chart-kit'
import {
  formatDateIntoDays,
  numberWithComma,
  screenWidth
} from '../../../../../utils/common'
import CText from '../../../../common/core/Text'
import CView from '../../../../common/core/View'
import getStyle from './style'
import Colors from '../../../../common/Colors'

const Graph = ({ graphData, theme }) => {
  console.log('🚀 ~ Graph ~ theme:', theme)
  const styles = getStyle(theme)
  const data = {
    labels: graphData?.graph?.map(item => formatDateIntoDays(item.date)),
    datasets: [
      {
        data: graphData?.graph?.map(item => item.value)
      }
    ]
  }

  const chartConfig = {
    backgroundGradientTo: Colors[theme].cardBg,
    barPercentage: 0.3,
    height: 5000,
    fillShadowGradient: `rgba(1, 122, 205, 1)`,
    fillShadowGradientOpacity: 1,
    decimalPlaces: 0,
    color: (opacity = 1) => Colors[theme].white,
    labelColor: (opacity = 1) => Colors[theme].white,

    propsForBackgroundLines: {
      strokeWidth: 0,
      // stroke: '#e3e3e3',
      strokeDasharray: ''
    }
  }

  return (
    <CView>
      <CText style={styles.marginBottom8}>{graphData?.summary}</CText>
      <CView style={styles.wrapper}>
        <CView row centered style={styles.headingContainer}>
          <CView>
            <CText style={styles.graphTitle}>{graphData?.title}</CText>
            <CText size="mediumBold">
              {numberWithComma(graphData?.maxValueForGraphPlot || 0)}
            </CText>
          </CView>
          <CView style={styles.lastDaysStyle}>
            <CText>{graphData?.duration}</CText>
          </CView>
        </CView>
        <BarChart
          // showValuesOnTopOfBars={true}
          withInnerLines={true}
          verticalLabelRotation={0}
          withHorizontalLabels={true}
          data={data}
          width={screenWidth - 40}
          height={220}
          barPercentage={0.3}
          barColors="blue"
          chartConfig={chartConfig}
          fromZero={true}
          style={styles.graphStyle}
          segments={5}
        />
      </CView>
    </CView>
  )
}

export default Graph
