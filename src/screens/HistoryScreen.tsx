import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";
import { db } from "../db/database";

export default function HistoryScreen() {
  const [payments, setPayments] = useState<any[]>([]);

  const load = () => {
    const payments = db.getAllSync<any>("SELECT * FROM PAYMENTS");
    setPayments(payments);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = (id: number) => {
    db.runSync("DELETE FROM PAYMENTS WHERE ID=?", [id]);
    load();
  };

  const exportFile = async () => {
    const fileUri = FileSystem.Paths.document + "expenses.json";
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payments));
    await Sharing.shareAsync(fileUri);
  };

  const importFile = async () => {
    const fileUri = FileSystem.Paths.document + "expenses.json";
    const content = await FileSystem.readAsStringAsync(fileUri);
    const json = JSON.parse(content);

    // 要トランザクション化
    db.runSync("DELETE FROM PAYMENTS");

    json.forEach((e: any) => {
      db.runSync(
        "INSERT INTO PAYMENTS (YEAR_MONTH, NAME, PRICE) VALUES (?, ?, ?)",
        [e.YEAR_MONTH, e.NAME, e.PRICE]
      );
    });
    // 要トランザクション化ここまで

    load();
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="エクスポート" onPress={exportFile} />
      <Button title="インポート" onPress={importFile} />

      <ScrollView>
        {
          // 要FlatList化
          payments.map((item) => (
            <View key={item.ID}>
              <Text>{item.amount}円</Text>
              <Button title="削除" onPress={() => remove(item.ID)} />
            </View>
          ))
        }
      </ScrollView>
    </View>
  );
}
