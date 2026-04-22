import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Appbar,
  MD3LightTheme,
  Provider as PaperProvider,
  Snackbar,
} from "react-native-paper";
import { initDB } from "./src/db/database";
import HistoryScreen from "./src/screens/HistoryScreen";
import BudgetScreen from "./src/screens/SettingScreen";
import TopScreen from "./src/screens/TopScreen";
import { useSnackbarStore } from "./src/stores/snackbarStore";

export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<"top" | "setting" | "history">("top");

  const {
    snackbarVisible,
    snackbarMessage,
    snackbarBackGroundColor,
    snackbarTextColor,
    snackbarIcon,
    hideSnackbar,
  } = useSnackbarStore();

  useEffect(() => {
    initDB();

    /*
    // デバッグ用SQL
    const table = db.runSync("DELETE FROM INCOME;");
    if (table) {
      console.log(table);
    } else {
      console.log("テーブルが存在しません");
    }
    */

    setReady(true);
  }, []);

  return ready ? (
    <PaperProvider theme={MD3LightTheme}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {/* ヘッダー */}
        <Appbar.Header>
          <Appbar.Content title="お小遣い管理" />
          <Appbar.Action icon="home" onPress={() => setScreen("top")} />
          <Appbar.Action icon="cog" onPress={() => setScreen("setting")} />
          <Appbar.Action icon="history" onPress={() => setScreen("history")} />
        </Appbar.Header>

        {/* 画面 */}
        <View style={{ flex: 1 }}>
          {screen === "top" && <TopScreen />}
          {screen === "setting" && <BudgetScreen />}
          {screen === "history" && <HistoryScreen />}

          <Snackbar
            wrapperStyle={{ top: 1 }}
            visible={snackbarVisible}
            icon={snackbarIcon}
            onIconPress={() => hideSnackbar()}
            onDismiss={() => hideSnackbar()}
            duration={3000}
            theme={{
              colors: {
                inverseSurface: snackbarBackGroundColor,
                inverseOnSurface: snackbarTextColor,
              },
            }}
          >
            {snackbarMessage}
          </Snackbar>
        </View>
      </View>
    </PaperProvider>
  ) : null;
}
