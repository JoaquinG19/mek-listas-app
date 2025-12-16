import React, { useState } from "react";
import axios from "axios";
import { View, Text, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import stylesPeriodo from "../styles/stylesPeriodo";
import { useNavigation } from "@react-navigation/native";

const styles = stylesPeriodo;

// 👉 Función utilitaria: devuelve estilo por turno
const getTurnoStyle = (turno) => {
  switch (turno) {
    case "am":
      return { bg: "#FFD700", color: "#000" }; // amarillo
    case "pm":
      return { bg: "#00BFFF", color: "#fff" }; // celeste
    case "noc":
      return { bg: "#007bff", color: "#fff" }; // azul
    default:
      return { bg: "#ccc", color: "#000" };
  }
};

// 👉 Renderiza los estados (asistencias)
const EstadosTurno = ({ asistencias }) => {
  return ["am", "pm", "noc"].map((turno) => {
    const asistencia = asistencias?.[turno];
    if (!asistencia) return null;

    const { bg, color } = getTurnoStyle(turno);

    return (
      <Text
        key={turno}
        style={[styles.badgeEstado, { backgroundColor: bg, color }]}
      >
        {asistencia.charAt(0).toUpperCase() + asistencia.slice(1)}
      </Text>
    );
  });
};

// 👉 Botón con borde dinámico
const BotonAgregar = ({ active, onPress }) => (
  <View style={[styles.iconWrapper, { borderColor: active ? "green" : "gray" }]}>
    <IconButton
      icon="plus"
      size={26}
      iconColor={active ? "green" : "gray"}
      onPress={onPress}
      disabled={!active}
    />
  </View>
);

// 👉 Componente principal
export default function CeldaDia({ emp, dia, card, supervisorIds }) {
  const navigation = useNavigation();

  const asistencias = card.asistenciasPorTurno?.[emp.id]?.[dia.fecha];
  const tieneAsignacion = card.asignaciones?.[emp.id]?.[dia.fecha];
  const puedeMostrar = emp.isSup ? dia.hasSup : tieneAsignacion;

  return (
    <View style={[styles.cell, { width: 140 }]}>
      {puedeMostrar ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <BotonAgregar
            active={dia.active}
            onPress={() =>
              navigation.navigate("Asistencia", {
                empId: emp.id,
                fecha: dia.fecha,
                isSup: emp.isSup,
                grupoIds: card.grupoIds ?? [card.grupo?.id],
                supervisorIds,
              })
            }

          />
          <EstadosTurno asistencias={asistencias} />
        </View>
      ) : (
        <Text style={{ color: "#999" }}>—</Text>
      )}
    </View>
  );
}
