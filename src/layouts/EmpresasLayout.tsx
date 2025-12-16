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
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator animating color="#582a51" size="large" />
        <Text
          style={{
            marginTop: 12,
            color: "#582a51",
            fontFamily: "Weib-Bold",
            fontWeight: "normal",
            fontSize: 15,
            letterSpacing: 0.2,
          }}
        >
          Cargando empresas...
        </Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Main", { empresaId: item.id })}
      activeOpacity={0.85}
      style={{ marginBottom: 12 }}
    >
      <Card
        style={{
          borderRadius: 10,
          backgroundColor: "#fff",
          overflow: "hidden",
          elevation: 2,
          margin: 4,
        }}
        contentStyle={{ paddingVertical: 6 }}
      >
        <Card.Title
          title={`CÓDIGO DE EMPRESA: ${item.id}`}
          titleNumberOfLines={1}
          titleStyle={{
            fontFamily: "Weib-Bold",
            fontWeight: "bold",
            fontSize: 14,
            letterSpacing: 0.3,
            color: "#1f1f1f",
          }}
          style={{ paddingRight: 12 }}
          left={(props) => (
            <Avatar.Icon
              {...props}
              icon="office-building"
              color="#fff"
              size={42}
              style={{
                backgroundColor: "#582a51",
                borderRadius: 50,
              }}
            />
          )}
        />

        <Card.Content style={{ paddingTop: 0, paddingBottom: 14 }}>
          <Text
            style={{
              color: "#5b5b5b",
              fontFamily: "Weib-Regular",
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {item.grupos?.length > 0
              ? `Grupos existentes: ${item.grupos.join(", ")}`
              : "Sin grupos"}
          </Text>
        </Card.Content>

        {/* Línea sutil inferior */}
        <View style={{ height: 1, backgroundColor: "rgba(0,0,0,0.06)" }} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f6f6f8" }}
      edges={["right", "left", "bottom"]}
    >
      <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }}>
        <FlatList
          data={empresas}
          keyExtractor={(item) => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchEmpresas}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 18,
          }}
          ListEmptyComponent={
            <View style={{ marginTop: 46 }}>
              <Text
                style={{
                  textAlign: "center",
                  color: "#6b6b6b",
                  fontFamily: "Weib-Regular",
                  fontSize: 14,
                }}
              >
                No hay empresas disponibles.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
