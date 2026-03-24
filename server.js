import express from "express";
import dotenv from "dotenv";
import { formatMeetingMarkdown, buildFileName } from "./formatter.js";
import { uploadToOneDrive } from "./onedrive.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
res.json({ ok: true });
});

app.post("/webhook/readai", async (req, res) => {
try {
const incomingSecret = req.header("x-webhook-secret");

if (!incomingSecret || incomingSecret !== process.env.WEBHOOK_SECRET) {
return res.status(401).json({ error: "unauthorized" });
}

const payload = req.body;
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
