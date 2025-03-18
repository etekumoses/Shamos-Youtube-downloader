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

    console.log(`Fetching video title for: ${url}`);

    // Extract video title
    const { stdout: titleOutput } = await execPromise(`yt-dlp --get-title "${url}"`);
    let videoTitle = titleOutput.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "_"); // Clean title

    console.log(`Video title extracted: ${videoTitle}`);

    // Define file name and path
    const outputDir = path.join(process.cwd(), "public", "downloads");
    const fileName = `${videoTitle}.${format}`;
    const outputFile = `${outputDir}/${fileName}`;

    // Use yt-dlp with ffmpeg to extract **only audio and convert it to MP3**
    let command;
    if (format === "mp3") {
      command = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 --audio-quality 320K -o "${outputFile}" "${url}"`;
    } else {
      command = `yt-dlp -f best -o "${outputFile}" "${url}"`;
    }

    console.log("Executing command:", command);
    await execPromise(command);

    // Check if file exists
    if (!fs.existsSync(outputFile)) {
      return NextResponse.json({ error: "File not found" }, { status: 500 });
    }

    // Return the correct file name for downloading
    return NextResponse.json({ downloadUrl: `/downloads/${fileName}` });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
