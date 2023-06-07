import React, { useContext } from "react";
import cs from "classnames";
import { TabContext } from "./TabContext";

type TabProps = {
  id: string;
  children: React.ReactNode;
};
export const Tab = (props: TabProps) => {
  const { children, id } = props;
  const { setActiveTab, activeTab } = useContext(TabContext);
  return (
    <button
      type="button"
      onClick={() => setActiveTab?.(id)}
      className={cs(
        " text-indigo-500 border-b-2 py-2 text-base px-4 pl-2 border-gray-200 cursor-pointer",
        {
          "border-indigo-500 ": activeTab === id,
        }
      )}
    >
      {children}
    </button>
  );
};
