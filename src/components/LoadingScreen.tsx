import React from "react";
import { View } from "react-native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";

export default function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" animating={true} color={MD2Colors.purple500} />
    </View>
  );
}
