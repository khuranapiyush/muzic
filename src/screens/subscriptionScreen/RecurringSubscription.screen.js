import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import * as RNIap from 'react-native-iap';
import {useSelector} from 'react-redux';
import config from 'react-native-config';
import CText from '../../components/common/core/Text';
import {getPlatformProductIds} from '../../api/config';
import {useCredits} from '../../hooks/useCredits';
import LinearGradient from 'react-native-linear-gradient';
import GradientBackground from '../../components/common/GradientBackground';
import appImages from '../../resource/images';
import {selectCreditsPerSong} from '../../stores/selector';
import {useNavigation} from '@react-navigation/native';

const API_URL = config.API_BASE_URL;

const RecurringSubscriptionScreen = () => {
  const authState = useSelector(state => state.auth);
  const {refreshCredits} = useCredits();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [offerTokenByProduct, setOfferTokenByProduct] = useState({});
  const [selectedId, setSelectedId] = useState('subplan_1');
  const [pending, setPending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {credits} = useCredits();

  const purchaseUpdateSub = useRef(null);
  const purchaseErrorSub = useRef(null);

  const productIdsPromise = useMemo(
    () => getPlatformProductIds(Platform.OS),
    [],
  );

  // Helper function to extract price from product for sorting
  const getProductPrice = useCallback(product => {
    if (Platform.OS === 'ios') {
      return product.price || 0;
    } else {
      const priceAmountMicros =
        product?.subscriptionOfferDetails?.[0]?.pricingPhases
          ?.pricingPhaseList?.[0]?.priceAmountMicros;
      return priceAmountMicros ? priceAmountMicros / 1000000 : 0;
    }
  }, []);

  // Helper function to sort products by price (lowest to highest)
  const sortProductsByPrice = useCallback(
    productList => {
      return [...productList].sort((a, b) => {
        const priceA = getProductPrice(a);
        const priceB = getProductPrice(b);
        return priceA - priceB;
      });
    },
    [getProductPrice],
  );

  const fetchCatalog = useCallback(async () => {
    try {
      const ids = await productIdsPromise;
      console.log(ids, 'ids');
      const subs = await RNIap.getSubscriptions({skus: ids});

      // Sort products by price (lowest to highest)
      const sortedSubs = sortProductsByPrice(subs || []);
      console.log(
        'Products sorted by price:',
        sortedSubs.map(p => ({
          productId: p.productId,
          price: getProductPrice(p),
        })),
      );

      setProducts(sortedSubs);

      if (Platform.OS === 'android') {
        const map = {};
        sortedSubs?.forEach(s => {
          const details = Array.isArray(s?.subscriptionOfferDetails)
            ? s.subscriptionOfferDetails
            : [];
          const token = details?.[0]?.offerToken;
          if (s?.productId && token) {
            map[s.productId] = token;
          }
        });
        setOfferTokenByProduct(map);
      }

      // Set the first (cheapest) product as selected by default
      setSelectedId(sortedSubs?.[0]?.productId || '');
    } catch (err) {
      Alert.alert('Store Error', err?.message || 'Failed to load products');
    }
  }, [productIdsPromise, sortProductsByPrice, getProductPrice]);

  const verifySubscription = useCallback(
    async purchase => {
      try {
        const receiptData = purchase?.transactionReceipt || '';
        const isSandbox = /sandbox/i.test(receiptData);
        const body = Platform.select({
          ios: {
            platform: 'IOS',
            productId: purchase.productId,
            receiptData,
            isSubscription: true,
            environment: isSandbox ? 'sandbox' : 'production',
            allowSandboxInProduction: true,
            bundleId: config.APP_STORE_BUNDLE_ID || 'com.muzic',
            transactionId: purchase?.transactionId,
            originalTransactionId:
              purchase?.originalTransactionIdentifier ||
              purchase?.originalTransactionId,
          },
          android: {
            platform: 'ANDROID',
            productId: purchase.productId,
            purchaseToken: purchase.purchaseToken,
            packageName: config.GOOGLE_PLAY_PACKAGE_NAME,
          },
        });
        const res = await fetch(`${API_URL}/v1/payments/subscription/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authState?.accessToken}`,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Verification failed');
        }
        await RNIap.finishTransaction({purchase, isConsumable: false});
        await refreshCredits(true);
        Alert.alert('Success', 'Subscription activated');
      } catch (e) {
        try {
          await RNIap.finishTransaction({purchase, isConsumable: false});
        } catch (_) {}
        throw e;
      }
    },
    [authState?.accessToken, refreshCredits],
  );

  const onPurchaseUpdated = useCallback(
    async purchase => {
      try {
        if (!purchase?.productId) {
          return;
        }
        await verifySubscription(purchase);
      } catch (err) {
        Alert.alert(
          'Purchase Error',
          err?.message || 'Failed to complete purchase',
        );
      } finally {
        setPending(false);
      }
    },
    [verifySubscription],
  );

  const onPurchaseError = useCallback(error => {
    if (error?.code !== 'E_USER_CANCELLED') {
      Alert.alert('Purchase Error', error?.message || 'Failed');
    }
    setPending(false);
  }, []);

  const initIAP = useCallback(async () => {
    try {
      await RNIap.initConnection();
      purchaseUpdateSub.current =
        RNIap.purchaseUpdatedListener(onPurchaseUpdated);
      purchaseErrorSub.current = RNIap.purchaseErrorListener(onPurchaseError);
      await fetchCatalog();
    } finally {
      setLoading(false);
    }
  }, [fetchCatalog, onPurchaseError, onPurchaseUpdated]);

  useEffect(() => {
    console.log('Before the initIAP');
    initIAP();
    return () => {
      purchaseUpdateSub.current?.remove?.();
      purchaseErrorSub.current?.remove?.();
      RNIap.endConnection();
    };
  }, [initIAP]);

  const handleSubscribe = useCallback(async () => {
    if (!selectedId) {
      return;
    }
    try {
      setPending(true);
      if (Platform.OS === 'android') {
        const offerToken = offerTokenByProduct[selectedId];
        if (!offerToken) {
          setPending(false);
          Alert.alert(
            'Purchase Error',
            'No subscription offer available for this plan. Please try again later.',
          );
          return;
        }
        await RNIap.requestSubscription({
          sku: selectedId,
          subscriptionOffers: [
            {
              sku: selectedId,
              offerToken,
            },
          ],
        });
      } else {
        await RNIap.requestSubscription({
          sku: selectedId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        });
      }
    } catch (err) {
      if (err?.code !== 'E_USER_CANCELLED') {
        Alert.alert('Purchase Error', err?.message || 'Failed');
      }
      setPending(false);
    }
  }, [offerTokenByProduct, selectedId]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchCatalog();
    } finally {
      setRefreshing(false);
    }
  }, [fetchCatalog]);

  const getDisplayPrice = useCallback(product => {
    if (!product) {
      return '';
    }
    // Prefer localizedPrice when available
    if (product.localizedPrice) {
      return product.localizedPrice;
    }
    if (product.price && product.currency) {
      return `${product.price} ${product.currency}`;
    }
    if (typeof product.price === 'string') {
      return product.price;
    }
    return '';
  }, []);

  const creditsPerSong = useSelector(selectCreditsPerSong);

  const PlanCard = useCallback(
    ({
      product,
      selected,
      onPress,
      hasDiscount,
      discount,
      originalPrice,
      multiplierPrice,
      currency,
    }) => {
      const updatedTitle = (product?.title || 'Subscription').replace(
        '(MakeMySong - AI Music & Songs)',
        '',
      );
      const subtitle = product?.description || '';
      const price = getDisplayPrice(product);
      return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
          <LinearGradient
            colors={[
              'rgba(255, 213, 169, 0.60)',
              '#FFD5A9',
              'rgba(255, 213, 169, 0.60)',
            ]}
            start={{x: -0.3553, y: 0}}
            end={{x: 1.0777, y: 0}}
            style={[styles.planCard, selected && styles.planTouchableSelected]}>
            {selected && (
              <View style={styles.subscriptionBgContainer}>
                <Image
                  source={appImages.greenTick}
                  style={styles.subscriptionBg}
                />
              </View>
            )}

            <View>
              <View style={styles.planHeader}>
                <CText
                  style={styles.planTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {updatedTitle}
                </CText>
                <View style={styles.priceContainer}>
                  {hasDiscount ? (
                    <View style={styles.discountPriceWrapper}>
                      <View style={styles.discountBadge}>
                        <CText style={styles.discountText}>
                          {discount || 0}% OFF
                        </CText>
                      </View>
                      <CText style={styles.planOriginalPrice}>
                        {currency} {multiplierPrice.toFixed(2)}
                      </CText>
                      <CText style={styles.planPrice}>
                        {currency} {originalPrice}
                      </CText>
                    </View>
                  ) : (
                    <View style={styles.regularPriceWrapper}>
                      <CText
                        style={styles.planPrice}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {currency} {price}
                      </CText>
                    </View>
                  )}
                </View>
              </View>

              <View
                style={Platform.OS === 'ios' ? styles.featureContainer : {}}>
                <View style={styles.featureRow}>
                  <CText style={styles.featureText}>{subtitle}</CText>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    },
    [getDisplayPrice],
  );

  const displayCredits = () => {
    if (typeof credits === 'object' && credits !== null) {
      return credits?.data?.balance || 0;
    }
    return typeof credits === 'number' ? credits : 0;
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <GradientBackground>
        <View style={styles.flex}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={appImages.arrowBack} style={styles.arrowBack} />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <CText
                size="bricolageHeading"
                text="Choose your plan"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.headerTitleText}
              />
              <CText
                style={styles.subtitle}
                size="small"
                text="Unlock premium features and monthly credits"
              />
            </View>
          </View>
          <View style={styles.creditsContainer}>
            <CText style={styles.creditsTitle}>Credits</CText>
            <CText style={styles.creditsNumber}>{displayCredits()}</CText>
            <CText style={styles.creditsSubtitleText}>
              {creditsPerSong} Credit{creditsPerSong !== 1 ? 's' : ''} = 1 Song
              Generation
            </CText>
          </View>

          <View style={styles.plansWrapper}>
            {loading ? (
              <CText text="Loading plans…" />
            ) : products?.length ? (
              products.map(p => {
                const selected = p.productId === selectedId;

                const PRICE_MULTIPLIERS = {
                  subplan_1: 1.33,
                  subplan_2: 2,
                  subplan_3: 10,
                };

                const priceAmountMicros =
                  Platform.OS === 'ios'
                    ? p.price
                    : p?.subscriptionOfferDetails?.[0]?.pricingPhases
                        ?.pricingPhaseList?.[0]?.priceAmountMicros;
                const originalPrice =
                  Platform.OS === 'ios' ? p.price : priceAmountMicros / 1000000;
                const multiplierPrice =
                  Platform.OS === 'ios'
                    ? originalPrice * PRICE_MULTIPLIERS[p.productId]
                    : originalPrice * PRICE_MULTIPLIERS[p.productId];
                const currency =
                  Platform.OS === 'ios'
                    ? p.localizedPrice[0]
                    : p?.subscriptionOfferDetails?.[0]?.pricingPhases
                        ?.pricingPhaseList?.[0]?.priceCurrencyCode;
                const hasDiscount = !!PRICE_MULTIPLIERS[p.productId];
                const discount = (
                  ((multiplierPrice - originalPrice) / multiplierPrice) *
                  100
                ).toFixed(0);

                return (
                  <PlanCard
                    key={p.productId}
                    product={p}
                    selected={selected}
                    onPress={() => setSelectedId(!selected ? p.productId : '')}
                    hasDiscount={hasDiscount}
                    discount={discount}
                    originalPrice={originalPrice}
                    multiplierPrice={multiplierPrice}
                    currency={currency}
                  />
                );
              })
            ) : (
              <CText text="No plans available right now" />
            )}
          </View>

          <TouchableOpacity
            style={[styles.createButton, styles.disabledButton]}
            activeOpacity={0.8}
            onPress={handleSubscribe}
            disabled={!selectedId || pending}>
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.20)',
                'rgba(255, 255, 255, 0.40)',
              ]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[
                styles.gradient,
                (!selectedId || pending) && styles.disabledButtonText,
              ]}>
              <CText style={[styles.createButtonText]}>
                {pending ? 'Processing…' : 'Continue'}
              </CText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    </ScrollView>
  );
};

