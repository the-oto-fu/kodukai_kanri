import React from "react";
import { StyleSheet, View } from "react-native";
import TypeWriter from "react-native-typewriter";

const styles = StyleSheet.create({
  balloonContainer: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000cb",
    borderRadius: 2,
  },
  balloonTriangleBase: {
    width: 0,
    height: 0,
    position: "absolute",
    marginTop: -0.2,
    top: "100%", // ← 下に出す
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  balloonTriangleOuter: {
    left: 99,
    borderWidth: 15,
    borderTopColor: "#000000cb", // ← 上に色をつける
  },
  balloonTriangleInner: {
    left: 102,
    borderWidth: 12,
    borderTopColor: "#FFFFFF", // ← 内側
  },
  textContainer: {
    padding: 15,
  },
});

type HukidashiProps = {
  osyaberi: boolean;
};

function OsyaberiFukidashi({ osyaberi }: HukidashiProps) {
  return (
    <>
      <View
        style={{
          justifyContent: "flex-end",
          height: 100,
          paddingTop: 14,
          alignItems: "center",
        }}
      >
        {osyaberi && (
          <View style={styles.balloonContainer}>
            <View
              style={[styles.balloonTriangleBase, styles.balloonTriangleOuter]}
            />
            <View
              style={[styles.balloonTriangleBase, styles.balloonTriangleInner]}
            />
            <View style={styles.textContainer}>
              <TypeWriter
                typing={1}
                style={{
                  fontSize: 30,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                おはよう！！！
              </TypeWriter>
            </View>
          </View>
        )}
      </View>
    </>
  );
}

export default OsyaberiFukidashi;
