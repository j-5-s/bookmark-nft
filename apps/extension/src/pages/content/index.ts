// /**
//  * @description
//  * Chrome extensions don't support modules in content scripts.
//  */
// import("./components/Demo");

import { stitchScreenshots } from "../../common/canvas/stitchScreenshots";
let potentiallyStickyElems = [];

const hideElements = () => {
  potentiallyStickyElems = Array.from(document.querySelectorAll("body *"));
  potentiallyStickyElems.forEach((elem) => {
    const computedStyle = getComputedStyle(elem);
    if (
      computedStyle.position === "fixed" ||
      computedStyle.position === "sticky"
    ) {
      elem.style.visibility = "hidden";
    }
  });
};

const showElements = () => {
  potentiallyStickyElems.forEach((elem) => {
    const computedStyle = getComputedStyle(elem);
    if (
      computedStyle.position === "fixed" ||
      computedStyle.position === "sticky"
    ) {
      elem.style.visibility = "";
    }
  });
  potentiallyStickyElems = [];
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "CAPTURE_SCREENSHOTS") {
    window.scrollTo(0, 0);
    captureScreenshot();
  }
});

const captureScreenshot = async (
  numScreenshots = Math.ceil(document.body.scrollHeight / window.innerHeight),
  screenshots = []
) => {
  // Request the background page to capture the screenshot
  chrome.runtime.sendMessage({ action: "CAPTURE_VISIBLE_TAB" }, (response) => {
    if (response.dataUrl) {
      screenshots.push({
        dataUrl: response.dataUrl,
        scrollY: window.scrollY,
      });
      window.scrollBy(0, window.innerHeight);
    }

    // If there are more screenshots to capture
    if (screenshots.length < numScreenshots) {
      if (screenshots.length === 1) {
        hideElements();
      }
      // Capture the next screenshot
      captureScreenshot(numScreenshots, screenshots);
    } else {
      showElements();
      const pixelRatio = window.devicePixelRatio;
      stitchScreenshots(screenshots, pixelRatio, "jpeg").then((img) => {
        chrome.runtime.sendMessage({
          action: "SCREENSHOTS_FINISHED",
          screenshots: screenshots,
          img,
        });
      });
    }
  });
};
