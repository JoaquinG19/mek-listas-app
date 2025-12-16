import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Provider as PaperProvider,
  DefaultTheme,
  BottomNavigation,
} from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet, ScrollView } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

import HomeScreen from "../screens/HomeScreen";
import PeriodoScreen from "../screens/PeriodoScreen";
import ReporteScreen from "../screens/ReporteScreen";
import AsistenciaScreen from "../screens/AsistenciaScreen";

const Stack = createNativeStackNavigator();

function Tabs({ empresaId }: { empresaId: number }) {
  const [index, setIndex] = useState(0);
  const navigation = useNavigation();

  const routes = [
    //{ key: "dia", title: "Por día", icon: "calendar-today" },
    { key: "periodo", title: "Por periodo", icon: "calendar-week" },
    //{ key: "reporte", title: "Agregar Reporte", icon: "plus" },
    { key: "volver", title: "Volver", icon: "arrow-left" }, // 👈 nueva pestaña
  ];

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      //case "dia":
      //  return <HomeScreen empresaId={empresaId} />;
      case "periodo":
        return <PeriodoScreen empresaId={empresaId} />;
      case "reporte":
        return <ReporteScreen empresaId={empresaId} />;
      case "volver":
        // 👇 no muestra nada porque solo sirve para volver
        return null;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {renderScene({ route: routes[index] })}
        </ScrollView>
      </View>

      <BottomNavigation.Bar
        navigationState={{ index, routes }}
        onTabPress={({ route }) => {
          if (route.key === "volver") {
            navigation.goBack(); // 👈 vuelve a EmpresasLayout
            return;
          }

          const newIndex = routes.findIndex((r) => r.key === route.key);
          if (newIndex !== -1) setIndex(newIndex);
        }}
        renderIcon={({ route, color }) => (
          <MaterialCommunityIcons
            name={route.icon as any}
            size={24}
            color={color}
          />
        )}
        // ✅ ocultar labels (solo iconos)
        renderLabel={() => null}
        getLabelText={({ route }) => route.title}
        activeColor="#fff"
        inactiveColor="#fff"
        style={{ backgroundColor: "#582a51" }}
      />
    </SafeAreaView>
  );
}

export default function MainLayout({ route }: any) {
  const { empresaId } = route.params;

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: "#582a51",
      onPrimary: "#ffffff",
    },
  };

  return (
    <PaperProvider theme={theme}>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" options={{ headerShown: false }}>
          {() => <Tabs empresaId={empresaId} />}
        </Stack.Screen>
        <Stack.Screen
          name="Asistencia"
          component={AsistenciaScreen}
          options={{ title: "Asignar asistencia" }}
        />
      </Stack.Navigator>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
});
