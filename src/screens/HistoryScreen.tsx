import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
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
      "SELECT * FROM PAYMENTS WHERE YEAR_MONTH = ? ORDER BY CREATED_AT DESC",
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
    try {
      const file = new File(Paths.cache, "kodukai_export.json");
      // 1. 既存ファイル削除（あれば）
      if (file.info().exists) {
        file.delete();
      }

      // 2. ファイル書き込み
      file.write(JSON.stringify(payments));

      // 3. 共有可能かチェック（iOS対策）
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        throw new Error("Sharing is not available on this platform");
      }

      // 4. 共有
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        dialogTitle: "履歴データを共有",
      });
    } catch (e) {
      console.error("share failed:", e);
    }
  };

  const importFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        const { uri } = result.assets[0];
        const file = new File(uri);
        const content = file.textSync();
        const json = JSON.parse(content);

        // 要トランザクション化
        db.runSync("DELETE FROM PAYMENTS");

        json.forEach((e: any) => {
          db.runSync(
            "INSERT INTO PAYMENTS (YEAR_MONTH, NAME, PRICE, CREATED_AT) VALUES (?, ?, ?, ?)",
            [e.YEAR_MONTH, e.NAME, e.PRICE, e.CREATED_AT],
          );
        });
        // 要トランザクション化ここまで

        load();
      }
    } catch (error) {
      console.error(error);
    }
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
