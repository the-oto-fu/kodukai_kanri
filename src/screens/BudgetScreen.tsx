import React, { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { db } from "../db/database";

export default function BudgetScreen() {
  const [income, setIncome] = useState<number | undefined>(undefined);
  const [resetDay, setResetDay] = useState("");
  const [tmpFixedName, setTmpFixedName] = useState("");
  const [tmpFixedPrice, setTmpFixedPrice] = useState<number | undefined>(
    undefined
  );

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
    if (income) {
      setIncome(income.INCOME_PRICE);
    }

    // リセット基準日を取得
    const reset_day = db.getFirstSync<any>("SELECT DAY FROM RESET_DAY");
    if (reset_day) {
      setResetDay(reset_day.DAY);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveIncome = () => {
    if (income !== undefined) {
      db.runSync(
        `INSERT INTO INCOME (YEAR_MONTH, INCOME_PRICE) VALUES (?, ?)
      ON CONFLICT(YEAR_MONTH)
      DO UPDATE SET INCOME_PRICE = excluded.INCOME_PRICE
      `,
        [getNowYearMonth(), income]
      );
    }
  };

  const addFixed = () => {
    if (tmpFixedPrice) {
      db.runSync("INSERT INTO FIXED_COSTS (NAME, PRICE) VALUES (?, ?)", [
        tmpFixedName,
        tmpFixedPrice,
      ]);
      setTmpFixedName("");
      setTmpFixedPrice(0);
    }
  };

  return (
    <>
      <View style={{ padding: 20 }}>
        <Text>今月の収入</Text>
        <TextInput
          keyboardType="numeric"
          value={income !== undefined ? income.toString() : ""}
          placeholder={income === undefined ? "収入が設定されていません" : ""}
          onChangeText={(text) => {
            const num = Number(text);
            setIncome(num);
          }}
        />
        <Button title="保存" onPress={saveIncome} />
      </View>
      <View style={{ padding: 20 }}>
        <Text>リセット日</Text>
        <TextInput
          keyboardType="numeric"
          value={resetDay}
          onChangeText={setResetDay}
          placeholder={"リセット日を入力してください"}
        />

        <Button title="保存" />
      </View>

      <View style={{ padding: 20 }}>
        <Text>固定支出</Text>
        <TextInput
          placeholder="名前"
          value={tmpFixedName}
          onChangeText={setTmpFixedName}
        />
        <TextInput
          placeholder="金額"
          value={tmpFixedPrice !== undefined ? tmpFixedPrice.toString() : ""}
          onChangeText={(text) => {
            const num = Number(text);
            setTmpFixedPrice(num);
          }}
        />

        <Button title="追加" onPress={addFixed} />
      </View>
    </>
  );
}
