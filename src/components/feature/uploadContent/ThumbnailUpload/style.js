import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrapper: { padding: 10 },
  container: { alignItems: 'center' },
  closeButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  progressContainer: {
    flex: 1,
    alignSelf: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  closeButtonStyle: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  titleContainer: {
    marginTop: 40,
  },
  thumbnailContainer: {
    paddingTop: 15,
    paddingBottom: 10,
  },
  thumbnail: {
    height: 90,
    width: 160,
    backgroundColor: 'gray',
    justifyContent: 'center',
    borderRadius: 12,
  },
  thumbnailImage: {
    alignSelf: 'center',
    height: 40,
    width: 40,
  },
  selectedThumbnailImage: {
    alignSelf: 'center',
    height: '100%',
    width: '100%',
  },
  uploadNewContainer: {
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadNew: {
    paddingVertical: 5,
    color: '#E14084',
  },
  newUploadIconStyle: {
    height: 20,
    width: 20,
    marginRight: 5,
  },
});
