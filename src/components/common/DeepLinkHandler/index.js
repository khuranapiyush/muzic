import React, {useCallback, useEffect} from 'react';
import {Linking} from 'react-native';
// import branch from 'react-native-branch';
import {URL} from 'react-native-url-polyfill';
import {linkType} from '../../../constants/constant';
import useIntent from '../../../hooks/useIntent';

const DeepLinkHandler = ({children}) => {
  const {
    handleVideoIntent,
    handleReferralIntent,
    handleVerifyEmail,
    handleShortieIntent,
  } = useIntent();

  const handleDeepLink = useCallback(
    event => {
      const url = event.url;
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      switch (true) {
        case path === '/video-details': {
          handleVideoIntent(parsedUrl, linkType.deep);
          break;
        }
        case path.startsWith('/watch/'): {
          handleVideoIntent(path, linkType.universal);
          break;
        }
        case path.startsWith('/shorties/'): {
          handleShortieIntent(path, linkType.deep);
          break;
        }
        case path === '/refer': {
          handleReferralIntent(parsedUrl, linkType.deep);
          break;
        }
        case path === '/': {
          handleReferralIntent(parsedUrl, linkType.universal);
          break;
        }
        case path === '/verify-email': {
          handleVerifyEmail(parsedUrl, linkType.deep);
          break;
        }
        default:
          break;
      }
    },
    [
      handleVideoIntent,
      handleShortieIntent,
      handleReferralIntent,
      handleVerifyEmail,
    ],
  );

  useEffect(() => {
    const linkingEvent = Linking.addEventListener('url', handleDeepLink);

    return () => {
      linkingEvent.remove();
    };
  }, [handleDeepLink]);

  useEffect(() => {
    const handleBranchEvents = async ({event, error, params}) => {
      if (error) {
        console.error('Branch   Error:', error);
        return;
      }

      // try {
      //   const referringParams = await branch.getLatestReferringParams();

      //   const intent = referringParams?.$deeplink_path;
      //   switch (intent) {
      //     case 'video_detail':
      //       handleVideoIntent(referringParams, linkType.deferred);
      //       break;
      //     case 'referral_code':
      //       handleReferralIntent(referringParams, linkType.deferred);
      //       break;
      //     default:
      //       break;
      //   }
      // } catch (err) {
      //   console.log('err in handleBranchEvents===>', error);
      // }
    };

    // branch.subscribe(handleBranchEvents);

    // return () => {
    //   branchSubscription()
    // }
  }, [handleReferralIntent, handleVideoIntent]);

  return <>{children}</>;
};

export default DeepLinkHandler;
