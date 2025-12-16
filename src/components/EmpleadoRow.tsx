import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import styles from "../styles/stylesPeriodo";
import { COL_WIDTH_INDEX, COL_WIDTH_NAME } from "../constants/layout";

export default function EmpleadoRow({ emp, index, isEven }) {
  return (
    <View style={[styles.row, isEven ? styles.rowEven : styles.rowOdd]}>
      <View style={[styles.cell, { width: COL_WIDTH_INDEX }]}>
        <Text style={styles.cellText}>{index}</Text>
      </View>
      <View style={[styles.cell, { width: COL_WIDTH_NAME }]}>
        <Text style={styles.cellText}>{emp.name}</Text>
      </View>
    </View>
  );
}
