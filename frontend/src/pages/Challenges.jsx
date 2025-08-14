import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Sword, UserCircle } from "lucide-react";
import { UserContext } from "../../context/UserContext.jsx";
import socket from "../Socket.js";

const Challenges = () => {
  const changeChallengeStatus = async (challengeId, action) => {
    try {
      if (action === "accepted") {
        //check if game already exist
        const isActiveGame = (
          await axios.post(
            backendurl + "/api/arena/findActive",
            {},
            { withCredentials: true }
          )
        ).data.success;
        if (isActiveGame) {
          toast.error("Quit Active Game First !");
          return;
        }
      }
      const { data } = await axios.post(
        `${backendurl}/api/user/challenge/change-status`,
        { challengeId, action }, // action = "accepted" or "declined"
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        fetchChallenges(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating challenge status");
    }
  };

  const { backendurl, userInfo, navigate } = useContext(UserContext);
  const [sentChallenges, setSentChallenges] = useState([]);
  const [receivedChallenges, setReceivedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async () => {
    try {
      const { data } = await axios.post(
        `${backendurl}/api/user/challenge/get-all`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        setSentChallenges(data.content?.sent || []);
        setReceivedChallenges(data.content?.received || []);
      } else {
        toast.error(data.message || "Failed to fetch challenges.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading challenges");
    } finally {
      setLoading(false);
    }
  };

  socket.on("challengeRefresh", () => {
    fetchChallenges();
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const renderChallengeCard = (challenge, type) => {
    return (
      <div
        key={challenge._id}
        className="bg-gray-700 p-5 rounded-2xl shadow-md transition hover:shadow-xl flex justify-between items-center"
      >
        {/* Left: Avatar & User Info */}
        <div className="flex items-center gap-4">
          {challenge?.avatar ? (
            <img
              src={challenge.avatar}
              alt="opponent"
              className="w-14 h-14 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <UserCircle className="w-14 h-14 text-gray-300" />
          )}

          <div className="flex flex-col">
            {/* <p className="text-lg font-bold">
              {challenge.fullName || "Unknown User"}
            </p> */}
            <p className="text-xl font-bold text-gray-300">
              {challenge.username}
            </p>
            <p className="text-xs mt-1 text-blue-300 capitalize">
              Status: {challenge.status}
            </p>
            <p className="text-xs text-gray-400 italic">
              {type === "sent"
                ? "You sent this challenge"
                : "You received this challenge"}
            </p>
          </div>
        </div>

        {/* Right: Buttons */}
        <div className="flex flex-col items-end gap-2 min-w-[150px] ml-4">
          {challenge.status === "pending" ? (
            type === "sent" ? (
              <p className="text-sm italic text-blue-300">
                Waiting for response
              </p>
            ) : (
              <>
                <button
                  onClick={() =>
                    changeChallengeStatus(challenge._id, "accepted")
                  }
                  className="px-4 py-1 rounded bg-green-600 hover:bg-green-700 transition"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    changeChallengeStatus(challenge._id, "rejected")
                  }
                  className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 transition"
                >
                  Decline
                </button>
              </>
            )
          ) : challenge.status === "rejected" ? (
            <p className="text-sm"></p>
          ) : (
            <button
              onClick={() => {
                navigate("/arena");
              }}
              className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 transition w-full"
            >
              View Game
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Challenges</h1>
        <Sword className="text-blue-400 h-8 w-8" />
      </div>

      {loading ? (
        <div className="text-center text-blue-300 animate-pulse">
          Loading challenges...
        </div>
      ) : sentChallenges.length + receivedChallenges.length === 0 ? (
        <div className="text-center text-gray-300 mt-10">
          No challenges found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ...receivedChallenges.map((c) =>
              renderChallengeCard(c, "received")
            ),
            ...sentChallenges.map((c) => renderChallengeCard(c, "sent")),
          ]}
        </div>
      )}
    </div>
  );
};

export default Challenges;
