import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ImageBackground,
  Platform,
  NativeModules,
  ActivityIndicator,
} from 'react-native';
import appImages from '../../../../resource/images';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import config from 'react-native-config';
import {useSelector} from 'react-redux';
import {getAuthToken} from '../../../../utils/authUtils';

// Helper function to get user's country code
const getUserCountryCode = async () => {
  try {
    // Get country code from device locale
    let deviceLocale;

    if (Platform.OS === 'ios') {
      // On iOS, use the preferred method
      deviceLocale =
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        NativeModules.I18nManager?.localeIdentifier ||
        'en_US'; // Default fallback for iOS
    } else {
      // For Android
      deviceLocale = NativeModules.I18nManager.localeIdentifier;
    }

    let countryCode = 'US'; // Default fallback

    if (deviceLocale) {
      // Method 1: Extract from locale format like "en_US" or "en-US"
      const parts = deviceLocale.split(/[_-]/);
      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1].toUpperCase();
        // Verify it's a valid country code (2 uppercase letters)
        if (/^[A-Z]{2}$/.test(lastPart)) {
          countryCode = lastPart;
        }
      }

      // Method 2: If deviceLocale itself is just a country code
      if (
        deviceLocale.length === 2 &&
        /^[A-Z]{2}$/.test(deviceLocale.toUpperCase())
      ) {
        countryCode = deviceLocale.toUpperCase();
      }
    }

    return countryCode;
  } catch (error) {
    console.log('error', error);
    return 'US'; // Default to US if we can't determine
  }
};

// Format price with currency symbol
const formatPriceWithSymbol = (priceObj, isDiscounted = false) => {
  if (!priceObj || !priceObj.amount || !priceObj.currency) {
    return '';
  }

  const amount = isDiscounted ? priceObj.amount : priceObj.originalAmount;
  const currency = priceObj.currency;

  // Map currency codes to symbols
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    THB: '฿',
    KRW: '₩',
    RUB: '₽',
    TRY: '₺',
    BRL: 'R$',
    CNY: '¥',
  };

  const symbol = symbols[currency] || currency;
  return `${symbol}${amount}`;
};

// Component that displays product data from API
const PromoModal = ({visible, onClose}) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [userCountry, setUserCountry] = useState('US');
  const authState = useSelector(state => state.auth);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        // Get user's country code
        const countryCode = await getUserCountryCode();
        setUserCountry(countryCode);

        // Get auth token
        const token = await getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Simple fetch from the API endpoint with authentication
        const response = await fetch(
          `${config.API_BASE_URL}/v1/payments/play-store-products`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          setLoading(false);
          return;
        }

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          // Use the first product from the data array
          setProductData(result.data[result.data.length - 1]);
        }
      } catch (error) {
        return;
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchProductDetails();
    }
  }, [visible, authState.accessToken]);

  // Get product price for user's country
  const getProductPrice = () => {
    if (!productData) {
      return null;
    }

    // Try to get price for user's country
    if (productData.prices && productData.prices[userCountry]) {
      const discountedPrice = productData.prices[userCountry];
      const originalPrice = productData.prices[userCountry].originalAmount;

      return {
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        discount: productData.discountPercentage,
      };
    }

    // Fall back to default price
    const discountedPrice = productData.prices[userCountry];
    const originalPrice = productData.prices[userCountry].originalAmount;

    return {
      originalPrice: originalPrice,
      discountedPrice: discountedPrice,
      discount: productData.discountPercentage,
    };
  };

  // Extract product description and convert to features
  const getProductFeatures = () => {
    if (
      !productData ||
      !productData.listings ||
      !productData.listings['en-US']
    ) {
      return [];
    }

    const description = productData.listings['en-US'].description;
    if (!description) {
      return [];
    }

    return description.split('\n').filter(line => line.trim().length > 0);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <ImageBackground
          source={appImages.promoBanner}
          style={styles.modalView}
          resizeMode="cover">
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Image
              source={appImages.closeIcon}
              style={{tintColor: 'black', width: 20, height: 20}}
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
                        priceData?.discount && priceData?.discount > 0
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
                                {formatPriceWithSymbol(
                                  priceData?.discountedPrice,
                                )}
                              </Text>
                            </View>
                          )}
                          <View style={styles.currentPriceContainer}>
                            <Text style={styles.priceText}>
                              {formatPriceWithSymbol(
                                priceData?.discountedPrice,
                                hasDiscount,
                              )}
                            </Text>
                            <Text style={styles.perMonthText}> per month</Text>
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
                      navigation.navigate(ROUTE_NAME.SubscriptionScreen);
                    }}>
                    <LinearGradient
                      colors={['#F4A460', '#DEB887']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.buttonGradient}>
                      <Text style={styles.createButtonText}>Continue</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          )}
        </ImageBackground>
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
    width: '100%',
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: Platform.OS === 'ios' ? 40 : 0,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: Platform.OS === 'ios' ? 50 : 20,
    zIndex: 10,
    padding: 10,
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
    marginBottom: 8,
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  originalPrice: {
    color: '#9CA3AF',
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  currentPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceText: {
    color: 'white',
    fontSize: 28,
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
    width: Platform.OS === 'ios' ? '90%' : '95%',
    height: 55,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#C87D48',
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
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
});

export default PromoModal;
