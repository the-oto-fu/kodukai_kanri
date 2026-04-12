import { db } from "../db/database";

export const useYearMonth = () => {
  // 日付をYYYY-MM形式の文字列に変換する関数
  const convertStringYYhyphenMM = (date: Date) => {
    return date
      .toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
      })
      .replace("/", "-");
  };

  const workDate = new Date();
  const workDay = workDate.getDate();

  // 今月に対応するYYYY-MMの形の文字列
  const nowYearMonth = convertStringYYhyphenMM(workDate);

  workDate.setMonth(workDate.getMonth() + 1);
  // 来月に対応するYYYY-MMの形の文字列
  const nextYearMonth = convertStringYYhyphenMM(workDate);

  // 現在の日付がリセット日を過ぎているか確認し、過ぎていなければ当月、過ぎていれば来月のYYYY-MM形式の年月を返す
  // リセット日が設定されていない場合は当月を返す
  const getTargetYearMonth = () => {
    const reset_day = db.getFirstSync<any>("SELECT DAY FROM RESET_DAY");

    if (reset_day) {
      const resetDay = Number(reset_day.DAY);
      if (workDay >= resetDay) {
        // リセット日を過ぎている場合、取得するのは来月の年月
        return nextYearMonth;
      } else {
        // リセット日を過ぎていない場合、取得するのは今月の年月
        return nowYearMonth;
      }
    } else {
      return nowYearMonth;
    }
  };

  return { nowYearMonth, nextYearMonth, getTargetYearMonth };
};
