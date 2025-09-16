import React, { useCallback, useEffect, useState } from 'react';
import { LayoutAnimation, StyleSheet, TouchableOpacity } from 'react-native';
import CText from '../../../common/core/Text';
import Hyperlink from 'react-native-hyperlink';
import { useTheme } from 'react-native-elements';
import Colors from '../../../common/Colors';

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  readButton: {
    alignSelf: 'flex-end',
    color: '#E14084',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  linkStyle: {
    color: '#E14084',
    fontSize: 14,
  },
});

const ExpandableTextBox = ({
  text,
  defaultNoOfLines = 2,
  moreText = 'Read More',
  lessText = 'Read Less',
  customStyle = {},
}) => {
  const { mode } = useTheme();
  const [showMoreButton, setShowMoreButton] = useState(true);
  const [textShown, setTextShown] = useState(false);

  const [numLines, setNumLines] = useState(undefined);

  const toggleTextShown = () => {
    setTextShown(!textShown);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };
  useEffect(() => {
    setNumLines(textShown ? undefined : defaultNoOfLines);
  }, [defaultNoOfLines, textShown]);

  const onTextLayout = useCallback(
    e => {
      if (e.nativeEvent.lines.length > 1 && !textShown) {
        setShowMoreButton(true);
        setNumLines(defaultNoOfLines);
      }
    },
    [textShown, defaultNoOfLines]
  );

  return (
    <>
      <Hyperlink linkStyle={styles.linkStyle} linkDefault={true}>
        <CText
          size="normal"
          onTextLayout={onTextLayout}
          color={Colors[mode]?.white}
          numberOfLines={numLines}>
          {text}
        </CText>
      </Hyperlink>
      {showMoreButton ? (
        <TouchableOpacity onPress={toggleTextShown}>
          <CText style={{ ...styles.readButton, ...customStyle?.readButton }}>
            {textShown ? lessText : moreText}
          </CText>
        </TouchableOpacity>
      ) : null}
    </>
  );
};

export default ExpandableTextBox;
