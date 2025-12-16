import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, Avatar, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { api } from "../utils/api";

export default function EmpresasLayout() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/empresas/activas");
      setEmpresas(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  if (loading && empresas.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator animating color="#582a51" size="large" />
        <Text style={{ marginTop: 10, color: "#582a51" }}>Cargando empresas...</Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Main", { empresaId: item.id })}
      activeOpacity={0.8}
    >
      <Card
        style={{
          marginBottom: 12,
          borderRadius: 10,
          elevation: 3,
          backgroundColor: "#fff",
        }}
      >
        <Card.Title
          title={`Código de la empresa: ${item.id}`}
          left={(props) => (
            <Avatar.Icon
              {...props}
              icon="office-building"
              color="#fff"
              style={{ backgroundColor: "#582a51" }}
            />
          )}
        />
        <Card.Content>
          <Text style={{ color: "#555" }}>
            {item.grupos?.length > 0
              ? `Grupos existentes: ${item.grupos.join(", ")}`
              : "Sin grupos"}
          </Text>

        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f9f9f9" }}
      edges={["right", "left", "bottom"]}
    >
      <View style={{ flex: 1, padding: 5 }}>
        <FlatList
          data={empresas}
          keyExtractor={(item) => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchEmpresas}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={{ marginTop: 40 }}>
              <Text style={{ textAlign: "center", color: "#666" }}>
                No hay empresas disponibles.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
