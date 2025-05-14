# Firebase Analytics Implementation Guide

This guide provides code examples for implementing the Firebase analytics events at key points in the user journey.

## Installation and Setup

Ensure you have completed all the steps in the `FIREBASE_SETUP.md` file before implementing these events.

## User Journey Events

Here are implementation examples for each touchpoint in the user journey:

### 1. App Install

App install events are typically tracked automatically by Firebase. No additional code is needed.

### 2. Sign-up (Mobile Number Entry)

Place this in your mobile number entry form component:

```javascript
import analyticsUtils from '../utils/analytics';

const SignupScreen = () => {
  const handleMobileNumberSubmit = async (mobileNumber) => {
    // Track the mobile number entry event
    await analyticsUtils.trackMobileNumberEntry({
      input_method: 'manual', // or any other method if applicable
    });
    
    // Continue with your existing signup flow
    // ...
  };
  
  // Rest of your component
};
```

### 3. OTP Verification Screen Shown

Place this in your OTP verification screen component:

```javascript
import React, { useEffect } from 'react';
import analyticsUtils from '../utils/analytics';

const OtpVerificationScreen = () => {
  useEffect(() => {
    // Track when OTP verification screen is shown
    analyticsUtils.trackOtpVerificationShown({
      source: 'signup', // or 'login' or other sources
    });
  }, []);
  
  // Rest of your component
};
```

### 4. OTP Verification Success

Place this in your OTP verification success handler:

```javascript
const handleOtpVerification = async (otpCode) => {
  try {
    // Your OTP verification logic here
    const success = await verifyOtp(otpCode);
    
    if (success) {
      // Track successful OTP verification
      await analyticsUtils.trackOtpVerificationSuccess({
        method: 'sms', // or other methods if applicable
      });
      
      // Continue with your app flow after successful verification
      // ...
    }
  } catch (error) {
    // Handle errors
    console.error('OTP verification error:', error);
  }
};
```

### 5. Create Song Prompt (Dashboard)

Place this in your song prompt creation component:

```javascript
const CreateSongPromptScreen = () => {
  const [promptText, setPromptText] = useState('');
  
  const handleCreateButtonClick = async () => {
    // Track song prompt creation
    await analyticsUtils.trackSongPromptCreation(promptText, {
      screen: 'dashboard',
      word_count: promptText.split(' ').length,
    });
    
    // Continue with your song creation flow
    // ...
  };
  
  // Rest of your component
};
```

### 6. AI Cover - Paste URL

Place this in your AI Cover URL input component:

```javascript
const handleUrlPaste = async (url) => {
  // Determine URL type (simple example)
  let urlType = 'unknown';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    urlType = 'youtube';
  } else if (url.includes('spotify.com')) {
    urlType = 'spotify';
  }
  
  // Track URL paste event
  await analyticsUtils.trackAiCoverUrlPaste(urlType, {
    url_length: url.length,
  });
  
  // Continue with your URL processing
  // ...
};
```

### 7. AI Cover - My Vocal - Add New Recording

Place this in your "Add New Recording" button handler:

```javascript
const handleAddNewRecording = async () => {
  // Track add new recording event
  await analyticsUtils.trackAddNewRecording({
    source: 'ai_cover',
    screen: 'my_vocal',
  });
  
  // Navigate to recording screen or show recording modal
  // ...
};
```

### 8. Start Recording

Place this in your recording start button handler:

```javascript
const handleStartRecording = async () => {
  // Track recording start event
  await analyticsUtils.trackStartRecording('vocal', {
    screen: 'my_vocal',
    microphone_access: true, // Add relevant parameters
  });
  
  // Start the actual recording
  // ...
};
```

### 9. Purchase Flow Initiation

Place this in various locations where users can initiate purchase:

```javascript
// For top-right subscription logo
const handleTopRightSubscriptionClick = async () => {
  await analyticsUtils.trackPurchaseInitiated('top_right_logo', {
    current_screen: 'dashboard', // or whatever screen they're on
  });
  
  // Navigate to subscription screen
  // ...
};

// For settings subscription option
const handleSettingsSubscribeClick = async () => {
  await analyticsUtils.trackPurchaseInitiated('settings', {
    current_screen: 'settings',
  });
  
  // Navigate to subscription screen
  // ...
};

// For insufficient credits modal
const handleInsufficientCreditsClick = async () => {
  await analyticsUtils.trackPurchaseInitiated('insufficient_credits', {
    feature: 'ai_cover', // or whatever feature they were trying to use
    current_screen: 'ai_cover',
  });
  
  // Navigate to subscription screen
  // ...
};
```

### 10. Voice Upload

Place this in your voice upload handler:

```javascript
const handleVoiceUpload = async (fileInfo) => {
  // Track voice upload
  await analyticsUtils.trackVoiceUpload('voice', {
    file_size: fileInfo.size,
    file_type: fileInfo.type,
    upload_method: 'manual',
  });
  
  // Continue with upload process
  // ...
};
```

## Advanced Tracking

For more complex events, you can use the `trackCustomEvent` function:

```javascript
import analyticsUtils from '../utils/analytics';

// Track a custom event with specific parameters
await analyticsUtils.trackCustomEvent('share_song', {
  song_id: '12345',
  platform: 'whatsapp',
  song_duration: 180, // in seconds
  genre: 'pop',
});
```

## Best Practices

1. **Don't Track PII**: Never track personally identifiable information (PII) such as names, emails, full addresses
2. **Be Consistent**: Use the same event names and parameter structures throughout your app
3. **Add Relevant Data**: Include context parameters that might be useful for analysis
4. **Handle Errors**: Always wrap analytics calls in try/catch to prevent app crashes
5. **Offline Support**: Firebase automatically handles offline events, no additional code needed

## Testing Analytics

You can verify your analytics events are working properly by using the Firebase Debug View in the Firebase console. You may need to wait a few hours for events to show up in your dashboard. 