import { create } from "zustand";

interface GlobalStore {
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
}

const useGlobalStore = create<GlobalStore>()((set) => ({
  currentTheme: "dark",
  setCurrentTheme: (theme: string) => set({ currentTheme: theme }),
}));

export default useGlobalStore;

export const useThemeStore = () => {
  const { currentTheme, setCurrentTheme } = useGlobalStore();
  return { currentTheme, setCurrentTheme };
};
