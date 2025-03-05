import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {Svg, Path} from 'react-native-svg';
import axios from 'axios';
import config from 'react-native-config';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 48 - 16) / 4; // Account for padding and gap
const GENRE_ITEM_WIDTH = (width - 48 - 32) / 5; // For larger screens

const GenreSelectionScreen = () => {
  const {API_BASE_URL} = config;
  const [genreList, setGenreList] = useState(null);
  const [filterList, setFilterList] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedSingerType, setSelectedSingerType] = useState(null);

  const CheckMarkIcon = () => (
    <View style={styles.checkmark}>
      <Svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        stroke="white"
        strokeWidth={2}>
        <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );

  const getGenres = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/genres`);
      setGenreList(response.data.data);
    } catch (error) {
      throw error;
    }
  };

  const getFilters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/filters`);
      setFilterList(response.data.data);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    getGenres();
    getFilters();
  }, []);

  const GenreItem = ({item}) => {
    const isSelected = selectedGenre === item._id;

    return (
      <TouchableOpacity
        style={[styles.genreItem, isSelected && styles.selectedItem]}
        onPress={() => setSelectedGenre(isSelected ? null : item._id)}
        activeOpacity={0.7}>
        <View style={styles.imageContainer}>
          <Image source={{uri: item.imageUrl}} style={styles.image} />
          <View
            style={[styles.overlay, isSelected && styles.selectedOverlay]}
          />
          {isSelected && <CheckMarkIcon />}
        </View>
        <Text style={[styles.itemText, isSelected && styles.selectedText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const SingerTypeItem = ({item}) => {
    const isSelected = selectedSingerType === item._id;

    if (item.type !== 'singer') {
      return null;
    }

    return (
      <TouchableOpacity
        style={[styles.singerItem, isSelected && styles.selectedItem]}
        onPress={() => setSelectedSingerType(isSelected ? null : item._id)}
        activeOpacity={0.7}>
        <View style={styles.imageContainer}>
          <Image source={{uri: item.imageUrl}} style={styles.image} />
          <View
            style={[styles.overlay, isSelected && styles.selectedOverlay]}
          />
          {isSelected && <CheckMarkIcon />}
        </View>
        <Text style={[styles.itemText, isSelected && styles.selectedText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Genre Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genre</Text>
            <View style={styles.genreGrid}>
              {genreList?.map(item => (
                <GenreItem key={item._id} item={item} />
              ))}
            </View>
          </View>

          {/* Singer Type Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Singer</Text>
            <View style={styles.singerGrid}>
              {filterList
                ?.filter(item => item.type === 'singer')
                ?.map(item => (
                  <SingerTypeItem key={item._id} item={item} />
                ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  singerGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  genreItem: {
    width: GENRE_ITEM_WIDTH,
    marginBottom: 16,
  },
  singerItem: {
    width: ITEM_WIDTH,
    marginBottom: 16,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(147, 51, 234, 0.2)', // purple-600 with opacity
  },
  selectedOverlay: {
    backgroundColor: 'rgba(147, 51, 234, 0.4)',
  },
  selectedItem: {
    transform: [{scale: 1.05}],
  },
  itemText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'left',
  },
  selectedText: {
    color: '#A855F7', // purple-500
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GenreSelectionScreen;
