import React, { useRef, useState } from 'react';
import { Image, Pressable, TouchableOpacity } from 'react-native';
import appImages from '../../../../../resource/images';
import CText from '../../../../common/core/Text';
import styles from './style';

const VideoCoinToolTip = ({ coin }) => {
  const touchable = useRef();
  const [showPopover, setShowPopover] = useState(false);
  const [popoverHeight, setPopoverHeight] = useState(0);
  const hideTimeoutRef = useRef(null);

  const onTouchableLayout = e => {
    const height = e.nativeEvent.layout.height;
    setPopoverHeight(height);
  };

  const handlePopoverClick = () => {
    setShowPopover(!showPopover);

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      setShowPopover(false);
    }, 5000);
  };

  return (
    <>
      <TouchableOpacity
        ref={touchable}
        pointerEvents="box-none"
        onLayout={onTouchableLayout}
        onPress={handlePopoverClick}
        style={styles.mainBtnContainer}>
        <Image source={appImages.coin} style={styles.coinIcon} />
        <CText style={styles.coinText} color="commonBlack">
          {coin}
        </CText>
        <Image source={appImages.infoIcon} style={styles.infoIcon} />
      </TouchableOpacity>
      {showPopover && (
        <Pressable
          onPress={handlePopoverClick}
          style={{ ...styles.popoverBtnContainer, top: popoverHeight + 5 }}>
          <CText size="small" color="commonBlack">
            Earn Upto {coin} Coins for
          </CText>
          <CText size="small" color="commonBlack">
            watching this Video
          </CText>
        </Pressable>
      )}
    </>
  );
};

export default VideoCoinToolTip;
