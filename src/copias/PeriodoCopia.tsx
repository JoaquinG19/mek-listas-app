
import * as React from 'react';
import { useEffect, useState } from "react";
import { View, ScrollView } from 'react-native';
import { Avatar, Text, Card, ActivityIndicator, MD2Colors } from 'react-native-paper';
import CeldaDia from "../components/CeldaDia";
import stylesPeriodo from "../styles/stylesPeriodo";

const styles = stylesPeriodo;

const COL_WIDTH_INDEX = 48;
const COL_WIDTH_NAME = 160;
const COL_WIDTH_DAY = 140;

export default function PeriodoScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://192.168.1.207/sis-horas/public/api/supervision/27/cards")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false); // 👈 ya cargó la data
      })
      .catch((err) => {
        console.error(err);
        setLoading(false); // 👈 aunque falle, quita el loading
      });
  }, []);

  // 👇 Si está cargando, mostramos el ActivityIndicator centrado
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" animating={true} color={MD2Colors.purple500} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
        {/* Contenido en bucle o el array o el mapeado */}
        {data.map((card, index) => (
          <View key={index}>
            {/* 👤 Supervisor */}
            <Card style={styles.card}>
              <Card.Title
                title={`Supervisor: ${card.supervisor?.name ?? "—"} ${card.supervisor?.apellido_paterno ?? "—"}`}
                subtitle={`PP-${card.grupo?.periodos_id ?? "—"}`}
                titleStyle={styles.title}
                subtitleStyle={styles.subtitle}
                style={styles.cardTitle}
                left={(props) => (
                  <Avatar.Icon
                    {...props}
                    icon="folder"
                    color="#582a51"
                    style={styles.avatarIcon}
                  />
                )}
              />
            </Card>

            <View style={{ padding: 10 }} />

            {Object.entries(card.diasSemana ?? {}).map(([sem, dias]) => (
              <React.Fragment key={sem}>
                {/* 🏷️ Header de semana */}
                <Card style={styles.topheader}>
                  <Card.Title
                    title={`Semana ${sem.slice(-2)} ${card.empresa?.nombre ?? "—"} — ${card.grupo?.titulo ?? "—"} — ${card.grupo?.servicios?.nombre ?? "—"}`}
                  />
                </Card>

                {/* 📋 Tabla */}
                <View style={styles.tableRow}>
                  {/* IZQUIERDA: N° y Nombre */}
                  <View style={[styles.leftBlock, { width: COL_WIDTH_INDEX + COL_WIDTH_NAME }]}>
                    {/* Header fijo */}
                    <View style={[styles.rowhead, styles.headerRow]}>
                      <View style={[styles.cell, { width: COL_WIDTH_INDEX }]}>
                        <Text style={styles.headerText}>N°</Text>
                      </View>
                      <View style={[styles.cell, { width: COL_WIDTH_NAME }]}>
                        <Text style={styles.headerText}>Nombre</Text>
                      </View>
                    </View>

                    {/* Supervisor siempre primero */}
                    <View style={[styles.row, styles.rowEven]}>
                      <View style={[styles.cell, { width: COL_WIDTH_INDEX }]}>
                        <Text style={styles.cellText}>1</Text>
                      </View>
                      <View style={[styles.cell, { width: COL_WIDTH_NAME }]}>
                        <Text style={styles.cellText}>
                          {card.supervisor?.name} {card.supervisor?.apellido_paterno}
                        </Text>
                      </View>
                    </View>

                    {/* Empleados */}
                    {card.empleados?.map((emp, i) => (
                      <View key={emp.id} style={[styles.row, i % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                        <View style={[styles.cell, { width: COL_WIDTH_INDEX }]}>
                          <Text style={styles.cellText}>{i + 2}</Text>
                        </View>
                        <View style={[styles.cell, { width: COL_WIDTH_NAME }]}>
                          <Text style={styles.cellText}>{emp.name}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* DERECHA: días */}
                  <ScrollView horizontal showsHorizontalScrollIndicator>
                    <View>
                      {/* Header días */}
                      <View style={[styles.rowday, styles.headerRow]}>
                        {dias.map((dia, idx) => (
                          <View key={idx} style={[styles.cell, { width: COL_WIDTH_DAY }]}>
                            <Text style={styles.headerDay}>{dia.dia}</Text>
                            {dia.fecha ? (
                              <>
                                <Text style={styles.headerMessage}>
                                  {dia.fecha.split("-").reverse().join("/")}
                                </Text>
                                {dia.am && <Text style={styles.badgeYellowText}>AM: {dia.am}</Text>}
                                {dia.pm && <Text style={styles.badgeBlueText}>PM: {dia.pm}</Text>}
                                {dia.noc && <Text style={styles.badgePrimaryText}>NOC: {dia.noc}</Text>}
                              </>
                            ) : (
                              <Text style={styles.headerMessage}>Sin asignación</Text>
                            )}
                          </View>
                        ))}
                      </View>

                      {/* Fila Supervisor + Empleados */}
                      {[{ ...card.supervisor, isSup: true }, ...(card.empleados ?? [])].map(
                        (emp, rowIndex) => (
                          <View
                            key={emp.id}
                            style={[
                              styles.row,
                              rowIndex % 2 === 0 ? styles.rowEven : styles.rowOdd,
                              { minWidth: dias.length * COL_WIDTH_DAY },
                            ]}
                          >
                          {dias.map((dia, i) => (
                            <CeldaDia key={i} emp={emp} dia={dia} card={card} />
                          ))}
                          </View>
                        )
                      )}
                    </View>
                  </ScrollView>
                </View>
              </React.Fragment>
            ))}

          </View>
        ))}
        {/* OJO EL DATA MAP DEBE ABARCAR HASTA AQUÍ */}
      </ScrollView>
    </View>
  );
}
