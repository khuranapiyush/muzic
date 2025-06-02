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
import * as RNLocalize from 'react-native-localize';
import * as RNIap from 'react-native-iap';

// Add price multiplier constants at the top after imports
const PRICE_MULTIPLIERS = {
  payment_101: 1, // Base product
  payment_201: 1.6,
  payment_301: 9.3,
};

// Function to calculate original and discounted prices for iOS
const calculateIOSPricing = product => {
  if (!product || !product.productId) return null;

  const multiplier = PRICE_MULTIPLIERS[product.productId] || 1;

  // Get numeric price from product
  const getBasePrice = () => {
    try {
      const priceString = product.price || product.localizedPrice || '0';
      const matches = priceString.match(/([0-9]+([.][0-9]*)?|[.][0-9]+)/);
      return matches && matches[0] ? parseFloat(matches[0]) : 0;
    } catch (error) {
      return 0;
    }
  };

  const basePrice = getBasePrice();
  const originalPrice = basePrice * multiplier;
  const discountedPrice = basePrice;

  // Calculate discount percentage
  const discountPercentage =
    originalPrice > 0
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : 0;

  // Get currency symbol and code from the product
  const currencySymbol = (product.price || product.localizedPrice || '$0')
    .replace(/[0-9.,]/g, '')
    .trim();
  const currencyCode = product.currency || 'USD';

  return {
    originalPrice,
    discountedPrice,
    discountPercentage,
    currency: currencySymbol,
    currencyCode: currencyCode,
    formattedOriginalPrice: `${originalPrice.toFixed(2)}`,
    formattedDiscountedPrice: `${discountedPrice.toFixed(2)}`,
  };
};

