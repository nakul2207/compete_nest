import type React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  Camera,
  Github,
  Linkedin,
  Globe,
  Lock,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { getUser } from "@/api/userApi";
import img from "../assets/blank.jpg";
import { UpdateProfile, ChangePassword, DeleteUser } from "@/api/userApi";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/Spinner";
import { Loader } from "lucide-react";
import { LogoutUser } from "@/api/authApi";
import { logout } from "@/redux/slice/authSlice.tsx";
import { useAppDispatch } from "@/redux/hook";

// New interface for user data
interface UserData {
  id: string;
  name: string;
  username: string;
  avatar: string | File;
  bio: string;
  github: string;
  linkedin: string;
  extraURL: string;
  email: string;
  skills: string[];
}

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Replace individual states with one state for user data
  const [userData, setUserData] = useState<UserData>({
    id: "",
    name: "",
    username: "",
    avatar: img,
    bio: "",
    github: "",
    linkedin: "",
    extraURL: "",
    email: "",
    skills: [],
  });
  const [imagechange, setImageChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [newSkill, setNewSkill] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"profile" | "account" | "preferences">("profile");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setPageLoading(true);
        const data = await getUser();
        setUserData({
          id: data.id,
          name: data.name || "",
          username: data.username || "",
          avatar: data.avatar || img,
          bio: data.bio || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
          extraURL: data.extraURL || "",
          email: data.email || "",
          skills: data.skills || [],
        });
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
      finally {
        setPageLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserData((prev) => ({ ...prev, avatar: file }));
      setImageChange(true);
    }
  };

  // Add new skill
  const addSkill = () => {
    if (newSkill.trim() !== "") {
      setUserData((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
      setNewSkill("");
    }
  };

  // Remove skill
  const removeSkill = (index: number) => {
    setUserData((prev) => {
      const updatedSkills = [...prev.skills];
      updatedSkills.splice(index, 1);
      return { ...prev, skills: updatedSkills };
    });
  };

  // Save profile changes
  const saveProfileChanges = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const contentType =
        userData.avatar instanceof File ? userData.avatar.type : "image/jpeg";
      const updatedProfile = {
        imagechange,
        contentType,
        name: userData.name,
        bio: userData.bio,
        github: userData.github,
        linkedin: userData.linkedin,
        extraURL: userData.extraURL,
        skills: userData.skills,
      };
      setLoading(true);
      const res = await UpdateProfile(updatedProfile);
      if (res.status === 400) {
        toast.error("Invalid credentials");
        return;
      }
      // Check if new image is there
      if (imagechange && res.data.url) {
        await axios.put(res.data.url as string, userData.avatar, {
          headers: {
            "Content-Type": contentType,
          },
        });
      }
      toast.success("Profile changes saved successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while saving profile changes.");
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (newPassword !== confirmPassword) {
        toast.error("New passwords don't match!");
        return;
      }
      setLoading(true);
      const res = await ChangePassword({ oldPassword: currentPassword, newPassword });
      if (res.status === 200) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else if (res.status === 400) {
        toast.error("Invalid credentials");
      } else {
        toast.error("Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An error occurred while updating password.");
    } finally {
      setLoading(false);
    }
  };

  const DeleteAccountHandler = async () => {
    try {
      setDeleteLoading(true);
      await LogoutUser();
      dispatch(logout());
      await DeleteUser(userData.id);
      navigate("/auth");
      toast.success("Account deleted successfully!");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("An error occurred while deleting account.");
    }finally {
      setDeleteLoading(false);
    }
  };
  const getCacheBustedUrl = (url: string) => `${url}?v=${new Date().getTime()}`;


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {pageLoading ? <div className="flex items-center justify-center min-h-screen" ><Spinner/></div>:(
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-64 bg-gray-50 dark:bg-gray-900">
              <div className="p-6">
                <h2 className="text-lg font-semibold flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </h2>
              </div>
              <nav className="px-3 pb-6">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center px-3 py-2 w-full text-left rounded-md mb-1 ${
                    activeTab === "profile"
                      ? "bg-purple-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("account")}
                  className={`flex items-center px-3 py-2 w-full text-left rounded-md mb-1 ${
                    activeTab === "account"
                      ? "bg-purple-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  <Lock className="h-5 w-5 mr-2" />
                  Account & Security
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {/* Profile Settings */}
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Profile Settings</h2>

                  <form onSubmit={saveProfileChanges}>
                    {/* Profile Image */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium mb-2">Profile Image</label>
                      <div className="flex items-center">
                        <div className="relative">
                          <img
                            src={
                              typeof userData.avatar === "string"
                                ? getCacheBustedUrl(userData.avatar)
                                : URL.createObjectURL(userData.avatar)
                            }
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                          />
                          <label
                            htmlFor="profile-image"
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer"
                          >
                            <Camera className="h-4 w-4" />
                            <input
                              type="file"
                              id="profile-image"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Upload a new profile picture. <br />
                            Recommended size: 400x400px.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={userData.name}
                          onChange={(e) =>
                            setUserData((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="username" className="block text-sm font-medium mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          readOnly
                          value={userData.username}
                          onChange={(e) =>
                            setUserData((prev) => ({ ...prev, username: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="bio" className="block text-sm font-medium mb-2">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          value={userData.bio}
                          onChange={(e) =>
                            setUserData((prev) => ({ ...prev, bio: e.target.value }))
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                          placeholder="Tell us about yourself"
                        />
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Social Links</h3>

                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Github className="h-5 w-5 text-gray-500 mr-2" />
                          <input
                            type="url"
                            value={userData.github}
                            onChange={(e) =>
                              setUserData((prev) => ({ ...prev, github: e.target.value }))
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                            placeholder="https://github.com/username"
                          />
                        </div>

                        <div className="flex items-center">
                          <Linkedin className="h-5 w-5 text-gray-500 mr-2" />
                          <input
                            type="url"
                            value={userData.linkedin}
                            onChange={(e) =>
                              setUserData((prev) => ({ ...prev, linkedin: e.target.value }))
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>

                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-gray-500 mr-2" />
                          <input
                            type="url"
                            value={userData.extraURL}
                            onChange={(e) =>
                              setUserData((prev) => ({ ...prev, extraURL: e.target.value }))
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Skills</h3>

                      <div className="space-y-2 mb-4">
                        {userData.skills.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded-md"
                          >
                            <span className="text-sm font-medium">{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeSkill(index)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label htmlFor="new-skill" className="block text-sm font-medium mb-2">
                            Add New Skill
                          </label>
                          <input
                            type="text"
                            id="new-skill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                            placeholder="e.g. Machine Learning"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader className="animate-spin h-6 w-32" />
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Account & Security Settings */}
              {activeTab === "account" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Account & Security</h2>

                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Email Address</h3>
                    <div className="flex items-center">
                      <input
                        type="email"
                        value={userData.email}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      This email is used for login and notifications.
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <form onSubmit={updatePassword} className="space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="current-password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                          placeholder="Enter your current password"
                        />
                      </div>

                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium mb-2">
                          New Password
                        </label>
                        <input
                          type="text"
                          id="new-password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                          placeholder="Enter your new password"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirm-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                          placeholder="Confirm your new password"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader className="animate-spin h-6 w-32" />
                          ) : (
                            <>Update Password</>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
                    <div className="border border-red-300 dark:border-red-800 rounded-md p-4">
                      <h4 className="font-medium mb-2">Delete Account</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
                        onClick={DeleteAccountHandler}
                        disabled={loading}
                      >{
                        deleteLoading?(<Loader className="animate-spin h-6 w-32" />):(
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Delete Account
                          </>
                        )
                      }
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
