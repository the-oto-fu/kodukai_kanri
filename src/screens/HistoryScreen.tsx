import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Button, IconButton } from "react-native-paper";
import { db } from "../db/database";
import { useYearMonth } from "../hooks/useYearMonth";

export default function HistoryScreen() {
  const [payments, setPayments] = useState<any[]>([]);

  const { getTargetYearMonth } = useYearMonth();

  const load = () => {
    const payments = db.getAllSync<any>(
      "SELECT * FROM PAYMENTS WHERE YEAR_MONTH = ?",
      [getTargetYearMonth()],
    );
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
        [e.YEAR_MONTH, e.NAME, e.PRICE],
      );
    });
    // 要トランザクション化ここまで

    load();
  };

  function Divider() {
    return <View style={{ borderBottomWidth: 1, borderColor: "gray" }} />;
  }

  return (
    <>
      <View style={{ padding: 20 }}>
        <FlatList
          data={payments}
          //一意となるkeyをidで管理
          keyExtractor={(item) => item.ID}
          ItemSeparatorComponent={Divider}
          //レンダリングされるViewを定義
          renderItem={({ item }) => {
            return (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ width: "30%", fontSize: 25 }}>
                  {item.PRICE}円
                </Text>
                <Text style={{ width: "60%", fontSize: 20 }}>{item.NAME}</Text>
                <IconButton
                  style={{ width: "10%" }}
                  icon="bomb"
                  onPress={() => remove(item.ID)}
                  iconColor="#ee1473"
                  size={30}
                />
              </View>
            );
          }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          paddingVertical: 20,
          position: "absolute",
          bottom: 20,
          width: "100%",
        }}
      >
        <Button
          mode="contained"
          onPress={importFile}
          icon="import"
          style={{ width: 150, marginRight: 10 }}
        >
          インポート
        </Button>
        <Button
          mode="contained"
          onPress={exportFile}
          icon="export"
          style={{ width: 150 }}
        >
          エクスポート
        </Button>
      </View>
    </>
  );
}
