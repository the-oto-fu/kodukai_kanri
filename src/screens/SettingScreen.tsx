import React, { useEffect, useState } from "react";
import { FlatList, Keyboard, Text, View } from "react-native";
import { Button, IconButton, Snackbar, TextInput } from "react-native-paper";
import { db } from "../db/database";

export default function BudgetScreen() {
  const [income, setIncome] = useState<number | undefined>(undefined);
  const [resetDay, setResetDay] = useState<number | undefined>(undefined);
  const [tmpFixedName, setTmpFixedName] = useState("");
  const [tmpFixedPrice, setTmpFixedPrice] = useState<number | undefined>(
    undefined,
  );
  const [fixedCosts, setFixedCosts] = useState<
    { ID: number; NAME: string; PRICE: number }[]
  >([]);
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
      setResetDay(reset_day.DAY);
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

    const income = db.getFirstSync<any>(
      "SELECT INCOME_PRICE FROM INCOME WHERE YEAR_MONTH = ?",
      [yearMonth],
    );
    if (income) {
      setIncome(Number(income.INCOME_PRICE));
    }

    const dbFixedCosts = db.getAllSync<any>(
      "SELECT ID, NAME, PRICE FROM FIXED_COSTS",
    );
    if (dbFixedCosts) {
      console.log(dbFixedCosts);
      setFixedCosts(dbFixedCosts);
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
      // 現在の日付がリセット日を過ぎているか確認
      const reset_day = db.getFirstSync<any>("SELECT DAY FROM RESET_DAY");
      let yearMonth;
      if (reset_day) {
        setResetDay(reset_day.DAY);
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
        `INSERT INTO INCOME (YEAR_MONTH, INCOME_PRICE) VALUES (?, ?)
         ON CONFLICT(YEAR_MONTH)
         DO UPDATE SET INCOME_PRICE = excluded.INCOME_PRICE`,
        [yearMonth, income],
      );
      showSnackbar("収入を保存しました");
    }
  };

  const saveResetDay = () => {
    Keyboard.dismiss();
    if (
      resetDay === undefined ||
      isNaN(resetDay) ||
      resetDay <= 0 ||
      resetDay > 31
    ) {
      showSnackbar("リセット日は1〜31の数字で入力してください");
      return;
    }
    db.runSync("DELETE FROM RESET_DAY;", [resetDay]);
    db.runSync("INSERT INTO RESET_DAY (DAY) VALUES (?)", [resetDay]);
    showSnackbar("リセット日を保存しました");
  };

  const addFixedCosts = () => {
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

  const removeFixedCosts = (id: number) => {
    db.runSync("DELETE FROM FIXED_COSTS WHERE ID=?", [id]);
    load();
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
          value={resetDay !== undefined ? resetDay.toString() : ""}
          onChangeText={(text) => {
            const num = Number(text);
            setResetDay(isNaN(num) ? undefined : num);
          }}
        />
        <Button
          mode="contained"
          disabled={resetDay === undefined}
          style={{ marginTop: 10 }}
          onPress={saveResetDay}
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
          onPress={addFixedCosts}
          disabled={tmpFixedPrice === undefined}
          style={{ marginTop: 10 }}
        >
          追加
        </Button>

        <FlatList
          style={{ height: 170 }}
          data={fixedCosts}
          keyExtractor={(item) => item.ID.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ width: "30%", fontSize: 17 }}>{item.NAME}</Text>
              <Text style={{ width: "60%", fontSize: 17 }}>{item.PRICE}円</Text>
              <IconButton
                style={{ width: "10%" }}
                icon="bomb"
                onPress={() => removeFixedCosts(item.ID)}
                iconColor="#ee1473"
                size={20}
              />
            </View>
          )}
        />
      </View>
    </>
  );
}
