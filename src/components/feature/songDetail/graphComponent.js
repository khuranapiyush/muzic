import React, { memo } from 'react'
import NewGraphComponent from './newGrpahComponent'
import CView from '../../common/core/View'

const GraphComponent = ({
  data = null,
  highest = 1,
  lowest = 0,
  filter = '1W'
}) => {
  return (
    <CView>
      {data != null && (
        <NewGraphComponent
          chartData={data}
          tradeSelectedGraphLabelforCal={filter}
        />
      )}
    </CView>
  )
}

export default memo(GraphComponent)
