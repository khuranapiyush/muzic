import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ImageBackground,
  SafeAreaView,
  Platform,
  NativeModules,
  ActivityIndicator,
} from 'react-native';
import appImages from '../../../../resource/images';
import {SCREEN_HEIGHT} from '@gorhom/bottom-sheet';
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
    const deviceLocale =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0]
        : NativeModules.I18nManager.localeIdentifier;

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
    return 'US'; // Default to US if we can't determine
  }
};

// Format price with currency symbol
const formatPriceWithSymbol = priceObj => {
  if (!priceObj || !priceObj.amount || !priceObj.currency) {
    return '';
  }

  const amount = priceObj.amount;
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
          setProductData(result.data[0]);
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
    if (!productData) return null;

    // Try to get price for user's country
    if (productData.prices && productData.prices[userCountry]) {
      return productData.prices[userCountry];
    }

    // Fall back to default price
    return productData.defaultPrice;
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
    if (!description) return [];

    return description.split('\n').filter(line => line.trim().length > 0);
  };

  // Calculate "original" price for display (50% markup)
  const getOriginalPrice = () => {
    const priceObj = getProductPrice();
    if (!priceObj) return '';

    const originalPriceObj = {
      amount: Math.round(priceObj.amount * 1.5),
      currency: priceObj.currency,
    };

    return formatPriceWithSymbol(originalPriceObj);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection={['down']}
      propagateSwipe
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={true}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredView}>
          <ImageBackground
            source={appImages.promoBanner}
            style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Image
                source={appImages.closeIcon}
                style={{tintColor: 'black'}}
              />
            </TouchableOpacity>

            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,1)']}
              style={styles.container}>
              {loading ? (
                <ActivityIndicator size="large" color="#F97316" />
              ) : (
                <>
                  <Text style={styles.discountText}>33% OFF</Text>

                  <View style={styles.featuresContainer}>
                    {getProductFeatures().map((feature, index) => (
                      <Text key={index} style={styles.featureText}>
                        • {feature}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.oldPrice}>{getOriginalPrice()}</Text>
                    <Text style={styles.newPrice}>
                      {formatPriceWithSymbol(getProductPrice())}
                    </Text>
                    <Text style={styles.newPriceText}> per month</Text>
                  </View>
                </>
              )}

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
                  style={styles.gradient}>
                  <Text style={styles.createButtonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Terms of Use</Text>
                <Text style={styles.footerText}>Privacy</Text>
                <Text style={styles.footerText}>Restore</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 20,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.4,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: Platform.OS === 'ios' ? 50 : 20,
    zIndex: 1,
    padding: 10,
  },
  discountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 10,
  },
  featuresContainer: {
    width: '85%',
    backgroundColor: 'rgba(255, 213, 169, 0.30)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EA7C08',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featureText: {
    color: 'white',
    marginBottom: 5,
    fontSize: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  oldPrice: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 10,
    fontSize: 24,
  },
  newPrice: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 24,
  },
  newPriceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
  renewalText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 20,
  },
  createButton: {
    width: '95%',
    height: 60,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#C87D48',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#C87D48',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default PromoModal;
