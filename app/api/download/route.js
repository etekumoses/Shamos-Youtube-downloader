import { NextResponse } from "next/server";
import ytdl from "ytdl-core";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);

export async function POST(req) {
  try {
    const { url, format } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log(`Fetching video info for: ${url}`);

    // Validate the YouTube URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // Get video info
    const info = await ytdl.getInfo(url);
    let videoTitle = info.videoDetails.title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");

    console.log(`Video title extracted: ${videoTitle}`);

    // Define file name and path
    const outputDir = path.join(process.cwd(), "public", "downloads");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const fileName = `${videoTitle}.${format === "mp3" ? "mp3" : "mp4"}`;
    const filePath = path.join(outputDir, fileName);

    // Download video/audio
    const stream = ytdl(url, {
      filter: format === "mp3" ? "audioonly" : "videoandaudio",
      quality: format === "mp3" ? "highestaudio" : "highestvideo",
    });

    // Save to file
    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    return NextResponse.json({ downloadUrl: `/downloads/${fileName}` });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
