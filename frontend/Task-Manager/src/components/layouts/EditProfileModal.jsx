import React, { useState, useContext } from "react";
import { LuX, LuCamera } from "react-icons/lu";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { UserContext } from "../../context/userContext";

const EditProfileModal = ({ onClose, onProfileUpdate }) => {
  const { user, updateUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(user?.profileImageUrl || "");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update user context with new profile
      const userData = response.data.user || response.data;
      updateUser({
        ...user,
        ...userData,
        token: response.data.token,
      });
      toast.success("Profile photo updated successfully");
      onProfileUpdate?.();
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full dark:bg-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-purple-600 text-white p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <p className="text-gray-100 text-sm">Update your profile photo</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={previewImage || user?.profileImageUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-600 object-cover"
              />
              <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white p-2 rounded-full cursor-pointer transition">
                <LuCamera size={16} />
              </label>
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={loading}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {user?.email}
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-semibold">Tip:</span> Click the camera icon to select a new profile photo
            </p>
          </div>

          {/* Current Role */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2">Role</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                user?.role === "admin" 
                  ? "bg-primary text-white" 
                  : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
              }`}>
                {user?.role === "admin" ? "Admin" : "Member"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !selectedFile}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
