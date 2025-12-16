import React from "react";
import { View, ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";
import CeldaDia from "./CeldaDia";
import EmpleadoRow from "./EmpleadoRow";
import styles from "../styles/stylesPeriodo";
import { COL_WIDTH_INDEX, COL_WIDTH_NAME, COL_WIDTH_DAY } from "../constants/layout";

export default function SemanaCard({ sem, dias, card }) {
  return (
    <>
      {/* 🏷️ Header de semana */}
      <Card style={styles.topheader}>
        <Card.Title
          title={`Semana ${sem.slice(-2)} — ${card.grupo?.titulo ?? "—"}`}
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

          {/* 🔄 Supervisores primero */}
          {card.supervisores?.map((sup, idx) => (
            <View key={sup.id} style={[styles.row, idx % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
              <View style={[styles.cell, { width: COL_WIDTH_INDEX }]}>
                <Text style={styles.cellText}>{idx + 1}</Text>
              </View>
              <View style={[styles.cell, { width: COL_WIDTH_NAME }]}>
                <Text style={styles.cellText}>
                  {sup.name} {sup.apellido_paterno}
                </Text>
              </View>
            </View>
          ))}

          {/* Empleados después */}
          {card.empleados?.map((emp, i) => (
            <EmpleadoRow
              key={emp.id}
              emp={emp}
              index={(card.supervisores?.length ?? 0) + i + 1}
              isEven={i % 2 === 0}
            />
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

            {/* 🔄 Filas supervisores + empleados */}
            {[...(card.supervisores?.map((sup) => ({ ...sup, isSup: true })) ?? []), ...(card.empleados ?? [])].map(
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
                    <CeldaDia key={i} emp={emp} dia={dia} card={card} supervisorIds={card.supervisores?.map(s => s.id) ?? []}/>
                  ))}
                </View>
              )
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
