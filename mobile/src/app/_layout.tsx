import { Stack, ThemeProvider, DefaultTheme, DarkTheme } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Login' }} />
        <Stack.Screen name="(auth)/register" options={{ title: 'Register' }} />
        <Stack.Screen name="(doer)/dashboard" options={{ title: 'Doer Dashboard' }} />
        <Stack.Screen name="(doer)/profile" options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="(doer)/job-board" options={{ title: 'Job Board' }} />
        <Stack.Screen name="(doer)/job/[id]" options={{ title: 'Job Details' }} />
        <Stack.Screen name="(customer)/dashboard" options={{ title: 'Client Dashboard' }} />
        <Stack.Screen name="(customer)/post-job" options={{ title: 'Post a Job' }} />
        <Stack.Screen name="(customer)/search" options={{ title: 'Search' }} />
        <Stack.Screen name="(customer)/job/[id]" options={{ title: 'Job Details' }} />
        <Stack.Screen name="(customer)/doer/[id]" options={{ title: 'Professional Profile' }} />
        <Stack.Screen name="(messages)/inbox" options={{ title: 'Messages' }} />
        <Stack.Screen name="(messages)/chat" options={{ title: 'Chat' }} />
      </Stack>
    </ThemeProvider>
  );
}
