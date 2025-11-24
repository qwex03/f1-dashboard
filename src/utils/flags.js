export const countryCodes = {
  "British": "GB",
  "German": "DE",
  "French": "FR",
  "Italian": "IT",
  "Spanish": "ES",
  "Australian": "AU",
  "Dutch": "NL",
  "Belgian": "BE",
  "Brazilian": "BR",
  "Canadian": "CA",
  "Finnish": "FI",
  "Mexican": "MX",
  "Japanese": "JP",
  "Danish": "DK",
  "Austrian": "AT",
  "Swiss": "CH",
  "Swedish": "SE",
  "Portuguese": "PT",
  "American": "US",
  "Russian": "RU",
  "Indian": "IN",
  "Chinese": "CN",
  "Argentinian": "AR",
  "South African": "ZA",
  "New Zealander": "NZ",
  "Thai": "TH",
  "Vietnamese": "VN",
  "Polish": "PL",
  "Turkish": "TR",
  "Monegasque": "MC",
  "Argentine": "AR",
};

export function getFlagImg(countryName) {
  const code = countryCodes[countryName];
  if (!code) return null;
  return `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
}
