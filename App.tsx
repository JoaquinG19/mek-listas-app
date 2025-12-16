import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EmpresasLayout from "./src/layouts/EmpresasLayout";
import MainLayout from "./src/layouts/MainLayout";

const Stack = createNativeStackNavigator();

export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: "#582a51",
      onPrimary: "#ffffff",
    },
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator>
            {/* 🚀 Empieza mostrando la lista de empresas */}
            <Stack.Screen
              name="Empresas"
              component={EmpresasLayout}
              options={{
                title: "Empresas disponibles",
                headerStyle: { backgroundColor: "#582a51" },
                headerTintColor: "#fff",
                headerTitleStyle: { fontWeight: "bold" },
              }}
            />

            <Stack.Screen
              name="Main"
              component={MainLayout}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
