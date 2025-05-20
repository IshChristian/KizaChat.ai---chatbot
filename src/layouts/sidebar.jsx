import { useState, useEffect } from "react";
import { X, Plus,RefreshCw, Search, Clock, User, MoreVertical, Trash, LogOut, Lock, FileText, AlertTriangle, Menu } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Auth Modal Component
const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-2xl font-semibold mb-6">Sign in to continue</h2>
        
        <div className="space-y-4">
          <a 
            href="/login"
            className="block w-full text-center py-3 px-4 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Sign In
          </a>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          <a 
            href="/register"
            className="block w-full text-center py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
};

const sidebarItems = [
  { Icon: Plus, name: "New Chat", path: "/" },
];

const SidebarButton = ({ Icon, name, isExpanded, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
    <Icon className="h-5 w-5" />
    {isExpanded && <span className="ml-2 text-sm">{name}</span>}
  </button>
);

const ChatItem = ({ chat, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 flex items-center justify-between cursor-pointer">
      <span className="text-sm truncate flex-grow" onClick={() => navigate(`/chat/${chat.chatID}`)}>{chat.question}</span>
      <button onClick={(e) => { e.stopPropagation(); onDelete(chat.chatID); }} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
        <Trash className="h-4 w-4" />
      </button>
    </div>
  );
};

// Feedback Message Component
const FeedbackMessage = ({ message, type }) => {
  if (!message) return null;
  
  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const textColor = type === "success" ? "text-green-700" : "text-red-700";
  
  return (
    <div className={`${bgColor} ${textColor} p-3 rounded-lg mb-4 text-sm`}>
      {message}
    </div>
  );
};

const ProfilePanel = ({ isOpen, onClose, userEmail }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [userHasPassword, setUserHasPassword] = useState(true);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SERVER_API_URL


  useEffect(() => {
    if (isOpen && userEmail) {
      // Check if user has a password
      axios.get(`${BASE_URL}/users/check-password/${encodeURIComponent(userEmail)}`)
        .then(res => {
          setUserHasPassword(res.data.Password);
        })
        .catch(err => {
          console.error("Error checking password status:", err);
          setUserHasPassword(true); // Default to assuming they have a password
        });
    }
  }, [isOpen, userEmail]);

  const handlePasswordChange = async () => {
    try {
      if (userHasPassword == 'DefaultPassword@2025') {
        // Create password for the first time
        await axios.put(`${BASE_URL}/users/password`, {
          email: userEmail,
          currentPassword: 'DefaultPassword@2025',
          newPassword
        });
        setFeedback({ 
          message: "Password created successfully", 
          type: "success" 
        });
      } else {
        // Update existing password
        await axios.put(`${BASE_URL}/users/password`, {
          email: userEmail,
          currentPassword,
          newPassword
        });
        setFeedback({ 
          message: "Password updated successfully", 
          type: "success" 
        });
      }
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setFeedback({ 
        message: error.response?.data?.message || "Failed to update password", 
        type: "error" 
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!currentPassword) {
        setFeedback({ 
          message: "Password is required to delete account", 
          type: "error" 
        });
        return;
      }
      
      await axios.delete(`${BASE_URL}/users/delete/${encodeURIComponent(userEmail)}`, {
        data: { password: currentPassword }
      });
      
      document.cookie = "email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "picture=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      navigate("/login");
    } catch (error) {
      setShowDeleteModal(false);
      setFeedback({ 
        message: error.response?.data?.message || "Failed to delete account", 
        type: "error" 
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-y-0 right-0 w-80 bg-white border-l shadow-lg p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Profile Settings</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Feedback message */}
      <FeedbackMessage message={feedback.message} type={feedback.type} />

      {/* Account Details Section */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Account Details</h3>
        <p className="text-sm text-gray-600 mb-4">Email: {userEmail}</p>
        <div className="space-y-4">
          {userHasPassword && (
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handlePasswordChange}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {userHasPassword ? "Change Password" : "Create Password"}
          </button>
        </div>
      </div>

      {/* Legal and Policy Section */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Legal and Policy</h3>
        <div className="space-y-4">
          <button 
            className="w-full flex items-center justify-between px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/legal')}
          >
            <span>Terms and Conditions</span>
            <FileText className="h-4 w-4" />
          </button>
          <button 
            className="w-full flex items-center justify-between px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/policy')}
          >
            <span>Privacy Policy</span>
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-lg border border-red-200 p-4">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Delete Account</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
            
            <div className="mb-4">
              <input
                type="password"
                placeholder="Enter your password to confirm"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [visibleChats, setVisibleChats] = useState(5);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("Guest");
  const [userPicture, setUserPicture] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [chatError, setChatError] = useState(null);
  const navigate = useNavigate();

  const axiosInstance = axios.create({
    timeout: 10000, // 10 seconds timeout
  });

  const fetchRecentChats = async (email) => {
    if (!email) return;
    
    setIsLoadingChats(true);
    setChatError(null);
    
    try {
      const res = await axiosInstance.get(
        `https://kizachat-server.onrender.com/api/chat/recent/${encodeURIComponent(email)}`
      );
      setRecentChats(res.data.data || []);
      setIsLoadingChats(false);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setIsLoadingChats(false);
      setChatError("Unable to load recent chats. Server might be unavailable.");
    }
  };

  useEffect(() => {
    const getEmailFromCookies = () => {
      const cookies = document.cookie.split("; ");
      const emailCookie = cookies.find(row => row.startsWith("email="));
      return emailCookie ? decodeURIComponent(emailCookie.split("=")[1]) : null;
    };

    const getUserNameFromCookies = () => {
      const cookies = document.cookie.split("; ");
      const userNameCookie = cookies.find(row => row.startsWith("user_name="));
      return userNameCookie ? decodeURIComponent(userNameCookie.split("=")[1]) : "Guest";
    };

    const getPictureFromCookies = () => {
      const cookies = document.cookie.split("; ");
      const pictureCookie = cookies.find(row => row.startsWith("picture="));
      return pictureCookie ? decodeURIComponent(pictureCookie.split("=")[1]) : "";
    };

    const email = getEmailFromCookies();
    const name = getUserNameFromCookies();
    const picture = getPictureFromCookies();
    
    setUserEmail(email);
    setUserName(name);
    setUserPicture(picture);

    if (email) {
      fetchRecentChats(email);
    }
    
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('sidebar');
      const menuButton = document.getElementById('menu-button');
      if (isMobileMenuOpen && sidebar && !sidebar.contains(event.target) && !menuButton.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleDelete = async (chatID) => {
    await axios.delete(`https://kizachat-server.onrender.com/api/chat/chat/${chatID}`);
    setRecentChats(recentChats.filter(chat => chat.chatID !== chatID));
  };

  const handleLogout = () => {
    // Clear all relevant cookies
    document.cookie = "email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "picture=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Reset states
    setUserEmail("");
    setUserName("Guest");
    setUserPicture("");
    setRecentChats([]);
    
    // Navigate to login
    navigate("/login");
  };
  
  const handleAuthAction = () => {
    if (userEmail) {
      handleLogout();
    } else {
      navigate("/login");
    }
  };

  const handleRetryFetchChats = () => {
    fetchRecentChats(userEmail);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        id="menu-button"
        className="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 h-full bg-white border-r flex flex-col items-start py-4 transition-all duration-300 z-50
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${isExpanded ? 'md:w-64' : 'md:w-16'}
            ${isMobileMenuOpen ? 'w-1/2' : 'w-16'}`}
        onMouseEnter={() => !isMobileMenuOpen && setIsExpanded(true)}
        onMouseLeave={() => !isMobileMenuOpen && setIsExpanded(false)}
      >
        <div className="w-full px-4 mb-6 flex items-center justify-center mt-4 md:mt-0">
          <img 
            src={isExpanded || isMobileMenuOpen ? "/png/white-logo.png" : "/png/logo-gorilla.png"} 
            alt="Logo" 
            className={isExpanded || isMobileMenuOpen ? "h-8" : "h-8 w-8"} 
          />
        </div>

        <div className="w-full px-2 space-y-2">
          {sidebarItems.map((item, index) => (
            <SidebarButton 
              key={index} 
              Icon={item.Icon} 
              name={item.name} 
              isExpanded={isExpanded || isMobileMenuOpen} 
              onClick={() => {
                navigate(item.path || "#");
                setIsMobileMenuOpen(false);
              }} 
            />
          ))}
        </div>

        {(isExpanded || isMobileMenuOpen) && (
          <div className="w-full px-2 mt-6 space-y-2 flex-grow overflow-auto">
            <div className="flex justify-between items-center px-2 mb-2">
              <p className="text-xs font-semibold text-gray-500">Recent Chats</p>
              {userEmail && (
                <button 
                  onClick={handleRetryFetchChats} 
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                  title="Refresh chats"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              )}
            </div>
            
            {isLoadingChats ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : chatError ? (
              <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs">
                <p>{chatError}</p>
                <button 
                  onClick={handleRetryFetchChats}
                  className="mt-2 text-blue-500 hover:text-blue-700 text-xs flex items-center"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Retry
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {recentChats.length > 0 ? (
                    recentChats.slice(0, visibleChats).map((chat, index) => (
                      <ChatItem key={index} chat={chat} onDelete={handleDelete} />
                    ))
                  ) : userEmail ? (
                    <p className="text-xs text-gray-500 px-2">No recent chats found.</p>
                  ) : (
                    <p className="text-xs text-gray-500 px-2">Sign in to see your recent chats.</p>
                  )}
                </div>
                {visibleChats < recentChats.length && (
                  <button 
                    onClick={() => setVisibleChats(visibleChats + 5)}
                    className="w-full mt-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Load More
                  </button>
                )}
              </>
            )}
          </div>
        )}

        <div className="w-full px-2 mt-auto space-y-2">
          {userEmail && (
            <SidebarButton 
              Icon={User} 
              name="Profile" 
              isExpanded={isExpanded || isMobileMenuOpen} 
              onClick={() => {
                setShowProfilePanel(true);
                setIsMobileMenuOpen(false);
              }} 
            />
          )}
          <SidebarButton 
            Icon={LogOut} 
            name={userEmail ? "Logout" : "Login"} 
            isExpanded={isExpanded || isMobileMenuOpen} 
            onClick={() => {
              handleAuthAction();
              setIsMobileMenuOpen(false);
            }}
            className={userEmail ? "text-red-600" : "text-gray-700"}
          />
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <ProfilePanel 
        isOpen={showProfilePanel} 
        onClose={() => setShowProfilePanel(false)}
        userEmail={userEmail}
      />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}