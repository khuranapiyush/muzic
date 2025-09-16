import moment from 'moment';
import React from 'react';
import { processColor } from 'react-native';
import { LineChart } from 'react-native-charts-wrapper';
import { screenWidth, uptoTwoDecimalPlaces } from '../../../utils/common';
import CView from '../../common/core/View';
import Colors from '../../common/Colors';

const NewGraphComponent = ({
  chartData,
  tradeSelectedGraphLabelforCal,
  theme,
}) => {
  const formatX = data => {
    switch (tradeSelectedGraphLabelforCal) {
      case '1D':
        return moment(data).format('hh:mm A');
      case '1W':
        return moment(data).format('dddd').substring(0, 3);
      case '1M':
        return moment(data).format('DD MMM');
      case '6M':
        return moment(data).format('MMM');
    }
  };

  const yData = chartData?.amount?.map((item, index) => {
    let val = item;

    val = uptoTwoDecimalPlaces(item * 80);
    const time = chartData?.timestamp[index];
    const timeStamp =
      tradeSelectedGraphLabelforCal == '1D'
        ? moment(time).format('DD-MM-YYYY hh:mm A')
        : moment(time).format('DD-MM-YYYY');
    return {
      y: val,
      marker: `₹${val}\n ${timeStamp}`,
    };
  });

  return (
    <CView
      style={{
        width: screenWidth - 50,
        height: ((screenWidth - 50) * 3) / 4,
      }}>
      <LineChart
        style={{ flex: 1 }}
        data={{
          dataSets: [
            {
              values: yData,
              label: '',
              config: {
                lineWidth: 2,
                drawCircles: false,
                drawValues: false,
                drawCubicIntensity: 0,
                drawHighlightIndicators: false,
                valueTextSize: 0,
                color: processColor(Colors[theme].brandPink),
              },
            },
          ],
        }}
        chartDescription={{ text: '' }}
        legend={{
          enabled: false,
        }}
        marker={{
          enabled: true,
          markerColor: processColor('#c1c1c1'),
          textColor: processColor('black'),
          textSize: 14,
          fontFamily: 'Inter',
        }}
        xAxis={{
          valueFormatter: chartData?.timestamp?.map(item => formatX(item)),
          enabled: true,
          textColor: processColor(Colors[theme].white),
          drawGridLines: true,
          gridLineWidth: 0.5,
          drawAxisLine: true,
          drawLabels: true,
          textSize: 12,
          gridColor: processColor('gray'),
          position: 'BOTTOM',
          yOffset: 8,
          labelRotationAngle: 0,
          fontFamily: 'Inter',
        }}
        yAxis={{
          left: {
            valueFormatter: '₹#',
            enabled: true,
            textColor: processColor(Colors[theme].white),
            drawGridLines: true,
            gridLineWidth: 0.5,
            drawAxisLine: true,
            // drawLabels: true,
            textSize: 12,
            gridColor: processColor('gray'),
          },
          right: {
            enabled: false,
          },
        }}
        // autoScaleMinMaxEnabled={true}
        // animation={{
        //   durationX: 0,
        //   durationY: 1500,
        //   easingY: 'EaseInOutQuart'
        // }}
        drawGridBackground={false}
        drawBorders={false}
        touchEnabled={true}
        dragEnabled={true}
        scaleEnabled={false}
        git
        scaleXEnabled={false}
        scaleYEnabled={false}
        pinchZoom={true}
        doubleTapToZoomEnabled={false}
        dragDecelerationEnabled={true}
        dragDecelerationFrictionCoef={0.99}
        keepPositionOnRotation={false}
      />
    </CView>
  );
};

export default NewGraphComponent;
