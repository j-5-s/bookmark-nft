import { useEffect, useState } from "react";
import UserAgentParser from "ua-parser-js";

type UserAgentProps = {
  userAgent: string;
};

export const UserAgent = (props: UserAgentProps) => {
  const { userAgent } = props;
  const [userAgentParsed, setUserAgentParsed] =
    useState<UserAgentParser.IResult | null>(null);
  useEffect(() => {
    const result = new UserAgentParser(userAgent);
    setUserAgentParsed(result.getResult());
  }, [userAgent]);

  return (
    <span>
      {userAgentParsed?.browser?.name} {userAgentParsed?.browser?.version}
    </span>
  );
};
