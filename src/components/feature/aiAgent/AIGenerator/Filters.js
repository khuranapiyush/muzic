/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import fetcher from '../../../../dataProvider';
import config from 'react-native-config';
import {useSelector} from 'react-redux';
import {getAuthToken} from '../../../../utils/authUtils';

const {width} = Dimensions.get('window');
// const ITEM_WIDTH = (width - 48 - 16) / 4; // Account for padding and gap
const GENRE_ITEM_WIDTH = (width - 48 - 32) / 5; // For larger screens

const GenreSelectionScreen = ({
  onGenreSelect,
  onVoiceSelect,
  resetSelections,
}) => {
  const {API_BASE_URL} = config;
  const [genreList, setGenreList] = useState(null);
  const [filterList, setFilterList] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedSingerType, setSelectedSingerType] = useState(null);
  const authState = useSelector(state => state.auth);

  // Reset selections when resetSelections changes
  useEffect(() => {
    if (resetSelections) {
      setSelectedGenre(null);
      setSelectedSingerType(null);
    }
  }, [resetSelections]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the current auth token
        const token = await getAuthToken();

        const headers = {
          'Content-Type': 'application/json',
        };

        // Add authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch genres
        const genresResponse = await fetcher.get(`${API_BASE_URL}/v1/genres`, {
          headers,
        });
        setGenreList(genresResponse.data.data);

        // Fetch filters
        const filtersResponse = await fetcher.get(
          `${API_BASE_URL}/v1/filters`,
          {
            headers,
          },
        );
        setFilterList(filtersResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [API_BASE_URL, authState]);

  // const CheckMarkIcon = () => (
  //   <View style={styles.checkmark}>
  //     <Svg
  //       width={16}
  //       height={16}
  //       viewBox="0 0 24 24"
  //       stroke="white"
  //       strokeWidth={2}>
  //       <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  //     </Svg>
  //   </View>
  // );

  // Handle genre selection and notify parent component
  const handleGenreSelect = (genreId, genreName) => {
    const newSelectedGenre = selectedGenre === genreId ? null : genreId;
    setSelectedGenre(newSelectedGenre);

    // Find the selected genre name if a genre is selected
    let selectedGenreName = null;
    if (newSelectedGenre && genreList) {
      const genre = genreList.find(item => item._id === newSelectedGenre);
      selectedGenreName = genre ? genre.name.toLowerCase() : null;
    }

    // Notify parent component with the genre name
    if (onGenreSelect) {
      onGenreSelect(selectedGenreName);
    }
  };

  // Handle singer type selection and notify parent component
  const handleSingerSelect = (singerId, singerName) => {
    const newSelectedSinger = selectedSingerType === singerId ? null : singerId;
    setSelectedSingerType(newSelectedSinger);

    // Find the selected singer type if a singer is selected
    let selectedVoiceType = null;
    if (newSelectedSinger && filterList) {
      const singer = filterList.find(item => item._id === newSelectedSinger);
      selectedVoiceType = singer ? singer.name.toLowerCase() : null;
    }

    // Notify parent component with the voice type
    if (onVoiceSelect) {
      onVoiceSelect(selectedVoiceType);
    }
  };

  const GenreItem = ({item}) => {
    const isSelected = selectedGenre === item._id;

    return (
      <TouchableOpacity
        style={[styles.genreItem, isSelected && styles.selectedItem]}
        onPress={() => handleGenreSelect(item._id, item.name)}
        activeOpacity={0.7}>
        <View style={styles.imageContainer}>
          <Image source={{uri: item.imageUrl}} style={styles.image} />
          <View
            style={[styles.overlay, isSelected && styles.selectedOverlay]}
          />
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmarkIcon}>✓</Text>
            </View>
          )}
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
        onPress={() => handleSingerSelect(item._id, item.name)}
        activeOpacity={0.7}>
        <View style={styles.imageContainer}>
          <Image source={{uri: item.imageUrl}} style={styles.image} />
          <View
            style={[styles.overlay, isSelected && styles.selectedOverlay]}
          />
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmarkIcon}>✓</Text>
            </View>
          )}
        </View>
        <Text style={[styles.itemText, isSelected && styles.selectedText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <ScrollView style={styles.scrollView}> */}
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
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 5,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    color: '#FDF5E6',
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
    width: GENRE_ITEM_WIDTH,
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
  },
  selectedOverlay: {
    opacity: 0.4,
  },
  selectedItem: {
    transform: [{scale: 1.05}],
  },
  itemText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 21,
  },
  selectedText: {
    color: '#FD893A', // purple-500
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FD893A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F4A460',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GenreSelectionScreen;
