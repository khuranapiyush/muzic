import React from 'react'
import { processColor } from 'react-native'

import moment from 'moment'
import { LineChart } from 'react-native-charts-wrapper'
import {
  formatDate1,
  numberWithComma,
  screenWidth
} from '../../../../utils/common'
import CView from '../../../common/core/View'
import { Colors } from '../../../common/core/colors'

const StreamGraph = ({ chartData, type = 'stream' }) => {
  const yData = chartData?.map((item, index) => {
    if (type == 'stream') {
      let val = item.youtubeStats.views
      val = parseInt(item.youtubeStats.views)
      let time = index.createdAt
      const timeStamp = moment(time).format('DD-MM-YYYY')
      return {
        y: val,
        marker: ` Views: ${numberWithComma(val)}\n ${timeStamp}`
      }
    } else if (type == 'royalty') {
      let val = item.royalty
      val = parseInt(item.royalty)
      const timeStamp = formatDate1(item.date)
      return {
        y: val,
        marker: ` ₹${val}\n ${timeStamp}`
      }
    }
  })
  return (
    <CView
      style={{
        marginTop: -10,
        width: screenWidth - 20,
        height: ((screenWidth - 50) * 3) / 5
      }}>
      <LineChart
        style={{ flex: 1 }}
        data={{
          dataSets: [
            {
              values: yData.reverse(),
              label: '',
              config: {
                lineWidth: 2,
                drawCircles: false,
                drawCubicIntensity: 0,
                drawHighlightIndicators: false,
                color: processColor(Colors.Palette.brandPink),
                fillColor: processColor(Colors.Palette.brandPink),
                valueTextSize: 1,
                drawValues: false,

                drawFilled: true,
                fillGradient: {
                  colors: [
                    processColor('white'),
                    processColor(Colors.Palette.brandPink)
                  ],
                  positions: [0, 0.8],
                  angle: 90,
                  orientation: 'TOP_BOTTOM'
                },
                fillAlpha: 200
              }
            }
          ]
        }}
        chartDescription={{ text: '' }}
        legend={{
          enabled: false
        }}
        marker={{
          enabled: true,
          markerColor: processColor('#c1c1c1'),
          textColor: processColor('black'),
          textSize: 14,
          fontFamily: 'Inter',
          digits: 2
        }}
        xAxis={{
          enabled: false
        }}
        yAxis={{
          left: {
            enabled: false
          },
          right: {
            enabled: false
          }
        }}
        autoScaleMinMaxEnabled={true}
        animation={{
          durationX: 0,
          durationY: 1500,
          easingY: 'EaseInOutQuart'
        }}
        drawBorders={false}
        touchEnabled={true}
        dragEnabled={true}
        scaleEnabled={false}
        git
        scaleXEnabled={true}
        scaleYEnabled={false}
        pinchZoom={true}
        doubleTapToZoomEnabled={false}
        dragDecelerationEnabled={true}
        dragDecelerationFrictionCoef={0.99}
        keepPositionOnRotation={false}
      />
    </CView>
  )
}
export default StreamGraph
