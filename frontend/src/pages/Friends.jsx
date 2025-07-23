import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../../context/userContext";
import { toast } from "react-toastify";
import { UserCircle } from "lucide-react";

const Friends = () => {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [sending, setSending] = useState(false);

  const sendFriendRequest = async () => {
    if (!username.trim()) return toast.error("Username is required");

    setSending(true);
    try {
      const { data } = await axios.post(
        `${backendurl}/api/user/friend/new`,
        { username },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        fetchFriends();
        setShowModal(false);
        setUsername("");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to send request");
    } finally {
      setSending(false);
    }
  };

  const { backendurl } = useContext(UserContext);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    try {
      const { data } = await axios.post(
        `${backendurl}/api/user/friend/get-all`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        setFriends(data.content || []);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const changeFriendStatus = async (friendshipId, action) => {
    try {
      const { data } = await axios.post(
        `${backendurl}/api/user/friend/changeStatus`,
        { friendshipId, action },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        fetchFriends(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const challenge = async (fId) => {
  try {
    const { data } = await axios.post(
      `${backendurl}/api/user/challenge/new`,
      { userId:fId },
      { withCredentials: true }
    );

    if (data.success) {
      toast.success(data.message || "Challenge sent!");
    } else {
      toast.error(data.message || "Failed to send challenge");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong while sending challenge");
  }
};
  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <h1 className="text-4xl font-bold text-center mb-8">Your Friends</h1>
      <div className="fixed flex justify-end mb-4 right-10 top-[6rem]">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Add Friend
        </button>
      </div>

      {loading ? (
        <div className="text-center text-blue-300 text-lg animate-pulse">
          Loading friends...
        </div>
      ) : friends.length === 0 ? (
        <div className="text-center text-blue-200 text-xl">
          You have no friends yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {friends.map((friend) => (
            <div
              key={friend._id}
              className="bg-gray-700 rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row justify-between items-cente transition-shadow duration-300"
            >
              {/* Avatar and Info */}
              <div className="flex items-center gap-4 w-full sm:w-1/2">
                {friend.avatar ? (
                  <img
                    src={friend.avatar}
                    alt="avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <UserCircle className="w-16 h-16 text-gray-300" />
                )}
                <div>
                  <h2 className="text-xl font-semibold flex items-center">
                    {friend.fullName}
                    <span
                      className={`ml-2 w-2 h-2 rounded-full ${
                        friend.isOnline ? "bg-green-400" : "bg-red-400"
                      }`}
                      title={friend.isOnline ? "Online" : "Offline"}
                    />
                  </h2>
                  <p className="text-sm text-gray-300">@{friend.username}</p>
                  <p className="text-xs text-blue-300">
                    Status: {friend.status}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 sm:mt-0">
                <div className="flex gap-4 text-sm bg-gray-600 px-4 py-2 rounded-lg font-medium">
                  <span className="text-green-300 text-nowrap">
                    Wins: {friend.statistics[0]}
                  </span>
                  <span className="text-red-300 text-nowrap">
                    Losses: {friend.statistics[1]}
                  </span>
                  <span className="text-yellow-300 text-nowrap">
                    Draws: {friend.statistics[2]}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
                  {friend.status === "pending" ? (
                    friend.sentBy !== friend.fId ? (
                      <>
                        <button
                          disabled
                          className="px-4 py-1 rounded bg-blue-800/40 text-white cursor-not-allowed w-25"
                        >
                          Sent
                        </button>
                        <button
                          className="px-4 py-1 rounded bg-red-700 hover:bg-red-800 transition w-25"
                          onClick={() =>
                            changeFriendStatus(friend._id, "deleted")
                          }
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="px-4 py-1 rounded bg-green-600 hover:bg-green-700 transition w-25"
                          onClick={() =>
                            changeFriendStatus(friend._id, "accepted")
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 transition w-25"
                          onClick={() =>
                            changeFriendStatus(friend._id, "rejected")
                          }
                        >
                          Reject
                        </button>
                      </>
                    )
                  ) : friend.status === "accepted" ? (
                    <>
                      <button className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 transition w-25"
                      onClick={()=>{challenge(friend.fId)}}>
                        Challenge
                      </button>
                      <button
                        className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 transition w-25"
                        onClick={() =>
                          changeFriendStatus(friend._id, "deleted")
                        }
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No actions</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white text-gray-800 rounded-xl shadow-lg p-6 w-[90%] max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
              Send Friend Request
            </h2>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={sendFriendRequest}
              disabled={sending}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send Request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends;
