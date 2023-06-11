export const getActiveTab = (): Promise<chrome.tabs.Tab> =>
  new Promise((resolve) => {
    chrome.windows.getLastFocused(
      { windowTypes: ["normal"] },
      function (window) {
        chrome.tabs.query(
          { active: true, windowId: window.id },
          function (tabs) {
            const activeTab = tabs[0];
            resolve(activeTab);
          }
        );
      }
    );
  });

type MessageListener = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: any,
  sender: chrome.runtime.MessageSender,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendResponse: (response?: any) => void
) => void;
type Resolver = (screenshot: string) => void;

/**
 * Returns a listener that will resolve the promise when the screenshot is received
 * It should be run from the background script to listen to messages from the content script
 */
const getListener = (format = "jpeg", resolve: Resolver) => {
  const screenshotListener: MessageListener = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: any,
    sender,
    sendResponse
  ) => {
    if (request.action === "CAPTURE_VISIBLE_TAB") {
      // Capture the screenshot and send it back to the content script
      // this timeout is used because sometimes the screenshot is blank
      // and it starts taking them really fast then chrome throws errors
      // for too many screenshots in a short period of time
      setTimeout(() => {
        if (sender?.tab.windowId) {
          chrome.tabs.captureVisibleTab(
            sender.tab.windowId,
            { format },
            (dataUrl) => {
              sendResponse({ dataUrl: dataUrl });
            }
          );
        }
      }, 1000);

      return true; // Indicates that the response will be sent asynchronously
    } else if (request.action === "SCREENSHOTS_FINISHED") {
      // Handle the screenshots data received from content script
      resolve(request.img);
      // Send a message back to the content script
    }
  };
  return screenshotListener;
};

export const capturePreview = (format = "jpeg"): Promise<string> =>
  new Promise((resolve) => {
    chrome.tabs.captureVisibleTab(null, { format }, (dataUrl) => {
      resolve(dataUrl);
    });
  });

export const captureVisibleTab = (
  tab: chrome.tabs.Tab,
  format = "jpeg"
): Promise<string> =>
  new Promise((resolve) => {
    const listener = getListener(format, resolve);
    chrome.runtime.onMessage.removeListener(listener);
    chrome.runtime.onMessage.addListener(listener);
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: "CAPTURE_SCREENSHOTS" });
    }
  });

type HTMLData = {
  metatags: {
    [key: string]: string | undefined;
  };
  metadata: {
    viewport: {
      height: number;
      width: number;
    };
    userAgent: string;
  };
  html: string;
  text: string;
};
export const getTabHTML = async (tab: chrome.tabs.Tab): Promise<HTMLData> => {
  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      /**
       * If Tag is an array it will return the first matching Tag.
       * All function / js must be inside the above callback.
       */
      type Tag = {
        name: string;
        attrName?: string;
        content: string;
      };
      type GetMetaTags = (Tag | Tag[])[];
      const getMetaTags = (tags: GetMetaTags) => {
        const ret = tags
          .map((tag) => {
            if (!Array.isArray(tag)) {
              const networkMetatag = document.documentElement.querySelector(
                `meta[${tag.attrName || "name"}="${tag.content}"]`
              );
              const content = networkMetatag?.getAttribute("content");
              return { content, name: tag.name };
            } else if (Array.isArray(tag)) {
              const match = tag.find((_tag) => {
                const networkMetatag = document.documentElement.querySelector(
                  `meta[${_tag.attrName || "name"}="${_tag.content}"]`
                );
                return !!networkMetatag;
              });
              if (match) {
                const networkMetatag = document.documentElement.querySelector(
                  `meta[${match.attrName || "name"}="${match.content}"]`
                );

                const content = networkMetatag?.getAttribute("content");
                // default the value to always be the first key so its deterministic
                return { content, name: tag[0].name };
              }
            }
          })
          .filter((tag) => tag?.content);
        return ret.reduce((acc, cur) => {
          return {
            ...acc,
            [cur.name as string]: cur.content,
          };
        }, {});
      };
      const metatags = getMetaTags([
        { name: "address", content: "content-nft-address" },
        [
          { name: "network", content: "nft_contract_network" },
          { name: "network", content: "nft-contract-network" },
        ],
        { name: "keywords", content: "keywords" },
        [
          { name: "description", content: "description" },
          { name: "description", content: "Description" },
        ],
        { name: "og:image", attrName: "property", content: "og:image" },
        { name: "twitter:site", content: "twitter:site" },
        { name: "author", content: "author" },
      ]);

      const height = window.innerHeight;
      const width = window.innerWidth;
      const metadata = {
        viewport: {
          height,
          width,
        },
        userAgent: navigator.userAgent,
      };

      return {
        metatags,
        metadata,
        html: document.documentElement.outerHTML,
        text: document.documentElement.outerText,
      };
    },
  });
  return result[0].result as HTMLData;
};
