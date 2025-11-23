"use client";

import { useState } from "react";
import { Calendar, Clock, Image as ImageIcon, Send, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface ScheduledPost {
  id: string;
  caption: string;
  imageUrl: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "scheduled" | "posted" | "failed";
}

export default function Home() {
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSchedulePost = async () => {
    if (!caption || !imagePreview || !scheduledDate || !scheduledTime) {
      setNotification({ type: "error", message: "Please fill in all fields" });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          imageUrl: imagePreview,
          scheduledDate,
          scheduledTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newPost: ScheduledPost = {
          id: data.id,
          caption,
          imageUrl: imagePreview,
          scheduledDate,
          scheduledTime,
          status: "scheduled",
        };

        setScheduledPosts([...scheduledPosts, newPost]);
        setCaption("");
        setImagePreview(null);
        setScheduledDate("");
        setScheduledTime("");
        setNotification({ type: "success", message: "Post scheduled successfully!" });
      } else {
        setNotification({ type: "error", message: data.error || "Failed to schedule post" });
      }
    } catch (error) {
      setNotification({ type: "error", message: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getStatusIcon = (status: ScheduledPost["status"]) => {
    switch (status) {
      case "posted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusText = (status: ScheduledPost["status"]) => {
    switch (status) {
      case "posted":
        return "Posted";
      case "failed":
        return "Failed";
      default:
        return "Scheduled";
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg">
              <ImageIcon className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Instagram Auto Poster
          </h1>
          <p className="text-gray-600 text-lg">Schedule your Instagram posts and let automation handle the rest</p>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`max-w-2xl mx-auto mb-6 p-4 rounded-lg shadow-lg ${
              notification.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`text-center font-medium ${
                notification.type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {notification.message}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Post Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h2>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
              <div className="relative">
                {imagePreview ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition">
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            {/* Caption */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption here... #hashtags"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">{caption.length} characters</p>
            </div>

            {/* Schedule Date & Time */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Schedule Button */}
            <button
              onClick={handleSchedulePost}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Schedule Post
                </>
              )}
            </button>
          </div>

          {/* Scheduled Posts Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Scheduled Posts</h2>

            {scheduledPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No scheduled posts yet</p>
                <p className="text-sm">Create your first post to get started</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {scheduledPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex gap-4">
                      <img
                        src={post.imageUrl}
                        alt="Post preview"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-2 line-clamp-2">{post.caption}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {post.scheduledDate}
                          </span>
                          <span>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {post.scheduledTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        {getStatusIcon(post.status)}
                        <span className="text-xs mt-1">{getStatusText(post.status)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Upload Content</h4>
              <p className="text-sm text-gray-600">Upload your image and write your caption with hashtags</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Schedule Time</h4>
              <p className="text-sm text-gray-600">Choose when you want your post to go live on Instagram</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Auto-Post</h4>
              <p className="text-sm text-gray-600">Sit back and relax - your post will be published automatically</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
