import React, { useContext, useState } from 'react'
import assets from '../assets/assets.js'
import { NavLink } from 'react-router-dom'
import { UserContext } from '../../context/UserContext.jsx'

const Navbar = () => {
  const { userInfo, navigate, logout } = useContext(UserContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) logout();
  };

  return (
    userInfo && (
  <div className="border flex flex-row items-center h-16 relative w-full z-50 bg-white">
        {/* Logo and name */}
        <div className="flex items-center px-4">
          <img src={assets.logo} className="h-10 w-auto" alt="Logo" />
          <h1 className="text-2xl mx-2 font-extrabold text-blue-900">KingMoves</h1>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="sm:hidden absolute right-4 text-blue-900 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✖' : '☰'}
        </button>

        {/* Navigation Center */}
        <div
          className={`${
            isMobileMenuOpen ? 'flex' : 'hidden'
          } sm:flex flex-col sm:flex-row items-center sm:items-center absolute sm:static top-16 left-0 w-full sm:w-auto bg-white sm:bg-transparent z-40 sm:z-auto shadow-md sm:shadow-none sm:flex-1 sm:justify-center`}
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-xl font-bold relative px-4 py-2 sm:py-1 rounded-xl ml-0 sm:ml-5 border-none group`
            }
          >
            {({ isActive }) => (
              <>
                Home
                <span
                  className={`
                    absolute left-0 -bottom-1 h-1 bg-blue-900 transition-all duration-300
                    ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                  `}
                ></span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/friends"
            className={({ isActive }) =>
              `text-xl font-bold relative px-4 py-2 sm:py-1 rounded-xl ml-0 sm:ml-5 border-none group`
            }
          >
            {({ isActive }) => (
              <>
                Friends
                <span
                  className={`
                    absolute left-0 -bottom-1 h-1 bg-blue-900 transition-all duration-300
                    ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                  `}
                ></span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/challenges"
            className={({ isActive }) =>
              `text-xl font-bold relative px-4 py-2 sm:py-1 rounded-xl ml-0 sm:ml-5 border-none group`
            }
          >
            {({ isActive }) => (
              <>
                Challenges
                <span
                  className={`
                    absolute left-0 -bottom-1 h-1 bg-blue-900 transition-all duration-300
                    ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                  `}
                ></span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/arena"
            className={({ isActive }) =>
              `text-xl font-bold relative px-4 py-2 sm:py-1 rounded-xl ml-0 sm:ml-5 border-none group`
            }
          >
            {({ isActive }) => (
              <>
                Arena
                <span
                  className={`
                    absolute left-0 -bottom-1 h-1 bg-blue-900 transition-all duration-300
                    ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                  `}
                ></span>
              </>
            )}
          </NavLink>

          {/* Mobile Account Controls */}
          <div className="sm:hidden w-full border-t mt-2 pt-2 px-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={userInfo?.avatar}
                alt="user"
                className="rounded-lg bg-blue-900/20 h-8 w-8 object-cover cursor-pointer"
                onClick={() => {
                  navigate('/profile');
                  setIsMobileMenuOpen(false);
                }}
                title="View Profile"
              />
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsMobileMenuOpen(false);
                }}
                className="text-blue-900 font-semibold"
              >
                Profile
              </button>
            </div>
            <button
              className="rounded px-3 py-2 bg-blue-900/90 text-white"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Account Section */}
  <div className="hidden sm:flex items-center ml-auto px-4 mr-5 gap-2">
          <img
            src={userInfo?.avatar}
            alt="user"
            className="rounded-lg bg-blue-900/40 h-10 w-10 object-cover cursor-pointer"
            onClick={() => {
              navigate('/profile');
            }}
            title="View Profile"
          />
          <button
            className="border-none rounded px-2 py-2 ml-3 bg-blue-900/90 text-white"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    )
  );
};

export default Navbar;
