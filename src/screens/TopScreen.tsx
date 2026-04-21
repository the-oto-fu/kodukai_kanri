import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import OsyaberiFukidashi from "../components/OsyaberiFukidashi";
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

        <OsyaberiFukidashi osyaberi={osyaberi} />

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
