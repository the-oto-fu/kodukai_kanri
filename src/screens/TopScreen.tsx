import React, { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
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

  const load = () => {
    const nowYearMonth = getNowYearMonth();
    // 現在日時に対応する収入を取得
    const income = db.getFirstSync<any>(
      "SELECT INCOME_PRICE FROM INCOME WHERE YEAR_MONTH = ?",
      [nowYearMonth]
    );
    const incomePrice = income ? income.INCOME_PRICE : 0;

    // 固定費の合計を取得
    // 要修正 PRICEカラムがないというエラー
    const fixedCosts = db.getAllSync<any>("SELECT PRICE FROM FIXED_COSTS");
    const totalCosts = fixedCosts.reduce((sum, f) => sum + f.PRICE, 0);

    // 現在日時に対応する支出の合計を取得
    const payments = db.getAllSync<any>("SELECT PRICE FROM PAYMENTS");
    const totalPayments = payments.reduce((sum, e) => sum + e.PRICE, 0);

    setBudget(incomePrice - totalCosts - totalPayments);
  };

  useEffect(() => {
    load();
  }, []);

  const addPayment = () => {
    const nowYearMonth = getNowYearMonth();
    db.runSync(
      "INSERT INTO PAYMENTS (YEAR_MONTH, NAME, PRICE) VALUES (?, ?, ?)",
      [nowYearMonth, tmpName, Number(tmpPayment)]
    );
    setTmpPayment("");
    setTmpName("");
    load();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>残高: {budget} 円</Text>

      <TextInput
        placeholder="使用金額"
        keyboardType="numeric"
        value={tmpPayment}
        onChangeText={setTmpPayment}
      />

      <TextInput
        placeholder="何に使ったか"
        value={tmpName}
        onChangeText={setTmpName}
      />

      <Button title="追加" onPress={addPayment} />

      {budget === 0 && <Text>予算が設定されていません</Text>}
    </View>
  );
}
