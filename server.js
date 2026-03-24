import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";
import getRawBody from "raw-body";
import { formatMeetingMarkdown, buildFileName } from "./formatter.js";
import { uploadToOneDrive } from "./onedrive.js";

dotenv.config();

const app = express();

app.get("/health", (req, res) => {
res.json({ ok: true });
});

app.post("/webhook/readai", async (req, res) => {
try {
const rawBodyBuffer = await getRawBody(req);
const rawBody = rawBodyBuffer.toString("utf8");

const headerSig = req.header("X-Read-Signature");
if (!headerSig) {
return res.status(401).json({ error: "missing_signature" });
}

const signingKey = process.env.READAI_SIGNING_KEY;
const keyBytes = Buffer.from(signingKey, "base64");
const digest = crypto
.createHmac("sha256", keyBytes)
.update(rawBody, "utf8")
.digest("hex");

const valid =
digest.length === headerSig.length &&
crypto.timingSafeEqual(
Buffer.from(digest),
Buffer.from(headerSig.toLowerCase())
);

if (!valid) {
return res.status(401).json({ error: "invalid_signature" });
}

const payload = JSON.parse(rawBody);
const markdown = formatMeetingMarkdown(payload);
const fileName = buildFileName(payload);
const result = await uploadToOneDrive(fileName, markdown);

return res.json({
ok: true,
fileName,
oneDriveId: result.id
});
} catch (error) {
console.error(error?.response?.data || error.message || error);
return res.status(500).json({
ok: false,
error: "upload_failed"
});
}
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Worker listening on port ${port}`);
});
