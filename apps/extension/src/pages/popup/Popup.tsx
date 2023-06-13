import React, { useContext, useEffect, useState } from "react";
import { MsgContext } from "../../common/msg/MsgContext";
import type { IMsgContext } from "../../common/msg/MsgContext";
import { usePersistedState } from "../../common/msg/usePersistedState";
import { PageAttributes } from "@src/types";
import { Settings } from "@src/types";

const optionsURI = chrome.runtime.getURL("src/pages/options/index.html");

const Popup: React.FC = () => {
  const { value } = usePersistedState<PageAttributes>(
    "page",
    {} as PageAttributes
  );

  const [fields, setFields] = useState({
    title: value?.personalized?.title || value?.title,
    description:
      value?.personalized?.description || value?.metatags?.description,
  });

  useEffect(() => {
    if (value?.metatags?.description || value?.metatags?.title) {
      setFields((prev) => ({
        ...prev,
        description: value?.metatags?.description,
        title: value?.title,
      }));
    }
  }, [value?.metatags?.description, value?.title]);

  const handleChange = (field: string) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [field]: e.target.value }));
    };
  };

  const { value: settings } = usePersistedState<Settings>(
    "settings",
    {} as Settings
  );

  const msgContext = useContext<IMsgContext>(MsgContext);

  const handleClickCreateNFT = () => {
    msgContext.connection.postMessage({ type: "createNFT", fields });
  };

  useEffect(() => {
    msgContext.connection.postMessage({ type: "popupInit" });
  }, [msgContext.connection]);

  const shortAddress =
    value?.contractAddress?.substring(0, 8) +
    "..." +
    value?.contractAddress?.substring(value?.contractAddress?.length - 4);

  const contractLink = `https://nft.j5s.dev/address/${value?.contractAddress}?network=${value?.network}`;

  const hasPinata = settings?.pinataApiKey && settings?.pinataApiSecret;

  return (
    <div className="App">
      <div className="flex flex-col h-screen">
        <div className="border flex-1 flex flex-col">
          <div className="p-4 text-xs flex-1">
            <div className="flex border-t border-b border-gray-200 py-2">
              <span className="text-gray-500">Contract Address</span>
              <span className="ml-auto text-gray-900">
                {value?.contractAddress ? (
                  <a
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                    href={contractLink}
                  >
                    {shortAddress}
                  </a>
                ) : (
                  "none"
                )}
              </span>
            </div>
            <div className="flex border-b border-gray-200 py-2">
              <span className="text-gray-500">Network</span>
              <span className="ml-auto text-gray-900">
                {value?.network || "none"}
              </span>
            </div>
            <div className="flex border-b border-gray-200 py-2">
              <span className="text-gray-500 w-12">Title</span>
              <span className="flex-1 ml-2 text-gray-900 max-w-xs  overflow-scroll">
                <input
                  type="text"
                  className="border p-2 w-full text-right"
                  value={fields.title}
                  onChange={handleChange("title")}
                />
              </span>
            </div>
            <div className="flex border-b border-gray-200 py-2">
              <span className="text-gray-500 w-12">Desc</span>
              <span className="flex-1 ml-2 text-gray-900 max-w-xs overflow-scroll ">
                <input
                  type="text"
                  className="border p-2 w-full text-right"
                  value={fields.description}
                  onChange={handleChange("description")}
                />
              </span>
            </div>

            <div>
              <img src={value?.preview} />
            </div>
          </div>

          {!hasPinata && (
            <div className="bg-gray-100 p-4 items-center flex border-t-1 border-t ">
              <div className="p-4">
                Pinata API keys not found! Please update the{" "}
                <a
                  href={optionsURI}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  settings
                </a>{" "}
                with their values
              </div>
            </div>
          )}
        </div>
        <div className="border-t-1 p-4">
          <button
            disabled={!hasPinata}
            onClick={handleClickCreateNFT}
            className="bg-blue-500 hover:bg-blue-700 text-white disabled:opacity-50 disabled:hover:bg-blue-500 font-bold py-2 px-4 rounded w-full"
          >
            Create NFT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
