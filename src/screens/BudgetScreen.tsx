import React, { useEffect, useState } from "react";
import { Keyboard, Text, View } from "react-native";
import { Button, Snackbar, TextInput } from "react-native-paper";
import { db } from "../db/database";

export default function BudgetScreen() {
  const [income, setIncome] = useState<number | undefined>(undefined);
  const [resetDay, setResetDay] = useState("");
  const [tmpFixedName, setTmpFixedName] = useState("");
  const [tmpFixedPrice, setTmpFixedPrice] = useState<number | undefined>(
    undefined
  );
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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

    const income = db.getFirstSync<any>(
      "SELECT INCOME_PRICE FROM INCOME WHERE YEAR_MONTH = ?",
      [nowYearMonth]
    );
    if (income) {
      setIncome(Number(income.INCOME_PRICE));
    }

    const reset_day = db.getFirstSync<any>("SELECT DAY FROM RESET_DAY");
    if (reset_day) {
      setResetDay(String(reset_day.DAY));
    }
  };

  useEffect(() => {
    load();
  }, []);

  // 👇 Snackbar表示ヘルパー
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const saveIncome = () => {
    Keyboard.dismiss();
    if (income !== undefined) {
      db.runSync(
        `INSERT INTO INCOME (YEAR_MONTH, INCOME_PRICE) VALUES (?, ?)
         ON CONFLICT(YEAR_MONTH)
         DO UPDATE SET INCOME_PRICE = excluded.INCOME_PRICE`,
        [getNowYearMonth(), income]
      );
      showSnackbar("収入を保存しました");
    }
  };

  const addFixed = () => {
    if (tmpFixedPrice !== undefined && tmpFixedName !== "") {
      db.runSync("INSERT INTO FIXED_COSTS (NAME, PRICE) VALUES (?, ?)", [
        tmpFixedName,
        tmpFixedPrice,
      ]);
      setTmpFixedName("");
      setTmpFixedPrice(undefined);

      showSnackbar("固定支出を追加しました");
    }
  };

  return (
    <>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>

      <View style={{ padding: 20 }}>
        <Text>今月の収入</Text>
        <TextInput
          mode="outlined"
          label="金額"
          keyboardType="numeric"
          value={income !== undefined ? income.toString() : ""}
          onChangeText={(text) => {
            if (text === "") {
              setIncome(undefined);
              return;
            }
            const num = Number(text);
            setIncome(isNaN(num) ? undefined : num);
          }}
        />
        <Button
          mode="contained"
          onPress={saveIncome}
          disabled={income === undefined}
          style={{ marginTop: 10 }}
        >
          保存
        </Button>
      </View>

      <View style={{ padding: 20 }}>
        <Text>リセット日</Text>
        <TextInput
          mode="outlined"
          label="リセット日"
          keyboardType="numeric"
          value={resetDay}
          onChangeText={setResetDay}
        />
        <Button
          mode="contained"
          disabled={resetDay === ""}
          style={{ marginTop: 10 }}
        >
          保存
        </Button>
      </View>

      <View style={{ padding: 20 }}>
        <Text>固定支出</Text>
        <TextInput
          mode="outlined"
          label="名前"
          value={tmpFixedName}
          onChangeText={setTmpFixedName}
        />
        <TextInput
          mode="outlined"
          label="金額"
          keyboardType="numeric"
          value={tmpFixedPrice !== undefined ? tmpFixedPrice.toString() : ""}
          onChangeText={(text) => {
            if (text === "") {
              setTmpFixedPrice(undefined);
              return;
            }
            const num = Number(text);
            setTmpFixedPrice(isNaN(num) ? undefined : num);
          }}
          style={{ marginTop: 10 }}
        />
        <Button
          mode="contained"
          onPress={addFixed}
          disabled={tmpFixedPrice === undefined}
          style={{ marginTop: 10 }}
        >
          追加
        </Button>
      </View>
    </>
  );
}
