import {useEffect, useCallback, useRef} from 'react';
import {useSelector} from 'react-redux';
import moEngageService from '../services/moengageService';
import {MOENGAGE_CONFIG} from '../constants/moEngageConfig';

/**
 * Custom hook for MoEngage user management
 * Automatically tracks user login/logout and provides easy access to MoEngage functions
 *
 * This hook integrates with your Redux store and automatically:
 * - Tracks user login when user state changes
 * - Tracks user logout when user becomes guest or logs out
 * - Provides context-aware event tracking
 * - Manages user re-identification after profile updates
 */
const useMoEngageUser = () => {
  // Get user data from Redux store - adjust selectors based on your store structure
  const user = useSelector(state => state.user);
  const auth = useSelector(state => state.auth);

  const {isLoggedIn, userId, _id, id, ...userData} = user || {};
  const authIsLoggedIn = auth?.isLoggedIn;

  // Determine the actual login state - check both user and auth slices
  const actualIsLoggedIn = isLoggedIn || authIsLoggedIn;
  const actualUserId = userId || _id || id;

  // Track if user has been identified in this session
  const userIdentifiedRef = useRef(false);
  const lastUserIdRef = useRef(null);
  const sessionInitializedRef = useRef(false);

  /**
   * Track user login when user state changes
   */
  useEffect(() => {
    // Skip if not properly initialized
    if (!sessionInitializedRef.current) {
      sessionInitializedRef.current = true;
      return;
    }

    // Only track if user is logged in and has a valid user ID
    if (actualIsLoggedIn && actualUserId) {
      // Check if this is a different user or first login
      const isDifferentUser = lastUserIdRef.current !== actualUserId;
      const isFirstLogin = !userIdentifiedRef.current;

      if (isDifferentUser || isFirstLogin) {
        const userAttributes = {
          firstName: userData?.name || userData?.firstName,
          lastName: userData?.lastName,
          email: userData?.email,
          phoneNumber:
            userData?.mobile || userData?.phone || userData?.phoneNumber,
          method: userData?.loginMethod || userData?.signupMethod || 'unknown',
          userType: userData?.userType || userData?.role || 'user',
          // Add Muzic-specific attributes
          creditsBalance: userData?.credits?.balance || userData?.credits || 0,
          subscriptionStatus:
            userData?.subscriptionStatus || userData?.isPremium
              ? 'premium'
              : 'free',
          totalSongsPlayed: userData?.totalSongsPlayed || 0,
          followersCount: userData?.followersCount || 0,
          followingCount: userData?.followingCount || 0,
        };

        // Track user login in MoEngage
        console.log(
          '[MoEngage Hook] Calling trackUserLogin with:',
          String(actualUserId),
        );
        moEngageService.trackUserLogin(String(actualUserId), userAttributes);

        // Update refs
        userIdentifiedRef.current = true;
        lastUserIdRef.current = actualUserId;

        console.log(
          '🎵 useMoEngageUser: User identified in Muzic:',
          actualUserId,
        );
      }
    }

    // Track logout when user becomes guest or logs out
    else if (!actualIsLoggedIn && userIdentifiedRef.current) {
      console.log('[MoEngage Hook] Calling trackUserLogout');
      moEngageService.trackUserLogout();
      userIdentifiedRef.current = false;
      lastUserIdRef.current = null;

      console.log('🎵 useMoEngageUser: User logged out from Muzic');
    }
  }, [actualIsLoggedIn, actualUserId, userData]);

  /**
   * Track custom event with automatic user context
   */
  const trackEvent = useCallback(
    (eventName, eventAttributes = {}) => {
      const enhancedAttributes = {
        ...eventAttributes,
        ...(actualUserId && {user_id: String(actualUserId)}),
        ...(actualIsLoggedIn && {is_logged_in: true}),
        // Add Muzic-specific context
        app_name: 'Muzic',
        credits_balance: userData?.credits?.balance || userData?.credits || 0,
        user_type: userData?.userType || userData?.role || 'user',
        subscription_status:
          userData?.subscriptionStatus ||
          (userData?.isPremium ? 'premium' : 'free'),
      };

      moEngageService.trackEvent(eventName, enhancedAttributes);
    },
    [actualUserId, actualIsLoggedIn, userData],
  );

  /**
   * Track Muzic-specific events with proper context
   */
  const trackMusicEvent = useCallback(
    (eventType, eventData = {}) => {
      const musicEvents = {
        songPlayed: MOENGAGE_CONFIG.EVENTS.SONG_PLAYED,
        songLiked: MOENGAGE_CONFIG.EVENTS.SONG_LIKED,
        songShared: MOENGAGE_CONFIG.EVENTS.SONG_SHARED,
        playlistCreated: MOENGAGE_CONFIG.EVENTS.PLAYLIST_CREATED,
        contentUploaded: MOENGAGE_CONFIG.EVENTS.CONTENT_UPLOADED,
        voiceRecording: MOENGAGE_CONFIG.EVENTS.VOICE_RECORDING_CREATED,
        nftViewed: MOENGAGE_CONFIG.EVENTS.NFT_VIEWED,
        nftPurchased: MOENGAGE_CONFIG.EVENTS.NFT_PURCHASED,
        tradeExecuted: MOENGAGE_CONFIG.EVENTS.TRADE_EXECUTED,
        creditsSpent: MOENGAGE_CONFIG.EVENTS.CREDITS_SPENT,
        creatorFollowed: MOENGAGE_CONFIG.EVENTS.CREATOR_FOLLOWED,
        aiContentGenerated: MOENGAGE_CONFIG.EVENTS.AI_CONTENT_GENERATED,
        gamePlayed: MOENGAGE_CONFIG.EVENTS.GAME_PLAYED,
      };

      const eventName = musicEvents[eventType];
      if (!eventName) {
        console.warn(`Unknown music event type: ${eventType}`);
        return;
      }

      trackEvent(eventName, {
        ...eventData,
        event_category: 'music_app',
        timestamp: new Date().toISOString(),
      });
    },
    [trackEvent],
  );

  /**
   * Track purchase with user context
   */
  const trackPurchase = useCallback(
    purchaseData => {
      const enhancedPurchaseData = {
        ...purchaseData,
        ...(actualUserId && {user_id: String(actualUserId)}),
        user_credits_before:
          userData?.credits?.balance || userData?.credits || 0,
      };

      moEngageService.trackPurchase(enhancedPurchaseData);
    },
    [actualUserId, userData],
  );

  /**
   * Update user attributes
   */
  const updateUserAttributes = useCallback(
    attributes => {
      if (actualIsLoggedIn && actualUserId) {
        moEngageService.setUserAttributes(attributes);
      }
    },
    [actualIsLoggedIn, actualUserId],
  );

  /**
   * Force user re-identification (useful after profile updates)
   */
  const reidentifyUser = useCallback(() => {
    if (actualUserId && actualIsLoggedIn) {
      userIdentifiedRef.current = false; // Force re-identification
      lastUserIdRef.current = null;

      // This will trigger the useEffect above to re-identify the user
      const userAttributes = {
        firstName: userData?.name || userData?.firstName,
        lastName: userData?.lastName,
        email: userData?.email,
        phoneNumber:
          userData?.mobile || userData?.phone || userData?.phoneNumber,
        method: 'profile_update',
        userType: userData?.userType || userData?.role || 'user',
        creditsBalance: userData?.credits?.balance || userData?.credits || 0,
        subscriptionStatus:
          userData?.subscriptionStatus ||
          (userData?.isPremium ? 'premium' : 'free'),
      };

      moEngageService.trackUserLogin(String(actualUserId), userAttributes);
      userIdentifiedRef.current = true;
      lastUserIdRef.current = actualUserId;

      console.log(
        '🎵 useMoEngageUser: User re-identified after profile update',
      );
    }
  }, [actualUserId, actualIsLoggedIn, userData]);

  /**
   * Get current user state for debugging
   */
  const getUserState = useCallback(() => {
    return {
      userId: actualUserId,
      isLoggedIn: actualIsLoggedIn,
      isIdentified: userIdentifiedRef.current,
      lastUserId: lastUserIdRef.current,
      creditsBalance: userData?.credits?.balance || userData?.credits || 0,
      subscriptionStatus:
        userData?.subscriptionStatus ||
        (userData?.isPremium ? 'premium' : 'free'),
      userType: userData?.userType || userData?.role || 'user',
      moengageState: moEngageService.getServiceState(),
      sessionInitialized: sessionInitializedRef.current,
    };
  }, [actualUserId, actualIsLoggedIn, userData]);

  /**
   * Convenience method to track common Muzic app events
   */
  const trackMuzicEvents = {
    songPlay: songData =>
      trackMusicEvent('songPlayed', {
        song_id: songData?.id || songData?._id,
        song_title: songData?.title || songData?.name,
        artist_name: songData?.artist || songData?.creator,
        genre: songData?.genre,
        duration: songData?.duration,
        is_premium: songData?.isPremium || false,
      }),

    nftView: nftData =>
      trackMusicEvent('nftViewed', {
        nft_id: nftData?.id || nftData?._id,
        nft_slug: nftData?.slug || nftData?.nftSlug,
        song_title: nftData?.title || nftData?.songTitle,
        current_price: nftData?.price || nftData?.buyPrice,
        tier_id: nftData?.tierId,
      }),

    creditsPurchase: purchaseData =>
      trackPurchase({
        product_type: 'credits',
        credits_amount: purchaseData?.creditsAmount || purchaseData?.amount,
        payment_method: purchaseData?.paymentMethod || 'unknown',
        transaction_id: purchaseData?.transactionId,
        ...purchaseData,
      }),

    aiGeneration: generationData =>
      trackMusicEvent('aiContentGenerated', {
        generation_type: generationData?.type || 'unknown', // 'cover', 'voice_clone', etc.
        prompt: generationData?.prompt,
        model_used: generationData?.model,
        credits_spent: generationData?.creditsSpent || 0,
        success: generationData?.success || true,
      }),

    socialAction: (actionType, targetData) => {
      const eventMap = {
        follow: MOENGAGE_CONFIG.EVENTS.CREATOR_FOLLOWED,
        unfollow: MOENGAGE_CONFIG.EVENTS.CREATOR_UNFOLLOWED,
        share: MOENGAGE_CONFIG.EVENTS.CONTENT_SHARED,
        comment: MOENGAGE_CONFIG.EVENTS.COMMENT_POSTED,
      };

      if (eventMap[actionType]) {
        trackEvent(eventMap[actionType], {
          target_id: targetData?.id || targetData?._id,
          target_type: targetData?.type || 'unknown',
          target_name: targetData?.name || targetData?.title,
          ...targetData,
        });
      }
    },
  };

  return {
    // User state
    isUserIdentified: userIdentifiedRef.current,
    currentUserId: actualUserId,
    isLoggedIn: actualIsLoggedIn,

    // Core tracking functions
    trackEvent,
    trackMusicEvent,
    trackPurchase,
    updateUserAttributes,

    // Muzic-specific event tracking
    trackMuzicEvents,

    // Utility functions
    reidentifyUser,
    getUserState,

    // Direct access to service (for advanced usage)
    moEngageService,
  };
};

export default useMoEngageUser;
