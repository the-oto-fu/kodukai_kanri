import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { db } from "../db/database";

export default function TopScreen() {
  const [budget, setBudget] = useState(0);
  const [tmpPayment, setTmpPayment] = useState("");
  const [tmpName, setTmpName] = useState("");

  // 現在日時に対応する年月をYYYY-MMの形で取得
  // 要hook化
  const getNowYearMonth = () => {
    const now = new Date();
    return now
      .toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
      })
      .replace("/", "-");
  };

  const getNextYearMonth = () => {
    const now = new Date();
    // 来月の日付を取得
    now.setMonth(now.getMonth() + 1);

    return now
      .toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
      })
      .replace("/", "-");
  };

  const load = () => {
    // 現在の日付がリセット日を過ぎているか確認
    const reset_day = db.getFirstSync<any>("SELECT DAY FROM RESET_DAY");
    let yearMonth;
    if (reset_day) {
      const date = new Date();
      const today = date.getDate();
      const resetDay = Number(reset_day.DAY);
      if (today >= resetDay) {
        // リセット日を過ぎている場合、取得するのは来月の年月
        yearMonth = getNextYearMonth();
      } else {
        // リセット日を過ぎていない場合、取得するのは今月の年月
        yearMonth = getNowYearMonth();
      }
    } else {
      yearMonth = getNowYearMonth();
    }

    // 現日時に対応する収入を取得
    const income = db.getFirstSync<any>(
      "SELECT INCOME_PRICE FROM INCOME WHERE YEAR_MONTH = ?",
      [yearMonth]
    );
    const incomePrice = income ? income.INCOME_PRICE : 0;

    // 固定費の合計を取得
    const fixedCosts = db.getAllSync<any>("SELECT PRICE FROM FIXED_COSTS");
    const totalCosts = fixedCosts.reduce((sum, f) => sum + f.PRICE, 0);

    // 現在日時に対応する支出の合計を取得
    const payments = db.getAllSync<any>(
      "SELECT PRICE FROM PAYMENTS WHERE YEAR_MONTH = ?",
      [yearMonth]
    );
    const totalPayments = payments.reduce((sum, e) => sum + e.PRICE, 0);

    setBudget(incomePrice - totalCosts - totalPayments);
  };

  useEffect(() => {
    load();
  }, []);

  const addPayment = () => {
    // 現在の日付がリセット日を過ぎているか確認
    const reset_day = db.getFirstSync<any>("SELECT DAY FROM RESET_DAY");
    let yearMonth;
    if (reset_day) {
      const date = new Date();
      const today = date.getDate();
      const resetDay = Number(reset_day.DAY);
      if (today >= resetDay) {
        // リセット日を過ぎている場合、取得するのは来月の年月
        yearMonth = getNextYearMonth();
      } else {
        // リセット日を過ぎていない場合、取得するのは今月の年月
        yearMonth = getNowYearMonth();
      }
    } else {
      yearMonth = getNowYearMonth();
    }
    db.runSync(
      "INSERT INTO PAYMENTS (YEAR_MONTH, NAME, PRICE) VALUES (?, ?, ?)",
      [yearMonth, tmpName, Number(tmpPayment)]
    );
    setTmpPayment("");
    setTmpName("");
    load();
  };

  return (
    <>
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

        {budget === 0 && <Text>予算が設定されていません</Text>}
      </View>
    </>
  );
}
