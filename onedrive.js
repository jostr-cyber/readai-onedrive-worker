import axios from "axios";

export async function getAccessToken() {
const url = `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}/oauth2/v2.0/token`;

const params = new URLSearchParams();
params.append("client_id", process.env.MS_CLIENT_ID);
params.append("client_secret", process.env.MS_CLIENT_SECRET);
params.append("refresh_token", process.env.MS_REFRESH_TOKEN);
params.append("redirect_uri", "https://oauth.pstmn.io/v1/browser-callback");
params.append("grant_type", "refresh_token");
params.append("scope", "offline_access Files.ReadWrite User.Read");

const { data } = await axios.post(url, params, {
headers: { "Content-Type": "application/x-www-form-urlencoded" }
});

return data.access_token;
}

export async function uploadToOneDrive(fileName, content) {
const token = await getAccessToken();

const me = await axios.get("https://graph.microsoft.com/v1.0/me", {
headers: {
Authorization: `Bearer ${token}`
}
});
console.log("ME:", JSON.stringify(me.data));

const drive = await axios.get("https://graph.microsoft.com/v1.0/me/drive", {
headers: {
Authorization: `Bearer ${token}`
}
});
console.log("DRIVE:", JSON.stringify(drive.data));

const basePath = process.env.ONEDRIVE_FOLDER_PATH;
const encodedPath = encodeURIComponent(`${basePath}/${fileName}`).replace(/%2F/g, "/");

const url = `https://graph.microsoft.com/v1.0/me/drive/root:${encodedPath}:/content`;

const { data } = await axios.put(url, content, {
headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "text/markdown"
}
});

return data;
}
