import React from "react";

type TabHeaderProps = {
  children: React.ReactNode;
  actions?: () => React.ReactNode;
};
export const TabHeader = (props: TabHeaderProps) => {
  const { children, actions } = props;
  return (
    <div className="flex mb-4">
      {children}
      <div className="flex-1 border-b-2 border-gray-200 flex justify-end p-2 pr-4">
        {actions && actions()}
      </div>
    </div>
  );
};
