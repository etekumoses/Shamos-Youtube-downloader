import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execPromise = promisify(exec);
const tempDir = "/tmp";

export async function POST(req) {
  try {
    const { url, format } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Output filename template
    const extension = format === "mp3" ? "mp3" : "mp4";
    const outputTemplate = path.join(tempDir, `%(title)s.%(ext)s`);

    // yt-dlp command
    let command;
    if (format === "mp3") {
      command = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 --audio-quality 320K -o "${outputTemplate}" "${url}"`;
    } else {
      command = `yt-dlp -f best -o "${outputTemplate}" "${url}"`;
    }

    console.log("Running:", command);
    await execPromise(command);

    // Find the downloaded file (first matching one)
    const files = fs.readdirSync(tempDir).filter(f => f.endsWith(`.${extension}`));
    if (files.length === 0) {
      return NextResponse.json({ error: "Download failed" }, { status: 500 });
    }

    const fileName = files[0];
    const filePath = path.join(tempDir, fileName);

    // Create stream
    const fileStream = fs.createReadStream(filePath);
    const headers = new Headers({
      "Content-Type": format === "mp3" ? "audio/mpeg" : "video/mp4",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    });

    fileStream.on("close", () => {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn("Failed to delete temp file:", err.message);
      }
    });

    return new Response(fileStream, { headers });

  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
