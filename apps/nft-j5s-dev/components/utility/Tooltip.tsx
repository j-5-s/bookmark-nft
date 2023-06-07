import { ReactNode } from "react";
import cs from "classnames";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

export const Tooltip = (props: Props) => {
  const { title, children, className } = props;
  return (
    <div className={cs("group flex relative", className)}>
      {children}
      <span
        className="group-hover:opacity-100 transition-opacity bg-gray-800 px-1 text-sm text-gray-100 rounded-md absolute left-1/2 
    -translate-x-1/2 translate-y-full opacity-0 m-4 mx-auto whitespace-nowrap"
      >
        {title}
      </span>
    </div>
  );
};
