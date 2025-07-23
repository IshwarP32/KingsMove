import React, { useContext, useState } from "react";
import { UserContext } from "../../context/userContext";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const { userInfo, backendurl, setUserInfo} = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const handleDeleteAccount = async () => {
    if (!oldPassword) return;

    setIsDeleting(true);
    try {
      const {data} = await axios.post(
        `${backendurl}/api/user/delete`,
        { password: oldPassword },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Account Deletion Successfull")
        setUserInfo(undefined);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handlePasswordChange = async ()=>{
    try {
        setIsUpdatingPass(true);
        const {data} = await axios.post(backendurl+"/api/user/change-pass",{oldPassword,newPassword},{withCredentials:true})
        console.log(data);
        if(data.success){
            toast.success("Password Changed !")
        }else{
            toast.error(data.message);
        }
    } catch (error) {
        console.log(error);
    } finally{
        setIsUpdatingPass(false);
        setShowPasswordModal(false);
    }
  }

  const [form, setForm] = useState({
    fullName: userInfo?.fullName || "",
    username: userInfo?.username || "",
    email: userInfo?.email || "",
    avatar: userInfo?.avatar,
  });

  const [newAvatarFile, setNewAvatarFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatarFile(file);
      setForm({ ...form, avatar: URL.createObjectURL(file) }); // preview
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      let newUserInfo = new FormData();
      newUserInfo.append("email", form.email);
      newUserInfo.append("fullName", form.fullName);
      newUserInfo.append("username", form.username);
      if (newAvatarFile) newUserInfo.append("image", newAvatarFile);
      // Send profile update request
      await axios.post(`${backendurl}/api/user/update`, newUserInfo, {
        withCredentials: true,
      });

      setIsEditing(false);
      window.location.reload(); // refresh to get updated info
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-screen px-4 flex justify-center items-center"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: User Info */}
        <div className="bg-blue-900 text-white rounded-3xl p-8 shadow-xl">
          {/* Avatar */}
          <div className="flex justify-center mb-6 relative group">
            <img
              src={form.avatar}
              alt="User Avatar"
              className="w-28 h-28 rounded-full border-2 border-white shadow-md object-cover cursor-pointer"
              onClick={() =>
                (isEditing || !isLoading) &&
                document.getElementById("avatarInput").click()
              }
              title={isEditing || !isLoading ? "Click to change avatar" : ""}
            />
            {isEditing && !isLoading && (
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            )}
          </div>

          {/* Form */}
          <div className="space-y-4">
              <div>
                <label className="text-sm text-blue-200 capitalize">
                  Email
                </label>
                <p
                  className="w-full mt-1 px-4 py-2 rounded-md bg-white/5 text-white border border-none"
                >{userInfo.email}</p>
              </div>
            {["fullName", "username"].map((field) => (
              <div key={field}>
                <label className="text-sm text-blue-200 capitalize">
                  {field}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                  className="w-full mt-1 px-4 py-2 rounded-md bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-60"
                />
              </div>
            ))}

            {/* Edit / Save Button */}
            <div className="flex justify-center mt-4">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="bg-white text-blue-900 font-semibold px-6 py-2 rounded-full hover:bg-blue-100 transition"
                >
                  {isLoading ? "Saving.." : "Save"}
                </button>
              ) : (
                <div className="flex gap-2 text-xs mt-5">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-blue-900 font-semibold px-6 py-2 rounded-full hover:bg-blue-100 transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={()=>setShowPasswordModal(true)}
                    className="bg-white text-blue-900 font-semibold px-6 py-2 rounded-full hover:bg-blue-100 transition"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-800/80 text-white font-semibold px-6 py-2 rounded-full hover:bg-red-800 transition"
                  >
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Statistics */}
        <div className="bg-blue-900 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-center items-center space-y-6">
          <h2 className="text-2xl font-bold">Game Stats</h2>
          <div className="w-full grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 p-4 rounded-xl">
              <h3 className="text-3xl font-bold text-green-400">
                {userInfo?.won || 0}
              </h3>
              <p>Wins</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <h3 className="text-3xl font-bold text-red-400">
                {userInfo?.lost || 0}
              </h3>
              <p>Losses</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <h3 className="text-3xl font-bold text-yellow-300">
                {userInfo?.draw || 0}
              </h3>
              <p>Draws</p>
            </div>
          </div>
        </div>
      </div>
      {/* delete account box */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
          <div className="bg-white text-blue-900 p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-2 text-sm">
              Enter your password to delete your account permanently:
            </p>

            <input
              type="password"
              placeholder="Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none"
              disabled={isDeleting}
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-sm px-4 py-2 border border-blue-900 text-blue-900 rounded-md hover:bg-blue-100"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={`text-sm px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 ${
                  isDeleting && "opacity-50 cursor-not-allowed"
                }`}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* password update box */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
          <div className="bg-white text-blue-900 p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <p className="mb-2 text-sm">
              Old Password:
            </p>

            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none"
              disabled={isUpdatingPass}
            />
            <p className="mb-2 text-sm">
              New Password:
            </p>

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none"
              disabled={isUpdatingPass}
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-sm px-4 py-2 border border-blue-900 text-blue-900 rounded-md hover:bg-blue-100"
                disabled={isUpdatingPass}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isUpdatingPass}
                className={`text-sm px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-red-800 ${
                  isUpdatingPass && "opacity-50 cursor-not-allowed"
                }`}
              >
                {isUpdatingPass ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
