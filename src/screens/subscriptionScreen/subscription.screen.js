import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
// import * as RNIap from 'react-native-iap';

const SubscriptionScreen = () => {
  const [credits, setCredits] = useState(20);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const initializeIAP = async () => {
      try {
        console.log('Initializing IAP connection...');
        // const result = await RNIap.initConnection();
        // console.log('IAP connection result:', result);

        const productIds = ['subscription_1']; // Make sure this matches your App Store product ID
        console.log('Requesting products with IDs:', productIds);

        // let data = { productId: productIds, date: item?.transactionDate }

        getCurrentPurchases();
        getPurchaseInfo();
        // const products = await RNIap.getProducts(productIds)
        // console.log('Available products:', products)

        // if (products.length === 0) {
        //   console.warn('No products available from the App Store')
        // } else {
        //   setProducts(products)
        // }
      } catch (err) {
        console.error('Error initializing IAP:', err);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
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
      // const productsInfo = await RNIap.getProducts({skus: productIds});
      // console.log('SETTING THE PRODCUTS', productsInfo);
      // setProducts(productsInfo);
    } catch (err) {
      console.error('Error fetching products: ', err);
    }
  };

  const getCurrentPurchases = async () => {
    try {
      // const item = await RNIap.getAvailablePurchases();
      // let data = {productId: item?.productId, date: item?.transactionDate};
      // Alert.alert('Success', JSON.stringify(data))
    } catch (error) {
      console.error('Error getting purchases:', error);
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
      // const purchase = await RNIap.requestSubscription(productId);
      // console.log('Purchase successful', purchase);
      // Handle successful purchase
    } catch (err) {
      console.warn('Subscription error:', err);
      Alert.alert('Error', `Failed to process subscription. ${err.message}`);
    }
  };

  const PlanCard = ({title, price, features}) => (
    <View style={styles.planCard}>
      <View style={styles.planHeader}>
        <Text style={styles.planTitle}>{title}</Text>
        <Text style={styles.planPrice}>{price}</Text>
      </View>
      {features.map((feature, index) => (
        <Text key={index} style={styles.featureText}>
          {feature}
        </Text>
      ))}
      <TouchableOpacity
        style={styles.subscribeButton}
        onPress={() =>
          handleSubscribe(
            selectedPlan === 'monthly'
              ? 'test_subscription_monthly'
              : 'test_subscription_yearly',
          )
        }>
        <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
      </TouchableOpacity>
    </View>
  );

  const navigator = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigator.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.creditsTitle}>Credits</Text>
      <Text style={styles.creditsNumber}>{credits}</Text>
      <Text style={styles.creditsSubtitle}>Songs left</Text>

      <View style={styles.planToggle}>
        <TouchableOpacity
          style={[
            styles.planToggleButton,
            selectedPlan === 'monthly' && styles.selectedPlan,
          ]}
          onPress={() => setSelectedPlan('monthly')}>
          <Text style={styles.planToggleText}>Monthly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.planToggleButton,
            selectedPlan === 'annual' && styles.selectedPlan,
          ]}
          onPress={() => setSelectedPlan('annual')}>
          <Text style={styles.planToggleText}>Annual</Text>
        </TouchableOpacity>
      </View>

      <PlanCard
        title="Pro Plan"
        price="$99/Month"
        features={[
          '500 songs monthly',
          'Priority Generation queue',
          'Priority Generation queue',
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
  },
  creditsTitle: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 60,
  },
  creditsNumber: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  creditsSubtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  planToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  planToggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#333',
  },
  selectedPlan: {
    backgroundColor: '#555',
  },
  planToggleText: {
    color: 'white',
  },
  planCard: {
    backgroundColor: '#D2B48C',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  featureText: {
    marginBottom: 5,
  },
  subscribeButton: {
    backgroundColor: '#FFA500',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  subscribeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SubscriptionScreen;
