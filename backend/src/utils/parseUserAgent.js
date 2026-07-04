import UAParser from "ua-parser-js";

export function parseUserAgent(userAgent = "") {
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();

  return {
    deviceType: device.type || "desktop",
    browser: [browser.name, browser.version].filter(Boolean).join(" "),
    os: [os.name, os.version].filter(Boolean).join(" "),
  };
}
