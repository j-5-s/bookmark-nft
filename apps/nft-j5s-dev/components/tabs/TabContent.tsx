import React from "react";

type TabContentProps = {
  children: React.ReactNode;
  className?: string;
};
export const TabContent = (props: TabContentProps) => {
  const { children, className } = props;
  return <div className={className}>{children}</div>;
};
