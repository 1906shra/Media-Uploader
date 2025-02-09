"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function VideoUpload() {
  const MAX_FILE_SIZE = 70 * 1024 * 1024; // 70MB

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("File size is too large (Max: 70MB)");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("originalSize", file.size.toString());

    try {
      const response = await axios.post("/api/video-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload successful:", response.data);
      router.push("/success"); // Redirect after upload
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed, please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Video</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
            required
          />
        </div>

        {/* File Input */}
        <div>
          <label className="label">
            <span className="label-text">Video</span>
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file-input file-input-bordered w-full"
            required
          />
        </div>

        {/* Upload Button */}
        <button type="submit" className="btn btn-primary" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
}

export default VideoUpload;
