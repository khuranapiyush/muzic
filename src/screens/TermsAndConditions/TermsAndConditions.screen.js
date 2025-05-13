import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import CView from '../../components/common/core/View';
import CText from '../../components/common/core/Text';
import config from 'react-native-config';
import {Image} from 'react-native-elements';
import appImages from '../../resource/images';

const TermsAndConditionsScreen = ({navigation}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.API_BASE_URL}/legals?key=terms`);
        const data = await response.json();
        setContent(
          data.data[0].attributes.content ||
            'Terms and Conditions content not available',
        );
        setLoading(false);
      } catch (err) {
        setError(
          'Failed to load terms and conditions. Please try again later.',
        );
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Format content with styled paragraphs
  const renderFormattedContent = text => {
    if (!text) {
      return null;
    }

    const paragraphs = text.split('\n\n');

    return paragraphs.map((paragraph, index) => {
      const isHeader =
        paragraph.length < 50 &&
        (paragraph.includes(':') || paragraph.toUpperCase() === paragraph);

      if (isHeader) {
        return (
          <CText key={index} style={styles.paragraphHeading}>
            {paragraph}
          </CText>
        );
      }

      return (
        <CText key={index} style={styles.termsText}>
          {paragraph}
        </CText>
      );
    });
  };

  return (
    <CView style={styles.container}>
      <CView row style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image
            source={appImages.arrowLeftIcon}
            style={styles.backArrowIcon}
          />
        </TouchableOpacity>

        <CText style={styles.title}>Terms & Conditions</CText>
      </CView>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FE954A"
            style={styles.loader}
          />
        ) : error ? (
          <CText style={styles.errorText}>{error}</CText>
        ) : (
          <>
            {/* <CText style={styles.sectionHeading}>Terms & Conditions</CText> */}
            {renderFormattedContent(content)}
          </>
        )}
      </ScrollView>
    </CView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  termsText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Nohemi',
    letterSpacing: 0.3,
    marginTop: 10,
    fontWeight: '400',
    marginBottom: 16,
  },
  paragraphHeading: {
    color: '#FFD5A9',
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Nohemi',
    letterSpacing: 0.3,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionHeading: {
    color: '#FE954A',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Nohemi',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  backButton: {
    marginTop: 8,
    marginBottom: 12,
  },
  backArrowIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFF',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
    color: '#FDF5E6',
    marginTop: 10,
    marginLeft: 12,
    fontFamily: 'Nohemi',
    letterSpacing: 0.8,
  },
  textContainer: {
    borderRadius: 12,
    padding: 16,
  },
  headerText: {
    color: '#FFF',
    fontSize: 18,
  },
  titleContainer: {marginTop: 60},
});

export default TermsAndConditionsScreen;
