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

const {width} = Dimensions.get('window');
const GENRE_ITEM_WIDTH = (width - 48 - 32) / 5;

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

  useEffect(() => {
    if (resetSelections) {
      setSelectedGenre(null);
      setSelectedSingerType(null);
    }
  }, [resetSelections]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // These endpoints are public; avoid attaching auth and token validation
        const genresResponse = await fetcher.get(`${API_BASE_URL}/v1/genres`, {
          headers: {'Content-Type': 'application/json'},
          skipTokenValidation: true,
          skipAuthHeader: true,
        });
        setGenreList(genresResponse.data.data);

        const filtersResponse = await fetcher.get(
          `${API_BASE_URL}/v1/filters`,
          {
            headers: {'Content-Type': 'application/json'},
            skipTokenValidation: true,
            skipAuthHeader: true,
          },
        );
        setFilterList(filtersResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [API_BASE_URL, authState]);

  const handleGenreSelect = (genreId, genreName) => {
    const newSelectedGenre = selectedGenre === genreId ? null : genreId;
    setSelectedGenre(newSelectedGenre);

    let selectedGenreName = null;
    if (newSelectedGenre && genreList) {
      const genre = genreList.find(item => item._id === newSelectedGenre);
      selectedGenreName = genre ? genre.name.toLowerCase() : null;
    }

    if (onGenreSelect) {
      onGenreSelect(selectedGenreName);
    }
  };

  const handleSingerSelect = (singerId, singerName) => {
    const newSelectedSinger = selectedSingerType === singerId ? null : singerId;
    setSelectedSingerType(newSelectedSinger);

    let selectedVoiceType = null;
    if (newSelectedSinger && filterList) {
      const singer = filterList.find(item => item._id === newSelectedSinger);
      selectedVoiceType = singer ? singer.name.toLowerCase() : null;
    }

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
      <View style={styles.content}>
        {/* Genre Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Genre</Text>
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
    paddingVertical: 0,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: '#F2F2F2',
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
    color: '#B0B0B0',
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    textTransform: 'capitalize',
    marginRight: 8,
  },
  selectedText: {
    color: '#FD893A',
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
