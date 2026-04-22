import { create } from "zustand";

const snackbarDetail = {
  success: {
    backgroundColor: "green",
    textColor: "white",
    icon: "check-circle-outline",
  },
  warn: {
    backgroundColor: "yellow",
    textColor: "black",
    icon: "alert-circle-outline",
  },
  error: {
    backgroundColor: "red",
    textColor: "white",
    icon: "alert-circle-outline",
  },
};

type SnackbarState = {
  snackbarVisible: boolean;
  snackbarMessage: string;
  snackbarBackGroundColor: string | undefined;
  snackbarTextColor: string | undefined;
  snackbarIcon: string;
  showSnackbar: (message: string, type: "success" | "warn" | "error") => void;
  hideSnackbar: () => void;
};

export const useSnackbarStore = create<SnackbarState>((set) => ({
  snackbarVisible: false,
  snackbarMessage: "",
  snackbarBackGroundColor: "",
  snackbarTextColor: "",
  snackbarIcon: "",
  showSnackbar: (message, type) =>
    set({
      snackbarVisible: true,
      snackbarMessage: message,
      snackbarBackGroundColor: snackbarDetail[type].backgroundColor,
      snackbarTextColor: snackbarDetail[type].textColor,
      snackbarIcon: snackbarDetail[type].icon,
    }),
  hideSnackbar: () =>
    set({
      snackbarVisible: false,
      snackbarMessage: "",
      snackbarBackGroundColor: undefined,
      snackbarTextColor: undefined,
      snackbarIcon: "",
    }),
}));
