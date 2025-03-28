import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {Image, ScrollView} from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import * as RNIap from 'react-native-iap';
import LinearGradient from 'react-native-linear-gradient';
import appImages from '../../resource/images';
import CText from '../../components/common/core/Text';

// Define PlanCard component outside of SubscriptionScreen
const PlanCard = ({
  title,
  price,
  features,
  originalPrice,
  onSubscribe,
  selectedPlan,
}) => (
  <LinearGradient
    colors={[
      'rgba(255, 213, 169, 0.60)',
      '#FFD5A9',
      'rgba(255, 213, 169, 0.60)',
    ]}
    start={{x: -0.3553, y: 0}}
    end={{x: 1.0777, y: 0}}
    style={styles.planCard}>
    <View style={styles.planHeader}>
      <Text style={styles.planTitle}>{title}</Text>
      <View style={styles.priceContainer}>
        {originalPrice && (
          <Text style={styles.originalPrice}>{originalPrice}</Text>
        )}
        <Text style={styles.planPrice}>{price}</Text>
      </View>
    </View>
    {features.map((feature, index) => (
      <Text key={index} style={styles.featureText}>
        {feature}
      </Text>
    ))}
    <TouchableOpacity
      style={[styles.createButton]}
      activeOpacity={0.8}
      onPress={() =>
        onSubscribe(
          selectedPlan === 'monthly'
            ? 'test_subscription_monthly'
            : 'test_subscription_yearly',
        )
      }>
      <LinearGradient
        colors={['#F4A460', '#DEB887']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradient}>
        <CText style={[styles.createButtonText, styles.disabledButtonText]}>
          Subscribe Now
        </CText>
      </LinearGradient>
    </TouchableOpacity>
  </LinearGradient>
);

const SubscriptionScreen = () => {
  const [credits, setCredits] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const initializeIAP = async () => {
      try {
        console.log('Initializing IAP connection...');
        const result = await RNIap.initConnection();
        console.log('IAP connection result:', result);

        const productIds = ['subscription_1']; // Make sure this matches your App Store product ID
        console.log('Requesting products with IDs:', productIds);

        // let data = { productId: productIds, date: item?.transactionDate }

        getCurrentPurchases();
        getPurchaseInfo();
        const products = await RNIap.getProducts(productIds);
        console.log('Available products:', products);

        if (products.length === 0) {
          console.log('No products available from the App Store');
        } else {
          setProducts(products);
        }
      } catch (err) {
        console.log('Error initializing IAP:', err);
        console.log('Error message:', err.message);
        console.log('Error stack:', err.stack);
      }
    };

    initializeIAP();

    return () => {
      // RNIap.endConnection();
    };
  }, []);

  const getPurchaseInfo = async () => {
    try {
      const productIds = ['subscription_1'];
      const productsInfo = await RNIap.getProducts({skus: productIds});
      console.log('SETTING THE PRODCUTS', productsInfo);
      setProducts(productsInfo);
    } catch (err) {
      console.log('Error fetching products: ', err);
    }
  };

  const getCurrentPurchases = async () => {
    try {
      const item = await RNIap.getAvailablePurchases();
      let data = {productId: item?.productId, date: item?.transactionDate};
      Alert.alert('Success', JSON.stringify(data));
    } catch (error) {
      console.log('Error getting purchases:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (products.length === 0) {
        throw new Error('No products available');
      }

      console.log('Before Attempting to subscribe to');
      const productId = products[0].productId; // Assuming you only have one product
      console.log('Attempting to subscribe to:', productId);
      const purchase = await RNIap.requestSubscription(productId);
      console.log('Purchase successful', purchase);
      // Handle successful purchase
    } catch (err) {
      console.log('Subscription error:', err);
      Alert.alert('Error', `Failed to process subscription. ${err.message}`);
    }
  };

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#18181B', '#3C3029']}
        locations={[0.4, 0.99]}
        style={styles.gradientWrapper}
        angle={180}
        useAngle={true}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Image
              source={appImages.arrowLeftIcon}
              style={styles.backArrowIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscriptions</Text>
        </View>

        <View style={styles.creditsContainer}>
          <Text style={styles.creditsTitle}>Credits</Text>
          <Text style={styles.creditsNumber}>{credits}</Text>
          <Text style={styles.creditsSubtitle}>Songs left</Text>
        </View>

        <View style={styles.divider} />
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <View style={styles.plansContainer}>
          {selectedPlan === 'monthly' ? (
            <PlanCard
              title="Monthly Pro Plan"
              price="$29/Month"
              features={[
                '100 songs monthly',
                'Priority Generation queue',
                'Priority Generation queue',
              ]}
              onSubscribe={handleSubscribe}
              selectedPlan={selectedPlan}
            />
          ) : (
            <PlanCard
              title="Yearly Pro Plan"
              price="$99"
              originalPrice="$359/Yearly"
              features={[
                '200 songs monthly',
                'Priority Generation queue',
                'Priority Generation queue',
              ]}
              onSubscribe={handleSubscribe}
              selectedPlan={selectedPlan}
            />
          )}

          <PlanCard
            title={
              selectedPlan === 'monthly'
                ? 'Yearly Pro Plan'
                : 'Monthly Pro Plan'
            }
            price={selectedPlan === 'monthly' ? '$99' : '$29/Month'}
            originalPrice={selectedPlan === 'monthly' ? '$359/Yearly' : null}
            features={[
              selectedPlan === 'monthly'
                ? '200 songs monthly'
                : '100 songs monthly',
              'Priority Generation queue',
              'Priority Generation queue',
            ]}
            onSubscribe={handleSubscribe}
            selectedPlan={selectedPlan}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F11',
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  backButton: {
    width: 10,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 28,
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
  },
  creditsSubtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 5,
  },
  plansContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  planCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textDecorationLine: 'line-through',
  },
  featureText: {
    marginBottom: 10,
    fontSize: 16,
    color: '#000',
  },
  subscribeButton: {
    backgroundColor: '#FF9966',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  subscribeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createButton: {
    marginVertical: 10,
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#C87D48',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 4,
    borderStyle: 'solid',
    borderColor: '#C87D48',
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  gradientContainer: {
    overflow: 'hidden',
    borderRadius: 15,
  },
  borderTop: {
    height: 2,
    backgroundColor: '#564A3F',
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  gradientWrapper: {
    paddingTop: 2,
  },
  scrollView: {
    flex: 1,
  },
});

export default SubscriptionScreen;
