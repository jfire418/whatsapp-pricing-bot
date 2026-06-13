const { google } = require("googleapis");

const FILE_MAP = {
  Wedding: process.env.DRIVE_FILE_WEDDING,
  Event: process.env.DRIVE_FILE_EVENT,
  Portrait: process.env.DRIVE_FILE_PORTRAIT,
  Corporate: process.env.DRIVE_FILE_CORPORATE,
  General: process.env.DRIVE_FILE_GENERAL,
};

function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

// Returns a public download URL for the PDF.
// The files must be shared as "Anyone with the link can view" in Google Drive.
function getPdfUrl(category) {
  const fileId = FILE_MAP[category] || FILE_MAP["General"];
  if (!fileId) throw new Error(`No Drive file configured for: ${category}`);
  // Direct download link — works when file is publicly shared
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

module.exports = { getPdfUrl };
