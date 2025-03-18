import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import { promisify } from "util";
import fs from "fs";

const execPromise = promisify(exec);

export async function POST(req) {
  try {
    const { url, format } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log(`Downloading: ${url}`);

    // Define file name and path (fixed names)
    const outputDir = path.join(process.cwd(), "public", "downloads");
    const fileName = format === "mp3" ? "audio.mp3" : "video.mp4";
    const outputFile = `${outputDir}/${fileName}`;

    // Ensure the downloads folder exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // yt-dlp command for video/audio download
    let command;
    if (format === "mp3") {
      command = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 --audio-quality 320K -o "${outputFile}" "${url}"`;
    } else {
      command = `yt-dlp -f best -o "${outputFile}" "${url}"`;
    }

    console.log("Executing command:", command);
    await execPromise(command);

    // Check if file exists before returning response
    if (!fs.existsSync(outputFile)) {
      return NextResponse.json({ error: "File not found" }, { status: 500 });
    }

    console.log(`Download successful: ${fileName}`);

    return NextResponse.json({ downloadUrl: `/downloads/${fileName}` });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
