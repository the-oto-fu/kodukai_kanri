import React, { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { db } from "../db/database";

export default function BudgetScreen() {
  const [income, setIncome] = useState(0);
  const [resetDay, setResetDay] = useState("");
  const [tmpFixedName, setTmpFixedName] = useState("");
  const [tmpFixedPrice, setTmpFixedPrice] = useState(0);

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
      "SELECT INCOME_PRICE FROM INCOME WHERE YEARMONTH = ?",
      [nowYearMonth]
    );
    setIncome(income.INCOME_PRICE);

    // リセット基準日を取得
    const reset_day = db.getFirstSync<any>("SELECT DAY FROM RESET_DAY");
    setResetDay(reset_day.DAY);
  };

  useEffect(() => {
    load();
  }, []);

  const saveIncome = () => {
    db.runSync(
      `INSERT INTO INCOME (YEARMONTH, INCOME_PRICE) VALUES (?, ?)
      ON CONFLICT(YEARMONTH)
      DO UPDATE SET INCOME_PRICE = excluded.INCOME_PRICE
      `,
      [income, resetDay]
    );
  };

  const addFixed = () => {
    db.runSync("INSERT INTO FIXED_COSTS (NAME, PRICE) VALUES (?, ?)", [
      tmpFixedName,
      tmpFixedPrice,
    ]);
    setTmpFixedName("");
    setTmpFixedPrice(0);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>収入</Text>
      <TextInput
        keyboardType="numeric"
        value={income.toString()}
        onChangeText={(text) => {
          const num = Number(text);
          setIncome(num);
        }}
      />

      <Text>リセット日</Text>
      <TextInput value={resetDay} onChangeText={setResetDay} />

      <Button title="保存" onPress={saveIncome} />

      <Text>固定支出</Text>
      <TextInput
        placeholder="名前"
        value={tmpFixedName}
        onChangeText={setTmpFixedName}
      />
      <TextInput
        placeholder="金額"
        value={tmpFixedPrice.toString()}
        onChangeText={(text) => {
          const num = Number(text);
          setTmpFixedPrice(num);
        }}
      />

      <Button title="追加" onPress={addFixed} />
    </View>
  );
}
