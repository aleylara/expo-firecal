# Implementation Plan

- [x] 1. Install and configure RevenueCat packages
  - [x] 1.1 Install react-native-purchases and react-native-purchases-ui packages
    - Run `npm install --save react-native-purchases react-native-purchases-ui`
    - _Requirements: 3.1_
  - [x] 1.2 Update app.json with RevenueCat plugin configuration
    - Add react-native-purchases to plugins array
    - _Requirements: 3.1_

- [x] 2. Create subscription storage utilities
  - [x] 2.1 Create subscription-storage.ts with AsyncStorage helpers
    - Implement `getCachedSubscriptionStatus()` and `setCachedSubscriptionStatus()`
    - Use key `firecal_pro_status` with `{ hasFireCalPro: boolean, lastChecked: number }`
    - _Requirements: 1.1, 1.2_
  - [ ]* 2.2 Write property test for cache round-trip
    - **Property 2: RevenueCat fetch updates cache**
    - **Validates: Requirements 1.2**

- [x] 3. Create SubscriptionContext and Provider
  - [x] 3.1 Create subscription-context.tsx with context and provider
    - Read cached status on mount before any network call
    - Initialize RevenueCat SDK with API key `test_wFSAMyRgVCltDolNsCYlwByHuFX` using `Purchases.configure()`
    - Set log level to VERBOSE for debugging
    - Check entitlement "FireCal Pro" using `Purchases.getCustomerInfo()`
    - Implement `presentPaywall()` using `RevenueCatUI.presentPaywall()`
    - Implement `presentCustomerCenter()` using `RevenueCatUI.presentCustomerCenter()`
    - Handle PAYWALL_RESULT enum (PURCHASED, RESTORED, CANCELLED, ERROR, NOT_PRESENTED)
    - Sync status to cache on every update
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.5, 4.1, 4.2, 7.1_
  - [ ]* 3.2 Write property test for cache determines initial visibility
    - **Property 1: Cache determines initial ad visibility**
    - **Validates: Requirements 1.1, 1.3**
  - [ ]* 3.3 Write property test for successful paywall result updates state
    - **Property 4: Successful paywall result updates state**
    - **Validates: Requirements 3.2**
  - [ ]* 3.4 Write property test for cancelled paywall maintains state
    - **Property 5: Cancelled paywall maintains state**
    - **Validates: Requirements 3.4**
  - [ ]* 3.5 Write property test for successful restore updates state
    - **Property 6: Successful restore updates state**
    - **Validates: Requirements 4.2**

- [x] 4. Integrate SubscriptionProvider into app
  - [x] 4.1 Add SubscriptionProvider to app/_layout.tsx
    - Wrap inside existing provider hierarchy after AsyncStorage is available
    - _Requirements: 1.1_

- [x] 5. Update BannerAdComponent with subscription check
  - [x] 5.1 Modify banner-ad.tsx to use subscription context
    - Return null when hasFireCalPro is true
    - Handle ad load failure by collapsing to zero height
    - _Requirements: 2.1, 2.3, 3.3_
  - [ ]* 5.2 Write property test for ad banner visibility
    - **Property 3: Ad banner visibility matches subscription state**
    - **Validates: Requirements 2.1, 3.3**

- [x] 6. Clean up tab layout
  - [x] 6.1 Refactor app/(tabs)/_layout.tsx to remove hacky code
    - Remove `headerStatusBarHeight: 0` override
    - Remove manual `Constants.statusBarHeight` padding
    - Use proper SafeAreaView for ad banner positioning
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Add subscription UI to settings
  - [x] 8.1 Update settings screen with Paywall and Customer Center integration
    - Show "FireCal Pro Active" when hasFireCalPro is true
    - Show "Upgrade to FireCal Pro" button when hasFireCalPro is false
    - Call `presentPaywall()` from context when upgrade button pressed
    - Show "Manage Subscription" button when hasFireCalPro is true
    - Call `presentCustomerCenter()` from context when manage button pressed
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.4_
  - [ ]* 8.2 Write property test for settings screen rendering
    - **Property 7: Settings screen reflects subscription state**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
  - [ ]* 8.3 Write property test for Customer Center presentation
    - **Property 8: Customer Center presents for Pro users**
    - **Validates: Requirements 7.1, 7.2**

- [x] 9. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
