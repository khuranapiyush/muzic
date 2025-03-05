import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ImageBackground,
} from 'react-native';
import appImages from '../../../../resource/images';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';

const PromoModal = ({visible, onClose}) => {
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
      avoidKeyboard={true}
      style={{height: SCREEN_HEIGHT, width: SCREEN_WIDTH}}>
      <View style={styles.centeredView}>
        <ImageBackground
          source={appImages.promoBanner}
          style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Image source={appImages.closeIcon} style={{tintColor: 'black'}} />
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
              <Text style={styles.newPrice}>₹999 per month</Text>
            </View>

            <Text style={styles.renewalText}>
              Auto renewable. Cancel anytime.
            </Text>

            <TouchableOpacity
              style={styles.createButton}
              activeOpacity={0.8}
              onPress={onClose}>
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
  },
  modalView: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    flexDirection: 'column',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
  },
  container: {
    marginTop: SCREEN_HEIGHT / 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
    paddingTop: 20,
    paddingBottom: 100,
  },
  closeButton: {
    position: 'absolute',
    right: 30,
    top: 60,
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#48BB78',
    borderRadius: 12,
    padding: 5,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  discountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 20,
  },
  featuresContainer: {
    alignSelf: 'auto',
    borderRadius: 13,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#EA7C08',
    backgroundColor: 'rgba(255, 213, 169, 0.30)',
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  featureText: {
    color: 'white',
    marginBottom: 5,
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
  },
  newPrice: {
    color: 'white',
    fontWeight: 'bold',
  },
  renewalText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 20,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
  },
  createButton: {
    width: '90%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
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
    borderRadius: 100,
    borderWidth: 4,
    borderStyle: 'solid',
    borderColor: '#C87D48',
  },
});

export default PromoModal;
