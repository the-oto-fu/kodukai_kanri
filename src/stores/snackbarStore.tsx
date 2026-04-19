import { create } from "zustand";

const snackbarDetail = {
  success: {
    color: "green",
    icon: "check-circle-outline",
  },
  error: {
    color: "red",
    icon: "alert-circle-outline",
  },
};

type SnackbarState = {
  snackbarVisible: boolean;
  snackbarMessage: string;
  snackbarColor: string;
  snackbarIcon: string;
  showSnackbar: (message: string, type: "success" | "error") => void;
  hideSnackbar: () => void;
};

export const useSnackbarStore = create<SnackbarState>((set) => ({
  snackbarVisible: false,
  snackbarMessage: "",
  snackbarColor: "",
  snackbarIcon: "",
  showSnackbar: (message, type) =>
    set({
      snackbarVisible: true,
      snackbarMessage: message,
      snackbarColor: snackbarDetail[type].color,
      snackbarIcon: snackbarDetail[type].icon,
    }),
  hideSnackbar: () =>
    set({
      snackbarVisible: false,
      snackbarMessage: "",
      snackbarColor: "",
      snackbarIcon: "",
    }),
}));
