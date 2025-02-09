"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import VideoCard from "@/components/VideoCard";

interface Video {
  title: string;
  id: string;
  description: string | null;
  publicId: string;
  originalSize: string;
  compressedSize: string;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function Home() {  // ✅ Ensure it's a function component
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const response = await axios.get("/api/videos");
      console.log(response.data); // Debugging
      if (Array.isArray(response.data)) {
        setVideos(response.data);
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDownload = useCallback((url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "video.mp4");
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Videos</h1>
        {videos.length === 0 ? (
          <div className="text-center text-lg text-gray-500">
            No Videos available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} onDownload={handleDownload} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
