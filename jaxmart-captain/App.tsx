// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useCatalogStore } from './src/store/useCatalogStore';
import { useCompanyStore } from './src/store/useCompanyStore';

export default function App() {
  React.useEffect(() => {
    useCatalogStore.getState().initializeCatalog();
    useCompanyStore.getState().fetchCompanies();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
