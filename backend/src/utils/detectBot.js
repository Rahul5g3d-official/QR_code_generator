const botPattern =
  /bot|crawler|spider|preview|facebookexternalhit|slackbot|discordbot|whatsapp|telegrambot|linkedinbot|twitterbot|bingbot|googlebot|headless|curl|wget/i;

export function detectBot(userAgent = "") {
  return botPattern.test(userAgent);
}
