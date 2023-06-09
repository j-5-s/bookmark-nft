import React from "react";

import { render } from "@testing-library/react";
import Index from "../pages/index";

jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: "",
      asPath: "",
    };
  },
}));

jest.mock("dexie-react-hooks", () => ({
  useLiveQuery: jest.fn(() => []),
}));
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
  RainbowKitProvider: jest.fn(),
  getDefaultWallets: jest.fn(() => ({})),
}));
// @todo tests break because rainbowkit jest issues
describe("Index", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<Index />);
    expect(baseElement).toBeTruthy();
  });
});
