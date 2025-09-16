import { useMutation } from '@tanstack/react-query';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getStreamAndRoyaltyProjected } from '../../../../api/trade';
import { setStreamAndRoyaltyData } from '../../../../stores/slices/trade';
import { formatDate1, numFormatter } from '../../../../utils/common';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import { Colors } from '../../../common/core/colors';
import StreamGraph from '../UI/StreamGraph';
import styles from './style';

const Stream = () => {
  const dispatch = useDispatch();

  const [graphLabel, setGraphLabel] = useState('1M');
  const { streamAndRoyaltyData, fanCardVideoDetail } = useSelector(
    state => state.trade
  );
  const tradeGraphInterval = ['1M', '3M', '6M', '1Y'];

  const renderGraphInterval = ({ item, index }) => {
    const selected = graphLabel == item;
    return (
      <TouchableOpacity
        disabled={selected}
        onPress={() => {
          setGraphLabel(item);
        }}>
        <CView
          style={
            selected ? styles.graphSelectedLabel : styles.graphLabelContainer
          }>
          <CText
            style={{
              color: selected ? Colors.Palette.white : Colors.Palette.black,
            }}>
            {item}
          </CText>
        </CView>
      </TouchableOpacity>
    );
  };

  const { mutate: getStreamingGraphData } = useMutation(
    data => getStreamAndRoyaltyProjected(data),
    {
      onSuccess: ({ data }) => {
        dispatch(setStreamAndRoyaltyData(data.data));
      },

      onError: error => {
        console.log('Error', error.response.data);
      },
    }
  );

  useEffect(() => {
    let obj;
    if (graphLabel == '1M') {
      obj = {
        videoId: fanCardVideoDetail.videoId,
        fromDate: moment().subtract(1, 'months'),
      };
    } else if (graphLabel == '3M') {
      obj = {
        videoId: fanCardVideoDetail.videoId,
        fromDate: moment().subtract(3, 'months'),
      };
    } else if (graphLabel == '6M') {
      obj = {
        videoId: fanCardVideoDetail.videoId,
        fromDate: moment().subtract(6, 'months'),
      };
    } else if (graphLabel == '1Y') {
      obj = {
        videoId: fanCardVideoDetail.videoId,
        fromDate: moment().subtract(12, 'months'),
      };
    }
    getStreamingGraphData(obj);
  }, [graphLabel, getStreamingGraphData, fanCardVideoDetail.videoId]);

  return (
    <CView style={styles.wrapperWithoutCenter}>
      <CView>
        <CView row style={{ justifyContent: 'space-between' }}>
          <CView>
            <CText>Total Streams</CText>
            <CText size="mediumBold">
              {numFormatter(streamAndRoyaltyData?.totalStream)}
            </CText>
          </CView>
          <FlatList
            data={tradeGraphInterval}
            renderItem={renderGraphInterval}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </CView>
        <CView row>
          <CText>Last Updated Date - </CText>
          <CText size="normalBold">
            {formatDate1(streamAndRoyaltyData?.updatedAt)}
          </CText>
        </CView>
      </CView>
      <CView>
        {streamAndRoyaltyData?.data?.length > 0 && (
          <StreamGraph chartData={streamAndRoyaltyData.data} />
        )}
      </CView>
    </CView>
  );
};

export default Stream;
