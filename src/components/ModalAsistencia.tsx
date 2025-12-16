import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Modal, Portal, Button, Divider } from "react-native-paper";
import stylesPeriodo from "../styles/stylesPeriodo";

const styles = stylesPeriodo;

interface ModalAsistenciaProps {
  visible: boolean;
  onDismiss: () => void;
  empleado: any;
  diaFecha: string;
  registroAsistenciaAM?: { hora_ingreso?: string };
  canMarkAm?: boolean;
}

export default function ModalAsistencia({
  visible,
  onDismiss,
  empleado,
  diaFecha,
  registroAsistenciaAM,
  canMarkAm = true,
}: ModalAsistenciaProps) {
  const marcarIngresoAM = () => {
    // Aquí iría la función POST al backend
    console.log("Marcar ingreso AM", empleado?.id, diaFecha);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={modalStyles.container}
      >
        <ScrollView>
          {/* Título */}
          <Text style={modalStyles.title}>Marcar asistencia para:</Text>
          <Text style={modalStyles.subTitle}>
            {empleado?.name ?? "-"} {empleado?.apellido_paterno ?? "-"}
          </Text>
          <Divider style={{ marginVertical: 10 }} />

          {/* Turno AM */}
          <View style={{ marginBottom: 20 }}>
            <Text style={modalStyles.turnoTitle}>Turno AM</Text>

            {/* Ingreso AM */}
            <View style={modalStyles.row}>
              <View style={{ flex: 1 }}>
                <Button
                  mode="contained"
                  onPress={marcarIngresoAM}
                  disabled={!canMarkAm || !!registroAsistenciaAM?.hora_ingreso}
                >
                  Marcar ingreso AM
                </Button>
              </View>
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>{registroAsistenciaAM?.hora_ingreso ?? "-"}</Text>
              </View>
            </View>
          </View>

          {/* Horas regulares */}
          <Text style={{ fontSize: 12 }}>
            <Text style={{ fontWeight: "700" }}>Horas regulares asignadas: </Text>
            {"-"}
          </Text>

          <Button onPress={onDismiss} style={{ marginTop: 20 }}>
            Cerrar
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 8,
    padding: 15,
    maxHeight: "80%",
  },
  title: { fontSize: 14, fontWeight: "700" },
  subTitle: { fontSize: 14, marginBottom: 10 },
  turnoTitle: { fontWeight: "700", fontSize: 14, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
});
