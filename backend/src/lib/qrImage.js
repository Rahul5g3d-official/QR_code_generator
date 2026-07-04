import QRCode from "qrcode";

export async function createQrImage(trackingUrl) {
  return QRCode.toDataURL(trackingUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 1024,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });
}
