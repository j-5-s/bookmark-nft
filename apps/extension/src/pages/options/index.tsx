import React from "react";
import { createRoot } from "react-dom/client";
import Options from "@pages/options/Options";
import "@pages/options/index.css";
import { MsgProvider, getConnection } from "../../common/msg/MsgProvider";
import refreshOnUpdate from "virtual:reload-on-update-in-view";

refreshOnUpdate("pages/options");
const connection = getConnection("settings");

function init() {
  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }
  const root = createRoot(appContainer);
  root.render(
    <MsgProvider connection={connection}>
      <Options />
    </MsgProvider>
  );
}

document.addEventListener("DOMContentLoaded", init);
