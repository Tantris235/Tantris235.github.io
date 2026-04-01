import fs from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.YOUTUBE_API_KEY;
const handle = process.env.YOUTUBE_HANDLE || "Tantris235";
const channelId = process.env.YOUTUBE_CHANNEL_ID || "";

if (!apiKey) {
  throw new Error("Missing YOUTUBE_API_KEY secret.");
}

const params = new URLSearchParams({
  part: "statistics",
  key: apiKey
});

if (channelId) {
  params.set("id", channelId);
} else {
  params.set("forHandle", handle);
}

const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params.toString()}`);

if (!response.ok) {
  throw new Error(`YouTube API returned ${response.status}`);
}

const data = await response.json();
const subscribers = Number(data?.items?.[0]?.statistics?.subscriberCount);

if (!Number.isFinite(subscribers)) {
  throw new Error("Subscriber count was not returned by the YouTube API.");
}

const output = {
  subscribers,
  updatedAt: new Date().toISOString(),
  source: "youtube"
};

const outputPath = path.join(process.cwd(), "subs.json");
await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`Updated subs.json with ${subscribers} subscribers.`);
