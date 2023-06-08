import React, { ChangeEvent } from "react";
import "./Options.css";
import { usePersistedState } from "../../common/msg/usePersistedState";
import type { Settings } from "@src/types";

const Options: React.FC = () => {
  const { value, actions } = usePersistedState<Settings>("settings", {
    pinataApiKey: "",
    pinataApiSecret: "",
  });

  const handleChange = (key: string) => {
    return (evt: ChangeEvent<HTMLInputElement>) => {
      actions.updateState(key, evt.target.value);
    };
  };

  return (
    <section className="text-gray-600 body-font">
      <div className="container mx-auto flex px-5 py-24 flex-col ">
        <div className=" flex flex-col mb-16">
          <div className="flex flex-col text-center w-full">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
              Settings{" "}
            </h1>
          </div>
          <div className="flex flex-col w-full">
            <h2 className="text-xs text-indigo-500 tracking-widest font-medium title-font mb-1">
              Pinata
            </h2>
          </div>
          <div className="w-full border-t border-gray-200">
            <div className="relative mb-4 mt-4">
              <label
                htmlFor="pinataApiKey"
                className="leading-7 text-sm text-gray-600"
              >
                Pinata API Key
              </label>
              <input
                value={value?.pinataApiKey}
                onChange={handleChange("pinataApiKey")}
                type="text"
                id="pinataApiKey"
                name="pinataApiKey"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <div className="relative mb-4">
              <label
                htmlFor="pinataApiSecret"
                className="leading-7 text-sm text-gray-600"
              >
                Pinata API Secret
              </label>
              <input
                type="text"
                onChange={handleChange("pinataApiSecret")}
                id="pinataApiSecret"
                name="pinataApiSecret"
                value={value?.pinataApiSecret}
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <p className="mb-8 leading-relaxed">
              The API Key and secret are not shared and stored in the the
              browsers localStorage. They are used to upload NFT metadata to
              IPFS through the pinata pinning service.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Options;
