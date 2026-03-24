function safeArray(arr) {
return Array.isArray(arr) ? arr : [];
}

export function formatMeetingMarkdown(payload) {
const sessionId = payload.session_id || "unknown-session";
const title = payload.title || "Untitled Meeting";
const startTime = payload.start_time || "";
const endTime = payload.end_time || "";
const platform = payload.platform || "";
const reportUrl = payload.report_url || "";

const participants = safeArray(payload.participants).map(p => p?.name).filter(Boolean);
const actionItems = safeArray(payload.action_items).map(x => x?.text).filter(Boolean);
const keyQuestions = safeArray(payload.key_questions).map(x => x?.text).filter(Boolean);
const topics = safeArray(payload.topics).map(x => x?.text).filter(Boolean);
const speakerBlocks = safeArray(payload?.transcript?.speaker_blocks);

const transcript = speakerBlocks
.map(b => {
const speaker = b?.speaker?.name || "Unknown";
const words = b?.words || "";
return `**${speaker}:** ${words}`;
})
.join("\n\n");

const participantsYaml = participants.length
? participants.map(name => ` - ${name}`).join("\n")
: " - None";

const actionItemsMd = actionItems.length
? actionItems.map(x => `- ${x}`).join("\n")
: "- None";

const keyQuestionsMd = keyQuestions.length
? keyQuestions.map(x => `- ${x}`).join("\n")
: "- None";

const topicsMd = topics.length
? topics.map(x => `- ${x}`).join("\n")
: "- None";

return `---
type: meeting-transcript
source: read-ai
session_id: ${sessionId}
platform: ${platform}
start_time: ${startTime}
end_time: ${endTime}
report_url: ${reportUrl}
participants:
${participantsYaml}
tags:
- meetings
- read-ai
- transcript
---

# ${title}

## Summary
${payload.summary || ""}

## Action Items
${actionItemsMd}

## Key Questions
${keyQuestionsMd}

## Topics
${topicsMd}

## Transcript
${transcript || "_No transcript_"}
`;
}

export function buildFileName(payload) {
const date = (payload.start_time || "").slice(0, 10) || "unknown-date";
const rawTitle = payload.title || "Untitled Meeting";
const sessionId = payload.session_id || "unknown-session";

const safeTitle = rawTitle.replace(/[\\/:\"*?<>|]+/g, "").trim() || "Untitled Meeting";

return `${date} - ${safeTitle} - ${sessionId}.md`;
}
