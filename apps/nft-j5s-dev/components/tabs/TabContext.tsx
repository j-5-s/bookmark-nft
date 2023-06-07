import { createContext } from "react";
type TabsType = {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
};
export const TabContext = createContext({
  activeTab: "",
} as TabsType);
