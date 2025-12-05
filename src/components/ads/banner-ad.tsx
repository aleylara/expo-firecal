import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import mobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { useSubscription } from '@/contexts/subscription/subscription-context';

const AD_UNIT_IDS = {
  ios: __DEV__ ? TestIds.BANNER : 'ca-app-pub-8291123251163654/8155695336',
  android: __DEV__ ? TestIds.BANNER : 'ca-app-pub-8291123251163654/7090025679',
};

export default function BannerAdComponent() {
  const { hasFireCalPro } = useSubscription();
  const [isAdMobLoaded, setIsAdMobLoaded] = useState(false);
  const [adLoadFailed, setAdLoadFailed] = useState(false);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        setIsAdMobLoaded(true);
      });
  }, []);

  const adUnitId =
    Platform.select({
      ios: AD_UNIT_IDS.ios,
      android: AD_UNIT_IDS.android,
    }) || TestIds.BANNER;

  const shouldShowAd = !hasFireCalPro && isAdMobLoaded && !adLoadFailed;

  if (!shouldShowAd) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdFailedToLoad={() => setAdLoadFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});