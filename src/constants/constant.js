import appImages from '../resource/images'

export const linkType = {
  deferred: 'deferred',
  deep: 'deep',
  universal: 'universal'
}

export const filterType = {
  duration: 'duration',
  dimension: 'dimension',
  quality: 'quality',
  mood: 'mood',
  genre: 'genre',
  ageGroup: 'ageGroup',
  wordLimit: 'wordLimit'
}

export const durationFilterData = [
  {
    id: 0,
    filterValue: '15 sec'
  },
  {
    id: 1,
    filterValue: '30 sec'
  },
  {
    id: 2,
    filterValue: '45 sec'
  },
  {
    id: 3,
    filterValue: '1 min'
  },
  {
    id: 4,
    filterValue: '2 min'
  },
  {
    id: 5,
    filterValue: '3 min'
  }
]

export const dimensionFilterData = [
  {
    id: 0,
    filterValue: '1:1'
  },
  {
    id: 1,
    filterValue: '16:9'
  },
  {
    id: 2,
    filterValue: '9:16'
  }
]

export const qualityFilterData = [
  {
    id: 0,
    filterValue: '4k'
  },
  {
    id: 1,
    filterValue: '1080p'
  },
  {
    id: 2,
    filterValue: '720p'
  },
  {
    id: 3,
    filterValue: '480p'
  },
  {
    id: 4,
    filterValue: '360p'
  }
]

export const genreFilterData = [
  {
    id: 0,
    filterValue: 'Rock'
  },
  {
    id: 1,
    filterValue: 'Pop'
  },
  {
    id: 2,
    filterValue: 'Popular'
  },
  {
    id: 3,
    filterValue: 'Electronic'
  },
  {
    id: 4,
    filterValue: 'Rhythm and blues'
  },
  {
    id: 5,
    filterValue: 'Hip-hop'
  }
]

export const wordLimitFilterData = [
  {
    id: 0,
    filterValue: '150-300'
  },
  {
    id: 1,
    filterValue: '300-600'
  },
  {
    id: 2,
    filterValue: '600-900'
  },
  {
    id: 3,
    filterValue: '900-1200'
  }
]

export const ageLimitFilterData = [
  {
    id: 0,
    filterValue: '0-2'
  },
  {
    id: 1,
    filterValue: '3-6'
  },
  {
    id: 2,
    filterValue: '7-13'
  },
  {
    id: 3,
    filterValue: '13-20'
  },
  {
    id: 3,
    filterValue: '21-35'
  },
  {
    id: 3,
    filterValue: '35+'
  }
]

export const moodFilterData = [
  {
    id: 0,
    filterValue: 'Happy'
  },
  {
    id: 1,
    filterValue: 'Amusement'
  },
  {
    id: 2,
    filterValue: 'Eroticism'
  },
  {
    id: 3,
    filterValue: 'Beauty'
  },
  {
    id: 4,
    filterValue: 'Relaxation'
  },
  {
    id: 5,
    filterValue: 'Sadness'
  },
  {
    id: 6,
    filterValue: 'Dreaminess'
  },
  {
    id: 7,
    filterValue: 'Triumph'
  },
  {
    id: 8,
    filterValue: 'Anxiety'
  },
  {
    id: 9,
    filterValue: 'Scariness'
  },
  {
    id: 10,
    filterValue: 'Friendly'
  },
  {
    id: 11,
    filterValue: 'Professional'
  },
  {
    id: 12,
    filterValue: 'Casual'
  },
  {
    id: 13,
    filterValue: 'Motivational'
  },
  {
    id: 14,
    filterValue: 'Serious'
  },
  {
    id: 15,
    filterValue: 'Fun and Engaging'
  },
  {
    id: 16,
    filterValue: 'Inspirational'
  },
  {
    id: 17,
    filterValue: 'Authorative'
  },
  {
    id: 18,
    filterValue: 'Conversational'
  },
  {
    id: 19,
    filterValue: 'Light Hearted'
  },
  {
    id: 20,
    filterValue: 'Dark'
  },
  {
    id: 21,
    filterValue: 'Satirical'
  },
  {
    id: 22,
    filterValue: 'Emotional'
  },
  {
    id: 23,
    filterValue: 'Uplifting'
  }
]

export const textToMusicFilter = [
  {
    id: 0,
    defaultValue: durationFilterData[0],
    filterTypeData: durationFilterData,
    icon: appImages.durationIcon,
    key: 'duration'
  },
  {
    id: 1,
    defaultValue: dimensionFilterData[0],
    filterTypeData: dimensionFilterData,
    icon: appImages.aspectRatioIcon,
    key: 'dimension'
  },
  {
    id: 2,
    defaultValue: qualityFilterData[0],
    filterTypeData: qualityFilterData,
    icon: appImages.qualityIcon,
    key: 'quality'
  }
]

export const textToLyricsFilter = [
  {
    id: 0,
    defaultValue: genreFilterData[0],
    filterTypeData: genreFilterData,
    icon: appImages.genreIcon,
    key: 'genre'
  },
  {
    id: 1,
    defaultValue: moodFilterData[0],
    filterTypeData: moodFilterData,
    icon: appImages.moodIcon,
    key: 'mood'
  }
]

export const textToScriptFilter = [
  {
    id: 0,
    defaultValue: genreFilterData[0],
    filterTypeData: genreFilterData,
    icon: appImages.genreIcon,
    key: 'genre'
  },
  {
    id: 1,
    defaultValue: moodFilterData[0],
    filterTypeData: moodFilterData,
    icon: appImages.moodIcon,
    key: 'mood'
  },
  {
    id: 2,
    defaultValue: wordLimitFilterData[0],
    filterTypeData: wordLimitFilterData,
    icon: appImages.wordLimitIcon,
    key: 'wordLimit'
  }
]

export const getFilterByTab = tab => {
  switch (tab) {
    case 'video':
      return textToMusicFilter
    case 'music':
      return textToMusicFilter
    case 'lyrics':
      return textToLyricsFilter
    case 'script':
      return textToScriptFilter
    default:
      return []
  }
}
