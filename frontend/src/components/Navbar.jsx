import React, { useContext } from 'react'
import assets from '../assets/assets.js'
import { NavLink } from 'react-router-dom'
import { UserContext } from '../../context/userContext.jsx'

const Navbar = () => {
  const { userInfo,navigate,logout } = useContext(UserContext);
  return ( userInfo &&
    <div className='border flex flex-row items-center h-16'>
      {/* Logo and name */}
      <div className='flex items-center px-4'>
        <img src={assets.logo} className='h-10 w-auto' />
        <h1 className='text-2xl mx-2 font-extrabold text-blue-900'>KingMoves</h1>
      </div>

      {/* Navigation Center */}
      <div className='flex-1 justify-center items-center hidden sm:flex'>
        <NavLink
          to="/"
          className="text-xl font-bold relative px-4 py-1 rounded-xl ml-5 border-none group"
        >
          {({ isActive }) => (
            <>
              Home
              <span
                className={`
          absolute left-0 -bottom-1 h-1 bg-blue-900 transition-all duration-300
          ${isActive ? "w-full" : "w-0 group-hover:w-full"}
        `}
              ></span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/friends"
          className="text-xl font-bold relative px-4 py-1 rounded-xl ml-5 border-none group"
        >
          {({ isActive }) => (
            <>
              Friends
              <span
                className={`
          absolute left-0 -bottom-1 h-1 bg-blue-900 transition-all duration-300
          ${isActive ? "w-full" : "w-0 group-hover:w-full"}
        `}
              ></span>
            </>
          )}
        </NavLink>
        <NavLink
          to="/challenges"
          className="text-xl font-bold relative px-4 py-1 rounded-xl ml-5 border-none group"
        >
          {({ isActive }) => (
            <>
              Challenges
              <span
                className={`
          absolute left-0 -bottom-1 h-1 bg-blue-900 transition-all duration-300
          ${isActive ? "w-full" : "w-0 group-hover:w-full"}
        `}
              ></span>
            </>
          )}
        </NavLink>
        <NavLink
          to="/arena"
          className="text-xl font-bold relative px-4 py-1 rounded-xl ml-5 border-none group"
        >
          {({ isActive }) => (
            <>
              Arena
              <span
                className={`
          absolute left-0 -bottom-1 h-1 bg-blue-900 transition-all duration-300
          ${isActive ? "w-full" : "w-0 group-hover:w-full"}
        `}
              ></span>
            </>
          )}
        </NavLink>

      </div>


      {/* Account Section Placeholder */}
      <div className='w-32 px-4 flex mr-5'>
        {/* Login button */}
        {/* <button className={`${userInfo ? "hidden" : ""} border px-2 py-0.5 rounded bg-blue-900/90 text-white font-medium hover:scale-105 duration-200`}>Login</button> */}
        {/* profilePic */}
        <img src={userInfo?.avatar} 
        alt="user" 
        className='rounded-lg bg-blue-900/40 h-10 w-10 object-cover cursor-pointer' 
        onClick={()=>{navigate("/profile")}}
        title='View Profile'
        />
        <button className='border-none rounded px-2 ml-3 bg-blue-900/90 text-white'
        onClick={() => {
  const confirmLogout = window.confirm("Are you sure you want to log out?");
  if (confirmLogout) logout();
}}>Logout</button>

      </div>
    </div>
  )
}

export default Navbar
