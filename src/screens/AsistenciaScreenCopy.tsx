// 📂 screens/AsistenciaScreen.tsx
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, ScrollView, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { api } from "../utils/api";

type RegistroAsistencia = {
  hora_ingreso?: string;
  hora_salida?: string;
  break_start?: string;
  tiempo_descanso?: string;
  lunch_start?: string;
  tiempo_almuerzo?: string;
};

type Turnos = {
  am?: { start: string; end: string };
  pm?: { start: string; end: string };
  noc?: { start: string; end: string };
};

export default function AsistenciaScreen({ route }) {
  const [loading, setLoading] = useState(true);
  const [empleado, setEmpleado] = useState<any>(null);
  const [asistencia, setAsistencia] = useState<any>(null);

  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [showModalPass, setShowModalPass] = useState(false);

  const navigation = useNavigation();

  const [turnos, setTurnos] = useState<Turnos>({});
  const [registros, setRegistros] = useState<{ [key: string]: RegistroAsistencia }>({});
  
  const [timers, setTimers] = useState<{ [key: string]: { break: string; lunch: string } }>({
    am: { break: "-", lunch: "-" },
    pm: { break: "-", lunch: "-" },
    noc: { break: "-", lunch: "-" },
  });

  //timers nuevos
  const TORONTO_OFFSET_MINUTES = 300; // 5 horas

  const initTimer = (): TimerState => ({
    baseSeconds: 0,
    running: false,
    startedAt: null,
  });

  type TimerState = {
    baseSeconds: number;   // tiempo acumulado del backend
    running: boolean;      // si está activo
    startedAt: number | null; // timestamp LOCAL (Date.now)
  };

  const [localTimers, setLocalTimers] = useState<{
    am: { break: TimerState; lunch: TimerState };
    pm: { break: TimerState; lunch: TimerState };
    noc: { break: TimerState; lunch: TimerState };
  }>({
    am: { break: initTimer(), lunch: initTimer() },
    pm: { break: initTimer(), lunch: initTimer() },
    noc: { break: initTimer(), lunch: initTimer() },
  });


  // 👇 Ahora recibimos grupoIds (array)
  const { empId, fecha, grupoIds, supervisorIds } = route.params;

  // 👉 Verificación al inicio
  const handleVerify = async () => {
    try {
      const res = await api.post("/asistencia/verificar-password", {
        user_id: empId,
        password,
      });

      if (res.data.success) {
        setIsVerified(true);
        Alert.alert("Éxito", "Acceso concedido");
      } else {
        Alert.alert("Error", res.data.message);
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Fallo en la verificación");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/asistencia/data", {
          params: {
            user_id: empId,
            fecha,
            grupo_ids: grupoIds, // 👈 aquí va el array entero
          },
        });

        setEmpleado(res.data.empleado);
        setAsistencia(res.data);
        setTurnos(res.data.turnos);
        setRegistros(res.data.registros_asistencia);

        // 🔥 Lógica para mostrar modal según modal_pass
        const grupos = res.data.grupos || [];
        const algunoConModal = grupos.some((g: any) => g.modal_pass === "si");
        setShowModalPass(algunoConModal);
        setIsVerified(!algunoConModal); // si no requiere modal, auto-verifica
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "No se pudo cargar la asistencia");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [empId, fecha, grupoIds]);


  // Función para marcar timers genéricos
  const timeToSeconds = (time?: string) => {
    if (!time) return 0;
    const [h, m, s] = time.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };
  
  const diffSecondsFromBackend = (start?: string) => {
    if (!start) return 0;

    // start = "YYYY-MM-DD HH:mm:ss" (Toronto)
    const [date, time] = start.split(" ");
    if (!date || !time) return 0;

    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm, ss] = time.split(":").map(Number);

    // Interpretar como UTC
    const utcMillis = Date.UTC(y, m - 1, d, hh, mm, ss);

    // Ajustar desde Toronto a UTC
    const torontoMillis = utcMillis + TORONTO_OFFSET_MINUTES * 60 * 1000;

    return Math.floor((Date.now() - torontoMillis) / 1000);
  };

  useEffect(() => {
    const buildBreak = (reg?: RegistroAsistencia): TimerState => {
      if (!reg) return initTimer();

      const base = timeToSeconds(reg.tiempo_descanso);
      const extra = diffSecondsFromBackend(reg.break_start);

      return {
        baseSeconds: base + extra,
        running: !!reg.break_start,
        startedAt: !!reg.break_start ? Date.now() : null,
      };
    };

    const buildLunch = (reg?: RegistroAsistencia): TimerState => {
      if (!reg) return initTimer();

      const base = timeToSeconds(reg.tiempo_almuerzo);
      const extra = diffSecondsFromBackend(reg.lunch_start);

      return {
        baseSeconds: base + extra,
        running: !!reg.lunch_start,
        startedAt: !!reg.lunch_start ? Date.now() : null,
      };
    };

    setLocalTimers({
      am: { break: buildBreak(registros.am), lunch: buildLunch(registros.am) },
      pm: { break: buildBreak(registros.pm), lunch: buildLunch(registros.pm) },
      noc: { break: buildBreak(registros.noc), lunch: buildLunch(registros.noc) },
    });
  }, [registros]);


  useEffect(() => {
    const interval = setInterval(() => {
      setLocalTimers(prev => {
        const update = (t: TimerState): TimerState => {
          if (!t.running || !t.startedAt) return t;

          const diff = Math.floor((Date.now() - t.startedAt) / 1000);
          return {
            ...t,
            baseSeconds: t.baseSeconds + diff,
            startedAt: Date.now(),
          };
        };

        return {
          am: { break: update(prev.am.break), lunch: update(prev.am.lunch) },
          pm: { break: update(prev.pm.break), lunch: update(prev.pm.lunch) },
          noc: { break: update(prev.noc.break), lunch: update(prev.noc.lunch) },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatSeconds = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  const renderTurno = (tipo: "am" | "pm" | "noc") => {
    const turno = turnos[tipo];
    const reg = registros[tipo];
    if (!turno) return null;

    const breakLabel = reg?.break_start ? `Terminar descanso ${tipo.toUpperCase()}` : `Iniciar descanso ${tipo.toUpperCase()}`;
    const lunchLabel = reg?.lunch_start ? `Terminar almuerzo ${tipo.toUpperCase()}` : `Iniciar almuerzo ${tipo.toUpperCase()}`;

    return (
      <View style={styles.turnoContainer}>
        <Text style={styles.subtitle}>
          Turno {tipo.toUpperCase()} ({turno.start} - {turno.end})
        </Text>
        
        {/* Ingreso */}
        <View style={styles.row}>
          <Button
            title={`Marcar ingreso ${tipo.toUpperCase()}`}
            onPress={async () => {
              try {
                const res = await api.post("/asistencia/marcar-ingreso", {
                  user_id: empId,
                  fecha,
                  tipo,
                  grupo_ids: grupoIds,
                  supervisor_ids: supervisorIds,
                });
                Alert.alert("Éxito", res.data.message);
                setRegistros({ ...registros, [tipo]: res.data.detalle });
              } catch (err) {
                Alert.alert("Error", err.response?.data?.message || "Error al marcar ingreso");
              }
            }}
            disabled={!!reg?.hora_ingreso}
          />
          <Text>{reg?.hora_ingreso ?? "-"}</Text>
        </View>

        {reg?.hora_ingreso && (
          <>
            {/* Descanso */}
            <View style={styles.row}>
              <Button
                title={breakLabel}
                color="orange"
                onPress={async () => {
                  try {
                    const res = await api.post("/asistencia/iniciar-descanso", {
                      user_id: empId,
                      fecha,
                      tipo,       // "am" | "pm" | "noc"
                      grupo_ids: grupoIds,
                      supervisor_ids: supervisorIds,
                    });

                    Alert.alert("Éxito", res.data.message);

                    // 🔥 Actualizamos el registro con lo que devuelve la API
                    setRegistros({ ...registros, [tipo]: res.data.detalle });
                  } catch (err: any) {
                    Alert.alert("Error", err.response?.data?.message || "Error al marcar descanso");
                  }
                }}
                disabled={!!reg?.hora_salida}
              />
              <Text
                style={
                  localTimers[tipo].break.baseSeconds / 60 > 30
                    ? { color: "red" }
                    : {}
                }
              >
                {formatSeconds(localTimers[tipo].break.baseSeconds)}
              </Text>

            </View>

            {/* Almuerzo */}
            <View style={styles.row}>
              <Button
                title={lunchLabel}
                color="blue"
                onPress={async () => {
                  try {
                    const res = await api.post("/asistencia/iniciar-almuerzo", {
                      user_id: empId,
                      fecha,
                      tipo,
                      grupo_ids: grupoIds,
                      supervisor_ids: supervisorIds,
                    });
                    Alert.alert("Éxito", res.data.message);

                    // 👇 Actualizar el registro con lo que devuelve la API
                    setRegistros({ ...registros, [tipo]: res.data.detalle });
                  } catch (err: any) {
                    Alert.alert("Error", err.response?.data?.message || "Error al marcar almuerzo");
                  }
                }}
                disabled={!!reg?.hora_salida}
              />

              <Text
                style={
                  localTimers[tipo].lunch.baseSeconds / 60 > 30
                    ? { color: "red" }
                    : {}
                }
              >
                {formatSeconds(localTimers[tipo].lunch.baseSeconds)}
              </Text>


            </View>

            {/* Salida */}
            <View style={styles.row}>
              <Button
                title={`Marcar salida ${tipo.toUpperCase()}`}
                color="red"
                disabled={!!reg?.hora_salida}
                onPress={async () => {
                  try {
                    const res = await api.post("/asistencia/marcar-salida", {
                      user_id: empId,
                      fecha,
                      tipo,
                      grupo_ids: grupoIds,
                      supervisor_ids: supervisorIds,
                    });
                    Alert.alert("Éxito", res.data.message);

                    // 👇 Actualizar el registro local con lo que devuelve la API
                    setRegistros({ ...registros, [tipo]: res.data.detalle });
                  } catch (err: any) {
                    Alert.alert("Error", err.response?.data?.message || "Error al marcar salida");
                  }
                }}
              />

              <Text>{reg?.hora_salida ?? "-"}</Text>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🔐 Modal de verificación SOLO si algún grupo tiene modal_pass="si" */}
      {showModalPass && (
        <Modal visible={!isVerified} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={{ fontSize: 18, marginBottom: 8 }}>Ingrese su contraseña</Text>
              <TextInput
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Button title="Cancelar" color="gray" onPress={() => navigation.goBack()} />
                <Button title="Confirmar" onPress={handleVerify} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Marcar asistencia para:</Text>
      <Text>
        {empleado?.name ?? "-"} {empleado?.apellido_paterno ?? "-"}
      </Text>
      <Text>Fecha: {fecha}</Text>

      {renderTurno("am")}
      {renderTurno("pm")}
      {renderTurno("noc")}

      <View style={{ marginTop: 16 }}>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Horas regulares asignadas:</Text> {asistencia?.horas_regulares ?? "-"}
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: "600", marginTop: 16 },
  turnoContainer: { marginBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
  },
  safeArea: { flex: 1, backgroundColor: "#fff", paddingTop: -30},
});
