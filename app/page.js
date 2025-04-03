"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDownload = async (format) => {
    if (!url) return setMessage("⚠️ Please enter a YouTube URL");

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format }),
      });

      if (!response.ok) {
        setMessage("❌ Failed to download the video.");
        setLoading(false);
        return;
      }

      // Get blob from response
      const blob = await response.blob();

      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = format === "mp3" ? "audio.mp3" : "video.mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(downloadUrl);

      setMessage("✅ Download started...");
      setTimeout(() => {
        setMessage("");
        setUrl("");
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      setMessage("⚠️ Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-6 relative">
      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-transparent"></div>
            <p className="mt-4 text-lg font-semibold">Downloading...</p>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">📥 YouTube Downloader</h1>

      <input
        type="text"
        placeholder="Paste YouTube URL here..."
        className="w-full max-w-md p-3 border border-gray-600 bg-gray-900 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={loading}
      />

      <div className="mt-6 flex gap-4">
        <button
          className="px-6 py-3 border border-white text-white font-semibold rounded-lg transition duration-300 
          hover:bg-white hover:text-black disabled:bg-gray-500 disabled:border-gray-500"
          onClick={() => handleDownload("mp4")}
          disabled={loading}
        >
          🎥 Download Video
        </button>
        <button
          className="px-6 py-3 border border-white text-white font-semibold rounded-lg transition duration-300 
          hover:bg-white hover:text-black disabled:bg-gray-500 disabled:border-gray-500"
          onClick={() => handleDownload("mp3")}
          disabled={loading}
        >
          🎵 Download Audio
        </button>
      </div>

      {message && (
        <p className="mt-4 text-gray-300 text-lg">{message}</p>
      )}
    </div>
  );
}
