import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import TypeWriter from "react-native-typewriter";
import { db } from "../db/database";
import { useYearMonth } from "../hooks/useYearMonth";

export default function TopScreen() {
  const [budget, setBudget] = useState(0);
  const [tmpPayment, setTmpPayment] = useState("");
  const [tmpName, setTmpName] = useState("");
  const [osyaberi, setOsyaberi] = useState(false);

  const { getTargetYearMonth } = useYearMonth();

  const load = () => {
    const targertYearMonth = getTargetYearMonth();

    // 現日時に対応する収入を取得
    const income = db.getFirstSync<any>(
      "SELECT INCOME_PRICE FROM INCOME WHERE YEAR_MONTH = ?",
      [targertYearMonth],
    );
    const incomePrice = income ? income.INCOME_PRICE : 0;

    // 固定費の合計を取得
    const fixedCosts = db.getAllSync<any>("SELECT PRICE FROM FIXED_COSTS");
    const totalCosts = fixedCosts.reduce((sum, f) => sum + f.PRICE, 0);

    // 現在日時に対応する支出の合計を取得
    const payments = db.getAllSync<any>(
      "SELECT PRICE FROM PAYMENTS WHERE YEAR_MONTH = ?",
      [targertYearMonth],
    );
    const totalPayments = payments.reduce((sum, e) => sum + e.PRICE, 0);

    setBudget(incomePrice - totalCosts - totalPayments);
  };

  useEffect(() => {
    load();
  }, []);

  const addPayment = () => {
    db.runSync(
      "INSERT INTO PAYMENTS (YEAR_MONTH, NAME, PRICE) VALUES (?, ?, ?)",
      [getTargetYearMonth(), tmpName, Number(tmpPayment)],
    );
    setTmpPayment("");
    setTmpName("");
    load();
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      {/* 画面全体をタップ可能にして、タップしたらキーボードを閉じるためのView */}
      <View style={{ height: "100%" }}>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 50, fontWeight: "bold" }}>
            残高: {budget.toLocaleString()} 円
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          <View style={{ paddingBottom: 20 }}>
            <TextInput
              label="使用金額"
              keyboardType="numeric"
              value={tmpPayment}
              onChangeText={setTmpPayment}
              mode="outlined"
            />

            <TextInput
              label="何に使ったか"
              value={tmpName}
              onChangeText={setTmpName}
              mode="outlined"
            />
          </View>

          <Button mode="contained" onPress={addPayment}>
            追加
          </Button>

          {budget === 0 && (
            <Text style={{ color: "red" }}>
              ※今月の収入が設定されていません
            </Text>
          )}
        </View>

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
                style={[
                  styles.balloonTriangleBase,
                  styles.balloonTriangleOuter,
                ]}
              />
              <View
                style={[
                  styles.balloonTriangleBase,
                  styles.balloonTriangleInner,
                ]}
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

        <Pressable
          style={{ alignItems: "center" }}
          onPress={() => setOsyaberi(true)}
        >
          <Image
            style={{ width: 250, height: 250 }}
            source={require("../../assets/icon.png")}
          />
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}

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
