/* eslint-disable react-native/no-inline-styles */
import React, {useMemo, useState} from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import CText from '../../../common/core/Text';
import Colors from '../../../common/Colors';
import getStyles from './AIGenerator.styles';
import LinearGradient from 'react-native-linear-gradient';
import appImages from '../../../../resource/images';
import CView from '../../../common/core/View';
import mixpanelAnalytics from '../../../../utils/mixpanelAnalytics';

const LanguagePicker = ({
  value,
  onChange,
  triggerStyle,
  textStyle,
  labelPrefix = 'Language: ',
}) => {
  const {mode} = useTheme();
  const styles = getStyles(mode);
  const [visible, setVisible] = useState(false);

  const languages = useMemo(
    () => [
      'English',
      'Hindi',
      'Punjabi',
      'Tamil',
      'Telugu',
      'Kannada',
      'Malayalam',
      'Bengali',
      'Bhojpuri',
      'Urdu',
      'Marathi',
      'Gujarati',
      'Arabic',
      'Sinhala',
    ],
    [],
  );

  const themeColors = Colors[mode] || Colors.dark;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setVisible(true)}
        style={
          triggerStyle || {
            alignSelf: 'flex-start',
            marginHorizontal: 15,
            marginTop: 6,
            backgroundColor: '#1E1E1E',
            borderRadius: 92,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: '#403F3F',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }
        }>
        <CView style={optionStyles.languageContainer}>
          <CText
            style={
              textStyle || {color: themeColors.textBlack, fontWeight: '600'}
            }>
            {value || 'English'}
          </CText>
          <CView style={optionStyles.downArrowContainer}>
            <Image
              source={appImages.arrowDownIcon}
              style={optionStyles.downArrow}
            />
          </CView>
        </CView>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        swipeDirection={['down']}
        propagateSwipe
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        avoidKeyboard={true}
        onBackdropPress={() => setVisible(false)}
        onBackButtonPress={() => setVisible(false)}>
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetContent}>
            <View style={optionStyles.bottomSheetHeader}>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Image
                  source={appImages.closeIcon}
                  style={optionStyles.closeIcon}
                />
              </TouchableOpacity>
            </View>
            <CText size="largeBold" style={styles.bottomSheetTitle}>
              Select Language
            </CText>
            <ScrollView style={{maxHeight: 360}}>
              {languages.map(lang => {
                const selected = (value || 'English') === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    activeOpacity={0.9}
                    onPress={() => {
                      try {
                        mixpanelAnalytics.trackEvent('dropdown_clicked', {
                          dropdown_id: 'lng_drp',
                          dropdown_option: lang,
                          dropdown_option_id: lang.toLowerCase(),
                        });
                      } catch (_) {}
                      onChange && onChange(lang);
                    }}
                    style={optionStyles.optionRow}>
                    <CText
                      style={[
                        optionStyles.optionText,
                        selected && optionStyles.optionTextSelected,
                      ]}>
                      {lang}
                    </CText>
                  </TouchableOpacity>
                );
              })}
              <View style={{height: 4}} />
            </ScrollView>
            <TouchableOpacity
              style={styles.createButton}
              activeOpacity={0.8}
              onPress={() => setVisible(false)}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.20)',
                  'rgba(255, 255, 255, 0.40)',
                ]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradient}>
                <CText style={[styles.createButtonText]}>Select</CText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const optionStyles = StyleSheet.create({
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2E2E2E',
    backgroundColor: '#242424',
    marginBottom: 10,
  },
  optionText: {
    color: '#CFCFCF',
    fontSize: 16,
  },
  optionTextSelected: {
    color: '#FDF5E6',
    fontWeight: '700',
  },
  bottomSheetHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
  },
  createButton: {
    width: '100%',
    height: 56,
    overflow: 'hidden',
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#A84D0C',
    backgroundColor: '#FC6C14',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FFF',
    borderStyle: 'solid',
    backgroundColor: '#FC6C14',
    boxShadow: '0 0 14px 0 #FFDBC5 inset',
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
    ...(Platform.OS === 'ios' ? {paddingBottom: 3} : {}),
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#FDF5E6',
  },
  downArrow: {
    width: 24,
    height: 24,
    tintColor: '#FDF5E6',
  },
  downArrowContainer: {
    marginLeft: 5,
  },
  languageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default LanguagePicker;
