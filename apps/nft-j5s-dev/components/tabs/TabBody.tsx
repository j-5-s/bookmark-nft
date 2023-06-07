import React, { useContext } from "react";
import { TabContext } from "./TabContext";

type TabBodyProps = {
  id: string;
  children: React.ReactNode;
};
export const TabBody = (props: TabBodyProps) => {
  const { children, id } = props;
  const { activeTab } = useContext(TabContext);
  if (activeTab !== id) return null;
  return <>{children}</>;
};