export default RecurringSubscriptionScreen;

const styles = StyleSheet.create({
  headerTitleText: {
    lineHeight: 30,
    letterSpacing: 0.2,
  },
  container: {flexGrow: 1},
  subtitle: {opacity: 0.8, marginTop: 4},
  plansWrapper: {marginTop: 16, gap: 12},
  planTouchable: {borderRadius: 12},
  planTouchableSelected: {
    opacity: 1,
    transform: [{scale: 1.03}],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.5)',
    marginBottom: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 4,
  },
  planCardSelected: {
    borderColor: 'rgba(255,255,255,0.3)',
  },
  planSubtitle: {opacity: 0.9, marginTop: 6},
  planFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'transparent',
    height: 23,
    width: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    padding: 5,
    borderColor: '#FFF',
  },
  selectedPillSelected: {
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 15,
    height: 15,
    borderRadius: 999,
  },
  subscribeBtn: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FE954A',
  },
  subscribeBtnDisabled: {opacity: 0.6},
  flex: {flex: 1, padding: 16},
  arrowBack: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: 'white',
    transform: [{rotate: '180deg'}],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 10,
    marginTop: 30,
  },
  headerTitle: {
    flex: 1,
    marginTop: 30,
    paddingHorizontal: 10,
    paddingBottom: 10,
    fontSize: 20,
    fontWeight: '700',
    color: '#FDF5E6',
    fontFamily: 'Nohemi',
    letterSpacing: -0.8,
    textTransform: 'capitalize',
  },
  creditsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  creditsTitle: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  creditsNumber: {
    color: 'white',
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 64,
  },
  creditsSubtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  creditsSubtitleText: {
    color: '#AFAFAF',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 999,
  },
  createButton: {
    marginTop: 24,
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
  planCard: {
    borderRadius: 15,
    marginBottom: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    opacity: 0.6,
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
  },
  planHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: 16,
    ...(Platform.OS === 'ios' && {
      padding: 20,
    }),
  },
  planTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: '#000',
    ...(Platform.OS === 'ios' && {
      marginRight: 8,
    }),
  },
  priceContainer: {
    paddingRight: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 45,
    ...(Platform.OS === 'ios' && {
      alignItems: 'center',
      minHeight: 60,
    }),
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    ...(Platform.OS === 'ios' && {
      textAlign: 'right',
    }),
  },
  featureText: {
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    color: '#000',
    ...(Platform.OS === 'ios' && {
      lineHeight: 20,
      paddingRight: 5,
      flexShrink: 1,
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 0,
      flex: 1,
    }),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 10,
    ...(Platform.OS === 'ios' && {
      marginLeft: 20,
    }),
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginBottom: 1,
    alignSelf: 'flex-end',
    ...(Platform.OS === 'ios' && {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 3,
      borderRadius: 4,
    }),
  },
  planOriginalPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#564A3F',
    textDecorationLine: 'line-through',
    marginBottom: 1,
    lineHeight: 14,
    ...(Platform.OS === 'ios' && {
      marginBottom: 3,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 16,
    }),
  },
  discountPriceWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    minHeight: 40,
    justifyContent: 'flex-start',
    ...(Platform.OS === 'ios' && {
      minHeight: 60,
    }),
  },
  subscriptionBgContainer: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  subscriptionBg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  disabledButtonText: {
    opacity: 0.6,
  },
});
