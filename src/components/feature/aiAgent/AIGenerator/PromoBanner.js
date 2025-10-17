import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import appImages from '../../../../resource/images';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import * as RNIap from 'react-native-iap';
import {getDefaultProductId} from '../../../../api/config';
import CText from '../../../common/core/Text';
import mixpanelAnalytics from '../../../../utils/mixpanelAnalytics';

const PRICE_MULTIPLIERS = {
  payment_101: 1.5,
  payment_201: 1.9,
  payment_301: 9.3,

  payment_100: 1.6,
  payment_200: 1.9,
  payment_300: 9.3,
};

const calculatePricing = product => {
  if (!product || !product.productId) {
    return null;
  }

  const multiplier = PRICE_MULTIPLIERS[product.productId] || 1;

  const priceString = product.price || product.localizedPrice || '0';

  const match = priceString.match(/([0-9]+([.,][0-9]+)?)/);
  const basePrice = match ? parseFloat(match[1].replace(',', '.')) : 0;

  const originalPriceNumeric = basePrice * multiplier;

  const discountPercentage =
    originalPriceNumeric > 0
      ? Math.round(
          ((originalPriceNumeric - basePrice) / originalPriceNumeric) * 100,
        )
      : 0;

  const localizedPrice = product.localizedPrice || `${basePrice.toFixed(2)}`;

  let formattedOriginalPrice = `${originalPriceNumeric.toFixed(2)}`;
  if (match) {
    formattedOriginalPrice = localizedPrice.replace(
      match[1],
      originalPriceNumeric.toFixed(2),
    );
  }

  return {
    originalPriceNumeric,
    discountedPriceNumeric: basePrice,
    formattedOriginalPrice,
    discountedPriceFormatted: localizedPrice,
    discountPercentage,
  };
};

const PromoModal = ({visible, onClose}) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        try {
          await RNIap.initConnection();
        } catch (_) {
          return;
        }

        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        const defaultProductId = await getDefaultProductId(platform);

        if (!defaultProductId) {
          setLoading(false);
          return;
        }

        const storeProducts = await RNIap.getProducts({
          skus: [defaultProductId],
          forceRefresh: true,
        });

        const validProduct = (storeProducts || []).find(
          p => p && p.productId && (p.price || p.localizedPrice),
        );

        if (!validProduct) {
          setLoading(false);
          return;
        }

        setProductData(validProduct);
      } catch (err) {
        console.error('Error fetching IAP products', err);
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      try {
        // Paywall viewed event
        mixpanelAnalytics.trackEvent('paywall_viewed', {
          screen_name: 'PromoBanner',
        });
      } catch (_) {}
      fetchProductDetails();
    }
  }, [visible]);

  const getProductPrice = () => {
    if (!productData) {
      return null;
    }

    const pricing = calculatePricing(productData);
    if (!pricing) {
      return null;
    }

    return {
      originalPriceFormatted: pricing.formattedOriginalPrice,
      discountedPriceFormatted: pricing.discountedPriceFormatted,
      discount: pricing.discountPercentage,
    };
  };

  const getProductFeatures = () => {
    if (!productData) {
      return [];
    }

    const description =
      productData.description ||
      productData.listings?.['en-US']?.description ||
      '';

    return description.split('\n').filter(line => line.trim().length > 0);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}>
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Video
            source={require('../../../../../assets/animation/promoBanner.mp4')}
            style={styles.videoBackground}
            resizeMode="cover"
            repeat={true}
            muted={true}
            playInBackground={false}
            playWhenInactive={false}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              try {
                mixpanelAnalytics.trackEvent('paywall_crossed', {
                  screen_name: 'PromoBanner',
                });
              } catch (_) {}
              onClose();
            }}>
            <Image
              source={appImages.closeIcon}
              style={styles.closeButtonIcon}
            />
          </TouchableOpacity>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#F97316" />
            </View>
          ) : (
            <View style={styles.contentWrapper}>
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
                style={styles.gradientContainer}>
                <View style={styles.gradientContent}>
                  <View style={styles.featuresContainer}>
                    {getProductFeatures().map((feature, index) => (
                      <Text key={index} style={styles.featureText}>
                        • {feature}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.priceContainer}>
                    {(() => {
                      const priceData = getProductPrice();
                      const hasDiscount = !!(
                        priceData?.discount &&
                        priceData?.discount > 0 &&
                        priceData?.originalPriceFormatted &&
                        priceData?.discountedPriceFormatted &&
                        priceData?.originalPriceFormatted !==
                          priceData?.discountedPriceFormatted
                      );

                      return (
                        <>
                          {hasDiscount && (
                            <View style={styles.discountContainer}>
                              <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>
                                  {priceData?.discount}% OFF
                                </Text>
                              </View>
                              <Text style={styles.originalPrice}>
                                {priceData?.originalPriceFormatted}
                              </Text>
                            </View>
                          )}
                          <View style={styles.currentPriceContainer}>
                            <Text style={styles.priceText}>
                              {priceData?.discountedPriceFormatted}
                            </Text>
                          </View>
                        </>
                      );
                    })()}
                  </View>

                  <Text style={styles.renewalText}>
                    Auto renewable. Cancel anytime.
                  </Text>

                  <TouchableOpacity
                    style={styles.createButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      onClose();
                      navigation.navigate(
                        ROUTE_NAME.RecurringSubscriptionScreen,
                      );
                    }}>
                    <LinearGradient
                      colors={[
                        'rgba(255, 255, 255, 0.20)',
                        'rgba(255, 255, 255, 0.40)',
                      ]}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.gradient}>
                      <CText style={[styles.createButtonText]}>Continue</CText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <View style={styles.linksWrapper}>
                  <View style={styles.linksContainer}>
                    <TouchableOpacity
                      style={styles.link}
                      onPress={() => {
                        navigation.navigate(ROUTE_NAME.PrivacyPolicy);
                      }}>
                      <Text style={styles.linkText}>Privacy Policy</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.linksContainer}>
                    <TouchableOpacity
                      style={styles.link}
                      onPress={() => {
                        navigation.navigate(ROUTE_NAME.TermsAndConditions);
                      }}>
                      <Text style={styles.linkText}>Terms & Conditions</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  modalView: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradientContainer: {
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 80,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    width: '100%',
  },
  gradientContent: {
    width: '90%',
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: Platform.OS === 'ios' ? 50 : 40,
    zIndex: 10,
    padding: 10,
  },
  closeButtonIcon: {
    tintColor: 'black',
    width: 40,
    height: 40,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 213, 169, 0.30)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EA7C08',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  featureText: {
    color: 'white',
    marginBottom: 5,
    fontSize: Platform.OS === 'ios' ? 16 : 18,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  originalPrice: {
    color: '#9CA3AF',
    fontSize: 18,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  currentPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  priceText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  perMonthText: {
    color: 'white',
    fontSize: 24,
  },
  renewalText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
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
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#C87D48',
  },
  priceGradient: {
    borderRadius: 16,
    padding: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  linksContainer: {
    marginBottom: 30,
  },
  link: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  linksWrapper: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default PromoModal;