// Enhanced function to get user's country code from device locale settings
const getUserCountryCode = async () => {
  try {
    // Method 1: Use react-native-localize to get country code reliably
    let countryFromLib;
    try {
      countryFromLib = RNLocalize.getCountry();
    } catch (localizeError) {
      // Silent fallback
    }

    // Validate country code (should be 2 uppercase letters)
    if (
      countryFromLib &&
      countryFromLib.length === 2 &&
      /^[A-Z]{2}$/.test(countryFromLib)
    ) {
      return countryFromLib;
    }

    // Method 2: Get comprehensive locale information
    let locales;
    try {
      locales = RNLocalize.getLocales();
    } catch (localesError) {
      // Silent fallback
    }

    if (locales && locales.length > 0) {
      const primaryLocale = locales[0];
      if (
        primaryLocale.countryCode &&
        /^[A-Z]{2}$/.test(primaryLocale.countryCode)
      ) {
        return primaryLocale.countryCode;
      }
    }

    // Method 3: Get timezone-based country detection
    let timeZone;
    try {
      timeZone = RNLocalize.getTimeZone();
    } catch (timezoneError) {
      // Silent fallback
    }

    // Method 4: Get currency information
    let currencies;
    try {
      currencies = RNLocalize.getCurrencies();
    } catch (currencyError) {
      // Silent fallback
    }

    // Method 5: Platform-specific fallbacks with enhanced safety
    let deviceLocale;
    let deviceRegion;

    if (Platform.OS === 'ios') {
      try {
        // Safe iOS NativeModules access
        const settingsManager = NativeModules.SettingsManager;
        const settings = settingsManager?.settings;

        if (settings) {
          // Check for region setting first (iOS specific)
          if (settings.AppleICUForceDefaultCountryCode) {
            deviceRegion = settings.AppleICUForceDefaultCountryCode;
          }

          // Check for country code in other iOS settings
          if (settings.AppleICUCountryCode) {
            deviceRegion = deviceRegion || settings.AppleICUCountryCode;
          }

          // Check language settings
          const appleLanguages = settings.AppleLanguages;
          if (Array.isArray(appleLanguages) && appleLanguages.length > 0) {
            deviceLocale = appleLanguages[0]; // e.g., "en-IN"
          } else if (settings.AppleLocale) {
            deviceLocale = settings.AppleLocale; // older iOS versions
          }
        }

        // Additional iOS fallback using NSLocale if available
        try {
          const nsLocale = NativeModules.NSLocale;
          if (nsLocale && nsLocale.getCurrentCountryCode) {
            const iosCountryCode = await nsLocale.getCurrentCountryCode();
            if (iosCountryCode) {
              deviceRegion = deviceRegion || iosCountryCode;
            }
          }
        } catch (nsLocaleError) {
          // Silent fallback
        }
      } catch (iosError) {
        // Silent fallback
      }
    } else if (Platform.OS === 'android') {
      try {
        // Safe Android NativeModules access
        const i18nManager = NativeModules.I18nManager;
        if (i18nManager) {
          deviceLocale = i18nManager.localeIdentifier || 'en_US';
        }

        // Try to get Android system locale
        try {
          const systemLocale = NativeModules.AndroidLocale;
          if (systemLocale && systemLocale.getCountryCode) {
            const androidCountryCode = await systemLocale.getCountryCode();
            if (androidCountryCode) {
              deviceRegion = deviceRegion || androidCountryCode;
            }
          }
        } catch (androidLocaleError) {
          // Silent fallback
        }
      } catch (androidError) {
        // Silent fallback
      }
    }

    // Process region first if available (more specific than locale)
    if (deviceRegion && /^[A-Z]{2}$/.test(deviceRegion.toUpperCase())) {
      const regionCode = deviceRegion.toUpperCase();
      return regionCode;
    }

    // Process locale as fallback
    let fallbackCountryCode = 'US'; // Default fallback

    if (deviceLocale) {
      // Extract from locale format like "en_US", "en-US", or "en_IN"
      const parts = deviceLocale.split(/[_-]/);

      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1].toUpperCase();
        // Verify it's a valid country code (2 uppercase letters)
        if (/^[A-Z]{2}$/.test(lastPart)) {
          fallbackCountryCode = lastPart;
        }
      }
    }

    // Method 6: Enhanced timezone-to-country mapping
    if (timeZone && fallbackCountryCode === 'US') {
      const timezoneCountryMap = {
        // Asia
        'Asia/Kolkata': 'IN',
        'Asia/Mumbai': 'IN',
        'Asia/Delhi': 'IN',
        'Asia/Calcutta': 'IN',
        'Asia/Tokyo': 'JP',
        'Asia/Shanghai': 'CN',
        'Asia/Seoul': 'KR',
        'Asia/Singapore': 'SG',
        'Asia/Hong_Kong': 'HK',
        'Asia/Bangkok': 'TH',
        'Asia/Manila': 'PH',
        // Europe
        'Europe/London': 'GB',
        'Europe/Paris': 'FR',
        'Europe/Berlin': 'DE',
        'Europe/Rome': 'IT',
        'Europe/Madrid': 'ES',
        'Europe/Amsterdam': 'NL',
        'Europe/Stockholm': 'SE',
        'Europe/Oslo': 'NO',
        'Europe/Copenhagen': 'DK',
        'Europe/Helsinki': 'FI',
        'Europe/Dublin': 'IE',
        'Europe/Zurich': 'CH',
        'Europe/Vienna': 'AT',
        'Europe/Brussels': 'BE',
        'Europe/Prague': 'CZ',
        'Europe/Warsaw': 'PL',
        'Europe/Moscow': 'RU',
        // Americas
        'America/New_York': 'US',
        'America/Los_Angeles': 'US',
        'America/Chicago': 'US',
        'America/Denver': 'US',
        'America/Phoenix': 'US',
        'America/Toronto': 'CA',
        'America/Vancouver': 'CA',
        'America/Mexico_City': 'MX',
        'America/Sao_Paulo': 'BR',
        'America/Buenos_Aires': 'AR',
        'America/Lima': 'PE',
        'America/Bogota': 'CO',
        'America/Santiago': 'CL',
        // Oceania
        'Australia/Sydney': 'AU',
        'Australia/Melbourne': 'AU',
        'Australia/Perth': 'AU',
        'Pacific/Auckland': 'NZ',
        // Africa
        'Africa/Cairo': 'EG',
        'Africa/Lagos': 'NG',
        'Africa/Johannesburg': 'ZA',
        'Africa/Casablanca': 'MA',
        // Middle East
        'Asia/Dubai': 'AE',
        'Asia/Riyadh': 'SA',
        'Asia/Tehran': 'IR',
        'Asia/Jerusalem': 'IL',
      };

      if (timezoneCountryMap[timeZone]) {
        return timezoneCountryMap[timeZone];
      }
    }

    // Method 7: Currency-based country detection as final fallback
    if (currencies && currencies.length > 0 && fallbackCountryCode === 'US') {
      const currencyCountryMap = {
        INR: 'IN',
        USD: 'US',
        EUR: 'DE', // Default to Germany for EUR
        GBP: 'GB',
        JPY: 'JP',
        CAD: 'CA',
        AUD: 'AU',
        SGD: 'SG',
        HKD: 'HK',
        CNY: 'CN',
        KRW: 'KR',
        THB: 'TH',
        MXN: 'MX',
        BRL: 'BR',
        RUB: 'RU',
        CHF: 'CH',
        SEK: 'SE',
        NOK: 'NO',
        DKK: 'DK',
        PLN: 'PL',
        CZK: 'CZ',
        HUF: 'HU',
        RON: 'RO',
        BGN: 'BG',
        HRK: 'HR',
        TRY: 'TR',
        ZAR: 'ZA',
        EGP: 'EG',
        AED: 'AE',
        SAR: 'SA',
        ILS: 'IL',
      };

      const primaryCurrency = currencies[0];
      if (primaryCurrency && currencyCountryMap[primaryCurrency]) {
        return currencyCountryMap[primaryCurrency];
      }
    }

    return fallbackCountryCode;
  } catch (error) {
    return 'US'; // Default to US if we can't determine
  }
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

        // Get user's country code with enhanced detection
        const countryCode = await getUserCountryCode();
        setUserCountry(countryCode);

        // iOS-specific product fetching using RNIap
        if (Platform.OS === 'ios') {
          try {
            // Initialize RNIap connection if not already initialized
            try {
              await RNIap.initConnection();
            } catch (initErr) {
              // Silent catch - RNIap might already be initialized
            }

            // Define product IDs to fetch from App Store Connect
            const productIds = ['payment_101', 'payment_201', 'payment_301'];

            // Fetch products from App Store
            const iosProducts = await RNIap.getProducts({
              skus: productIds,
              forceRefresh: true,
            });

            // Validate and filter products
            const validProducts = iosProducts.filter(
              product =>
                product &&
                product.productId &&
                (product.price || product.localizedPrice),
            );

            if (validProducts.length === 0) {
              setLoading(false);
              return;
            }

            // Sort products by price (highest to lowest)
            const sortedProducts = [...validProducts].sort((a, b) => {
              const priceA = calculateIOSPricing(a)?.discountedPrice || 0;
              const priceB = calculateIOSPricing(b)?.discountedPrice || 0;
              return priceB - priceA;
            });

            const highestPricedProduct = sortedProducts[0];

            if (!highestPricedProduct) {
              setLoading(false);
              return;
            }

            try {
              const pricing = calculateIOSPricing(highestPricedProduct);

              if (!pricing) {
                setLoading(false);
                return;
              }

              // Format the product data for iOS with pricing information
              const formattedProduct = {
                productId: highestPricedProduct.productId || '',
                title: highestPricedProduct.title || 'Premium Pack',
                description:
                  highestPricedProduct.description ||
                  'Premium features and credits',
                price: pricing.formattedDiscountedPrice,
                currency: pricing.currencyCode,
                localizedPrice: pricing.formattedDiscountedPrice,
                listings: {
                  'en-US': {
                    description:
                      highestPricedProduct.description ||
                      'Premium features and credits',
                  },
                },
                prices: {
                  [countryCode]: {
                    currency: pricing.currencyCode,
                    amount: pricing.formattedDiscountedPrice,
                    originalAmount: pricing.formattedOriginalPrice,
                  },
                },
                defaultPrice: {
                  currency: pricing.currencyCode,
                  amount: pricing.formattedDiscountedPrice,
                },
                discountPercentage: pricing.discountPercentage,
                isIOS: true,
                currencyCode: pricing.currencyCode,
              };

              setProductData(formattedProduct);
              setLoading(false);
              return;
            } catch (formatError) {
              setLoading(false);
              return;
            }
          } catch (iosError) {
            setLoading(false);
            return;
          }
        }

        // Only reach here for Android
        try {
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
            setLoading(false);
            return;
          }

          const result = await response.json();

          if (result.success && result.data && result.data.length > 0) {
            // Use the first product from the data array
            const selectedProduct = result.data[result.data.length - 1];
            setProductData(selectedProduct);
          }
        } catch (error) {
          return;
        } finally {
          setLoading(false);
        }
      } catch (error) {
        return;
      }
    };

    if (visible) {
      fetchProductDetails();
    }
  }, [visible, authState.accessToken]);

  // Modify getProductPrice to handle iOS discounts
  const getProductPrice = () => {
    if (!productData) {
      return null;
    }

    // Special handling for iOS products
    if (Platform.OS === 'ios') {
      const price = productData.prices?.[userCountry];
      if (!price) {
        return null;
      }

      return {
        originalPriceFormatted: price.originalAmount,
        discountedPriceFormatted: price.amount,
        discount: productData.discountPercentage || 0,
        currencyCode: productData.prices[userCountry]?.currency || 'USD',
      };
    }

    // Android logic
    if (productData.prices && productData.prices[userCountry]) {
      const price = productData.prices[userCountry];
      return {
        originalPriceFormatted: price.originalAmount,
        discountedPriceFormatted: price.amount,
        discount: productData.discountPercentage || 0,
        currencyCode: price.currency || 'USD',
      };
    }

    return null;
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
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}>
      <View style={styles.modalContainer}>
        <ImageBackground
          source={appImages.promoBanner}
          style={styles.modalView}
          resizeMode="cover">
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Image
              source={appImages.closeIcon}
              style={{tintColor: 'black', width: 40, height: 40}}
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
                      const hasDiscount =
                        Platform.OS === 'ios'
                          ? priceData?.discount > 0
                          : !!(
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
                                {priceData?.currencyCode}{' '}
                                {priceData?.originalPriceFormatted}
                              </Text>
                            </View>
                          )}
                          <View style={styles.currentPriceContainer}>
                            <Text style={styles.priceText}>
                              {priceData?.currencyCode}{' '}
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
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: Platform.OS === 'ios' ? 50 : 40,
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
    textAlign: 'center',
    marginBottom: Platform.OS === 'ios' ? 5 : 0,
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
