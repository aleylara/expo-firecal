import { PostHogProvider } from 'posthog-react-native';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider
      apiKey="phc_sEUjjbAIQoLW3wKDSPF4lCjDUTzAOy6718d2sx1DSLT"
      options={{
        host: 'https://eu.i.posthog.com',
      }}
    >
      {children}
    </PostHogProvider>
  );
}
