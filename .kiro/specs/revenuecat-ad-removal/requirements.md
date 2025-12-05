# Requirements Document

## Introduction

This feature implements a RevenueCat-powered in-app purchase system to allow users to purchase FireCal Pro, which removes ads from the FireCal app. The implementation uses RevenueCat's pre-built Paywall UI for purchase flows and Customer Center for subscription management. The ad banner sits below the status bar and above the navigation header, visible on all screens. When a user purchases the "FireCal Pro" entitlement, the banner disappears without leaving wasted space. Local storage caches the subscription status to prevent ad flicker on app launch.

## Glossary

- **RevenueCat**: A third-party service that simplifies in-app purchase management across iOS and Android
- **Entitlement**: A RevenueCat concept representing access to a feature (e.g., "FireCal Pro")
- **Paywall UI**: RevenueCat's pre-built purchase interface that handles the complete purchase flow
- **Customer Center**: RevenueCat's pre-built UI for managing subscriptions, refunds, and feedback
- **AdMob**: Google's mobile advertising platform used to display banner ads
- **Subscription Status**: Whether the user has purchased FireCal Pro access
- **Local Cache**: AsyncStorage-based persistence of subscription status for instant UI decisions
- **Offering**: A collection of subscription packages configured in RevenueCat dashboard
- **Package**: A specific product configuration (e.g., lifetime purchase)

## Requirements

### Requirement 1

**User Story:** As a user, I want the app to remember my ad-free status locally, so that I don't see ads flash before the subscription check completes.

#### Acceptance Criteria

1. WHEN the app launches THEN the Subscription_System SHALL read cached subscription status from local storage before rendering the ad banner
2. WHEN subscription status is fetched from RevenueCat THEN the Subscription_System SHALL update local storage with the current status
3. WHEN local cache indicates ad-free status THEN the Subscription_System SHALL hide the ad banner immediately without waiting for network response

### Requirement 2

**User Story:** As a user, I want to see a non-intrusive ad banner below the status bar, so that ads don't interfere with my app usage.

#### Acceptance Criteria

1. WHEN the user has not purchased ad-free THEN the Ad_Banner SHALL display below the status bar and above the navigation header
2. WHEN the ad banner is displayed THEN the Ad_Banner SHALL remain stationary and not scroll with content
3. WHEN the ad fails to load THEN the Ad_Banner SHALL collapse to zero height without leaving empty space

### Requirement 3

**User Story:** As a user, I want to purchase FireCal Pro using a beautiful paywall, so that I can use the app without advertisements.

#### Acceptance Criteria

1. WHEN a user initiates purchase THEN the Subscription_System SHALL present the RevenueCat Paywall UI modally
2. WHEN purchase completes successfully THEN the Subscription_System SHALL update the FireCal Pro entitlement status immediately
3. WHEN purchase completes successfully THEN the Ad_Banner SHALL disappear without leaving wasted space
4. IF purchase fails or is cancelled THEN the Subscription_System SHALL maintain current state without error disruption
5. WHEN the Paywall UI is presented THEN the Paywall_UI SHALL display the lifetime package with pricing

### Requirement 4

**User Story:** As a user, I want to restore my previous purchases, so that I can recover ad-free access on a new device.

#### Acceptance Criteria

1. WHEN a user requests purchase restoration THEN the Subscription_System SHALL query RevenueCat for previous purchases
2. WHEN restoration finds valid ad-free entitlement THEN the Subscription_System SHALL update status and hide ads
3. IF restoration finds no valid purchases THEN the Subscription_System SHALL inform the user appropriately

### Requirement 5

**User Story:** As a developer, I want clean layout code without hacky workarounds, so that the codebase is maintainable.

#### Acceptance Criteria

1. WHEN implementing the ad banner layout THEN the Layout_System SHALL use proper SafeAreaView handling instead of manual statusBarHeight calculations
2. WHEN the ad banner is hidden THEN the Layout_System SHALL not require headerStatusBarHeight overrides or manual padding adjustments
3. WHEN subscription status changes THEN the Layout_System SHALL re-render cleanly without layout jumps

### Requirement 6

**User Story:** As a user, I want to see my subscription status in settings, so that I know whether I have FireCal Pro access.

#### Acceptance Criteria

1. WHEN viewing settings THEN the Settings_Screen SHALL display current FireCal Pro status
2. WHEN user does not have FireCal Pro THEN the Settings_Screen SHALL show button to open Paywall UI
3. WHEN user has FireCal Pro THEN the Settings_Screen SHALL show confirmation of FireCal Pro status
4. WHEN user has FireCal Pro THEN the Settings_Screen SHALL show button to open Customer Center

### Requirement 7

**User Story:** As a user with FireCal Pro, I want to manage my subscription, so that I can view purchase details and request support.

#### Acceptance Criteria

1. WHEN a user opens Customer Center THEN the Customer_Center SHALL present the RevenueCat Customer Center UI modally
2. WHEN Customer Center is displayed THEN the Customer_Center SHALL show subscription status and management options
3. WHEN user completes restore in Customer Center THEN the Subscription_System SHALL update entitlement status
4. WHEN user dismisses Customer Center THEN the Customer_Center SHALL close and return to settings
