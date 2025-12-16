import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import SupervisorCard from "../components/SupervisorCard";
import SemanaCard from "../components/SemanaCard";
import LoadingScreen from "../components/LoadingScreen";
import styles from "../styles/stylesPeriodo";
import { api } from "../utils/api";
import { ActivityIndicator } from "react-native-paper";

export default function PeriodoScreen({ empresaId }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // carga inicial
  const [reloading, setReloading] = useState(false); // botón recargar

  // ======================
  // 🔁 BACKEND HOUSEKEEPING
  // ======================
  const runAutoMarkFaltas = async () => {
    await api.post("/asistencia/auto-mark-faltas", {
      empresas_id: empresaId,
    });
  };

  const runAutoCerrarSalidasPendientes = async () => {
    await api.post("/asistencia/auto-cerrar-salidas-pendientes", {
      empresas_id: empresaId,
    });
  };

  // ======================
  // 🔄 CARGA GENERAL
  // ======================
  const reloadScreen = useCallback(async () => {
    setReloading(true);
    try {
      await runAutoMarkFaltas();
      await runAutoCerrarSalidasPendientes();

      const res = await api.get(`/empresa/${empresaId}/cards`);
      setData(res.data);
    } catch (err) {
      console.error("Error al recargar PeriodoScreen:", err);
    } finally {
      setReloading(false);
      setLoading(false);
    }
  }, [empresaId]);

  // 🔰 Carga inicial
  useEffect(() => {
    reloadScreen();
  }, [reloadScreen]);

  if (loading && data.length === 0) {
    return <LoadingScreen />;
  }

  // ======================
  // 🔍 FILTRO
  // ======================
  const visibleCards = data.filter(
    (card) =>
      card.grupo?.visible?.toLowerCase() === "si" &&
      Array.isArray(card.supervisores) &&
      card.supervisores.length > 0
  );

  // ======================
  // 🖥 RENDER
  // ======================
  return (
    <View style={styles.container}>
      {/* 🔄 BOTÓN RECARGAR */}
      <View style={{ padding: 10 }}>
        <TouchableOpacity
          onPress={reloadScreen}
          disabled={reloading}
          style={{
            backgroundColor: "#b95eacff",
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            opacity: reloading ? 0.7 : 1,
          }}
        >
          {reloading && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {reloading ? "Actualizando..." : "Recargar información"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 📜 CONTENIDO */}
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        {visibleCards.length === 0 ? (
          <View style={{ padding: 20 }}>
            <Text style={{ textAlign: "center", color: "#666" }}>
              No hay grupos visibles con supervisores para esta empresa.
            </Text>
          </View>
        ) : (
          visibleCards.map((card, index) => (
            <View key={index}>
              {/* 👤 Supervisores */}
              {card.supervisores.map((sup) => (
                <SupervisorCard
                  key={sup.id}
                  supervisor={sup}
                  grupo={card.grupo}
                />
              ))}

              <View style={{ height: 10 }} />

              {/* 📆 Semanas */}
              {Object.entries(card.diasSemana ?? {}).map(([sem, dias]) => (
                <SemanaCard key={sem} sem={sem} dias={dias} card={card} />
              ))}

              <View style={{ height: 20 }} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
