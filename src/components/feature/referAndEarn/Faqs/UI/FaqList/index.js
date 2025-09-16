import React, { memo, useState } from 'react';
import { Image, LayoutAnimation, Pressable } from 'react-native';

import getStyles from './style';
import appImages from '../../../../../../resource/images';
import CView from '../../../../../common/core/View';
import CText from '../../../../../common/core/Text';

const FaqList = ({ item, index, mode }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const styles = getStyles(mode);
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  return (
    <Pressable onPress={toggleExpansion}>
      <CView style={styles.faqContainer}>
        <CView row>
          <CView row style={styles.itemCenter}>
            <CView style={styles.textContainer}>
              <CText size="normal">{item?.question}</CText>
            </CView>
          </CView>
          <CView row centered style={styles.rightAlignedItem}>
            <Image
              source={isExpanded ? appImages.minusIcon : appImages.addIcon}
              style={styles.arrowIconStyle}
            />
          </CView>
        </CView>

        {isExpanded && (
          <CView style={styles.detailContainer}>
            <CText size="normal">{item?.answer}</CText>
          </CView>
        )}
      </CView>
    </Pressable>
  );
};

export default memo(FaqList);
