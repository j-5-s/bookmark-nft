import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import { Logger } from "@src/common/logger/logger";
import { ChromeStorageLocal } from "./store";

import {
  getActiveTab,
  captureVisibleTab,
  getTabHTML,
  capturePreview,
} from "./utils";
import { uploadToPinata } from "../../common/crypto/pinata/pinata";
import { Settings } from "@src/types";

type SettingsSlice = {
  settings: Settings;
};

const konsole = Logger.getInstance();
reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.css");

const ports = new Map();
const store = new ChromeStorageLocal("state");

const publish = (msg) => {
  konsole.log("publish", msg);
  ports.forEach((port) => {
    port.postMessage(msg);
  });
};

chrome.runtime.onConnect.addListener(function (port) {
  konsole.log("onConnect", port);
  if (port.sender?.tab?.id) {
    ports.set(port.sender?.tab?.id, port);
  } else {
    ports.set(port.name, port);
  }

  port.onDisconnect.addListener(function (port) {
    konsole.log("onDisconnect", port);
    if (port.sender?.tab?.id) {
      ports.delete(port.sender?.tab?.id);
    } else {
      ports.delete(port.name);
    }
  });

  port.onMessage.addListener(function (msg) {
    konsole.log("onMessage", msg);
    if (msg.type === "initialState") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      store.getState().then((state: any) => {
        konsole.log("initialState", msg.initialState, state);
        publish({
          type: msg.type,
          value: {
            [msg.key]:
              typeof msg.initialState === "object"
                ? { ...msg.initialState }
                : msg.initialState,
            ...state,
          },
          key: msg.key,
          ack: true,
        });
      });
    }
    if (msg.type === "updateState") {
      store
        .updateState(msg.key, msg.value[msg.key])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then(({ state }: { state: any }) => {
          publish({
            type: msg.type,
            value: {
              ...state,
            },
            key: msg.key,
            ack: true,
          });
        });
    }
    if (msg.type === "setState") {
      store
        .updateState(msg.key, msg.value)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then(({ state }: { state: any }) => {
          publish({
            type: msg.type,
            value: {
              ...state,
            },
            key: msg.key,
            ack: true,
          });
        });
    }

    if (msg.type === "createNFT") {
      (async () => {
        const { fields } = msg;
        try {
          const tab = await getActiveTab();
          const { dataUrl, height, width } = await captureVisibleTab(tab);
          const {
            metatags,
            text,
            metadata: contentMetadata,
          } = await getTabHTML(tab);
          const ts = new Date().getTime();
          const { settings } = await store.getState<SettingsSlice>();
          const attributes = [
            {
              trait_type: "Title",
              value: tab.title,
            },
            {
              trait_type: "URL",
              value: tab.url,
            },
            {
              trait_type: "Timestamp",
              value: ts,
            },
            {
              trait_type: "Text",
              value: text,
            },
          ];
          Object.keys(metatags).forEach((key) => {
            attributes.push({
              trait_type: key,
              value: metatags[key],
            });
          });

          attributes.push({
            trait_type: "Viewport",
            value: `${tab.width}x${tab.height}`,
          });

          attributes.push({
            trait_type: "Content Size",
            value: `${width}x${height}`,
          });

          attributes.push({
            trait_type: "User Agent",
            value: contentMetadata.userAgent,
          });

          const metadata = {
            attributes,
            description:
              fields?.description ||
              metatags.description ||
              `The copyright verification for ${tab.url}`,
            image: "",
            name: `${fields?.title || tab.title}`,
          };

          try {
            // @todo get api keys from ui
            const { IpfsHash } = await uploadToPinata({
              pinataApiKey: settings.pinataApiKey,
              pinataSecretApiKey: settings.pinataApiSecret,
              base64Image: dataUrl,
            });

            metadata.image = `ipfs://${IpfsHash}`;
            const response = await uploadToPinata({
              pinataApiKey: settings.pinataApiKey,
              pinataSecretApiKey: settings.pinataApiSecret,
              jsonData: JSON.stringify(metadata),
            });
            // https://nft.j5s.dev/mint?ipfsHash=Qmc2fCaDqSBr1jXzDgTZYHQt1VwKh1DrxTgk1W8U1xPodo&contractAddress=0x19d8ed9987102e2fbfe8e0710e1c38a0ed202f64&wallet=wallet-address:ethereum::0x66c2801e144A0BA4d7F6aFF62f535F312aaF609a
            const params = [];
            params.push(`ipfsHash=${response.IpfsHash}`);
            params.push(`contractAddress=${metatags.address || ""}`);
            params.push(`network=${metatags.network || ""}`);
            const queryString = params.join("&");
            const url = `https://nft.j5s.dev/mint?${queryString}`;
            konsole.log(url);
            chrome.tabs.create({
              url,
            });
          } catch (ex) {
            konsole.log(ex);
            throw ex;
          }
        } catch (ex) {
          konsole.log(ex);
          throw ex;
        }
      })();
    }

    if (msg.type === "navigate") {
      chrome.tabs.create({
        url: msg.url,
      });
    }

    if (msg.type === "popupInit") {
      (async () => {
        const tab = await getActiveTab();
        const { metatags } = await getTabHTML(tab);
        const { dataUrl } = await capturePreview();

        const key = "page";
        const value = {
          contractAddress: metatags["address"],
          title: tab.title,
          url: tab.url,
          personalized: {
            title: "",
            description: "",
          },
          network: metatags["network"],
          metatags,
          preview: dataUrl,
        };
        const { state } = await store.updateState(key, value);
        publish({
          type: "setState",
          value: {
            ...state,
          },
          key,
          ack: true,
        });
        konsole.log("state updated and published");
      })();
    }
  });
});
