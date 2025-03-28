import React from 'react';
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
} from 'react-native';
import appImages from '../../../../resource/images';
import {SCREEN_HEIGHT} from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import ROUTE_NAME from '../../../../navigator/config/routeName';

const PromoModal = ({visible, onClose}) => {
  const navigation = useNavigation();
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
              <Text style={styles.discountText}>88% OFF</Text>

              <View style={styles.featuresContainer}>
                {[
                  'Unlimited Song Creations',
                  'Exclusive AI Voices',
                  'Convert Songs to Your Voice',
                  'Bonus Credits Every Month',
                ].map((feature, index) => (
                  <Text key={index} style={styles.featureText}>
                    • {feature}
                  </Text>
                ))}
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.oldPrice}>₹1599</Text>
                <Text style={styles.newPrice}>₹999 </Text>
                <Text style={styles.newPriceText}>per month</Text>
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
