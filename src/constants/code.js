const config = {
  pages: {
    home: { id: '63e5d9e6abfab507559d26bf', label: 'Home', description: '' },
    watch: { id: '63e5d9f4abfab507559d26c0', label: 'Watch', description: '' },
    list: { id: '63e5da01abfab507559d26c1', label: 'List', description: '' }
  },
  sections: {
    topNav: {
      id: '63e5da12abfab507559d26c4',
      label: 'Top Nav',
      description: ''
    },
    carousel: {
      id: '63e5da25abfab507559d26c5',
      label: 'Carousel',
      description: ''
    },
    recommendation: {
      id: '63e5da32abfab507559d26c6',
      label: 'Recommendation',
      description: ''
    },
    invest: {
      id: '63bfb2c4abfab507559c0837',
      label: 'Invest',
      description: ''
    }
  }
}

export default config

export const getAppConfig = (type, name, details = 'id') => {
  if (type == 'page') {
    return config.pages[name].id
  } else if (type == 'section') {
    return config.sections[name].id
  }
}
