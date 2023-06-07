import React, { useContext, useState } from "react";
import { TabContext } from "./TabContext";
/*
<Tabs>
  <TabHeader>
    <Tab id="tab-1">Tab 1</Tab>
    <Tab id="tab-2">Tab 1</Tab>
  </TabHeader>
  <TabContent>
    <TabBody id="tab-1">Foo</TabBody>
  </TabContent>
</Tabs>
*/
type TabProps = {
  children: React.ReactNode;
  className?: string;
  defaultTab: string;
};
export const Tabs = (props: TabProps) => {
  const { children, className, defaultTab } = props;
  const [activeTab, setActiveTab] = useState(defaultTab);
  const contextValue = {
    activeTab,
    setActiveTab,
  };
  return (
    <TabContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabContext.Provider>
  );
};
