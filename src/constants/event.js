export const eventNames = {
  firstLogin: 'FirstLogin', // done
  login: 'login', // done
  videoStartClick: 'VideoStart_Clicks',
  videoStartAutoPlay: 'VideoStart_Autoplay',
  Video20: 'Video20', // done
  Video50: 'Video50', // done
  Video30sec: 'Video30sec', // done
  PlayClicks: 'PlayClicks',
  VideoStart_Banner: 'VideoStart_Banner', // done
  VideoStart_Hover: 'VideoStart_Hover', // done
  VideoComplete: 'VideoComplete',
  TopNavClicks: 'TopNavClicks', // done
  HeaderClicks: 'HeaderClicks', // done
  PageLoad: 'PageLoad',
  LanguageSelected: 'LanguageSelectd', // done
  LanguageSelectedSkip: 'LanguageSelectdSkip' // done
}

export const loginSource = {
  loginPhoneSource: 'PhNo',
  loginGoogleSource: 'GoogleLogin',
  loginAppleSource: 'AppleLogin',
  loginEmailSource: 'EmailPassword'
}

export const progressEvents = [
  {
    value: 30,
    type: 'time',
    analyticsName: eventNames.Video30sec
  },
  {
    value: 20,
    type: 'percent',
    analyticsName: eventNames.Video20
  },
  {
    value: 50,
    type: 'percent',
    analyticsName: eventNames.Video50
  }
]
