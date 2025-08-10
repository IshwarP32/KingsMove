import React, { useContext, useEffect } from 'react';
import { UserContext } from '../../context/userContext';

const Home = () => {
  const {navigate} = useContext(UserContext);
  // var socket = io();
  return (
    <div className='relative w-full bg-blue-900 overflow-hidden'
    style={{ height: 'calc(100vh - 64px)' }}>
      {/* Background Image */}
      <img
        src="/bg-img.jpeg"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between h-full px-6 sm:px-10">
        {/* Text Content */}
        <div className="text-white w-full md:w-1/2 space-y-4 sm:space-y-6 pl-4 sm:pl-10 pt-20 sm:pt-15 md:pt-0">
          <h1 className="text-4xl sm:text-5xl font-bold">Chess Reinvented ✨</h1>
          <p className="text-lg sm:text-xl max-w-md">
            Dive into real-time chess battles. Play live games, challenge your friends, and master the art of strategy.
          </p>

          {/* Buttons */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-4">
            <button onClick={() => { navigate('/arena'); }} className="bg-white text-blue-900 px-6 py-3 rounded-full font-semibold hover:bg-blue-100 transition">
              Join Live Game
            </button>
            <button onClick={() => { navigate('/friends'); }} className="border border-white text-white px-6 py-3 rounded-full hover:bg-white hover:text-blue-900 transition">
              Challenge Friend
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full md:w-1/2 flex justify-center mt-6 sm:mt-10 md:mt-0">
          <img
            src="/home-img-3.png"
            alt="Chess Illustration"
            className="h-[300px] sm:h-[400px] md:h-[500px] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
