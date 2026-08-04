import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FiMenu, FiX, FiChevronDown, FiUser, FiSettings, FiLock, FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/palm-reading", label: "Palm Analysis" },
    { path: "/tarot-reading", label: "Tarot Reading" },
    { path: "/profile", label: "Profile" },
  ];

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavClick = (e, path) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error("Please login to access this page.");
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    logout();
    setSettingsOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#161625] border-b border-violet-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">

          {/* Left Section: Logo & Subtitle */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-col">
              <span className="text-2xl font-bold text-violet-400 hover:text-violet-300 transition-colors leading-tight">
                Mystre AI
              </span>
              <span className="text-xs text-gray-400 font-normal">
                Palmistry &amp; Tarot Intelligence Platform
              </span>
            </Link>
          </div>

          {/* Right Section: Nav links + Auth (Login / Settings) */}
          <div className="hidden md:flex items-center justify-end gap-6">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                className={`${
                  location.pathname === item.path
                    ? "text-violet-400 font-semibold"
                    : "text-gray-200"
                } hover:text-violet-400 transition-colors cursor-pointer text-base`}
              >
                {item.label}
              </a>
            ))}

            {!isAuthenticated ? (
              /* Before Login: Login Button */
              <Link
                to="/login"
                className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-5 py-2 rounded-xl transition duration-200 shadow-md hover:shadow-violet-600/30"
              >
                Login
              </Link>
            ) : (
              /* After Login: Settings Dropdown */
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setSettingsOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-[#1f1f33] hover:bg-[#282846] text-white px-4 py-2 rounded-xl border border-violet-700/40 transition duration-200 font-medium"
                >
                  <span>Settings</span>
                  <FiChevronDown
                    className={`transition-transform duration-200 ${
                      settingsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {settingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-[#181829] border border-violet-700/50 rounded-xl shadow-2xl overflow-hidden z-50 py-1.5"
                    >
                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          navigate("/profile");
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-violet-600/20 hover:text-violet-300 w-full text-left transition-colors font-medium"
                      >
                        <FiUser className="text-violet-400" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          navigate("/profile");
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-violet-600/20 hover:text-violet-300 w-full text-left transition-colors font-medium"
                      >
                        <FiSettings className="text-violet-400" />
                        <span>Account Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          navigate("/profile");
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-violet-600/20 hover:text-violet-300 w-full text-left transition-colors font-medium"
                      >
                        <FiLock className="text-violet-400" />
                        <span>Change Password</span>
                      </button>

                      <div className="border-t border-violet-700/30 my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full text-left transition-colors font-semibold"
                      >
                        <FiLogOut />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-violet-900/30"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#181829] border-t border-violet-700/40 px-6 py-4 space-y-3"
          >
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavClick(e, item.path);
                }}
                className={`block py-2 text-base ${
                  location.pathname === item.path
                    ? "text-violet-400 font-semibold"
                    : "text-gray-200"
                } hover:text-violet-400 transition-colors`}
              >
                {item.label}
              </a>
            ))}

            <div className="border-t border-violet-700/30 pt-3">
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 rounded-xl transition duration-200"
                >
                  Login
                </Link>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="flex items-center gap-3 w-full text-left py-2 text-gray-200 hover:text-violet-300 font-medium"
                  >
                    <FiUser className="text-violet-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="flex items-center gap-3 w-full text-left py-2 text-gray-200 hover:text-violet-300 font-medium"
                  >
                    <FiSettings className="text-violet-400" />
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="flex items-center gap-3 w-full text-left py-2 text-gray-200 hover:text-violet-300 font-medium"
                  >
                    <FiLock className="text-violet-400" />
                    <span>Change Password</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left py-2 text-red-400 hover:text-red-300 font-semibold pt-2"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
