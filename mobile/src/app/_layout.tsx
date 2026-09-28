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
        <Stack.Screen name="(doer)/profile" options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="(doer)/dashboard" options={{ title: 'Doer Dashboard', headerShown: true }} />
        <Stack.Screen name="(customer)/search" options={{ title: 'Search', headerShown: false }} />
        <Stack.Screen name="(customer)/doer/[id]" options={{ title: 'Professional Profile', headerShown: false }} />
        <Stack.Screen name="(messages)/chat" options={{ title: 'Chat', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
