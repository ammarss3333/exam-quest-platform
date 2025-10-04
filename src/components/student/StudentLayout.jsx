import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaHome, FaClipboardList, FaTrophy, FaChartLine, 
  FaSignOutAlt, FaBars, FaTimes, FaStar, FaFire
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { signOut, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { path: '/student', icon: FaHome, label: 'Dashboard', exact: true },
    { path: '/student/exams', icon: FaClipboardList, label: 'Exams' },
    { path: '/student/results', icon: FaChartLine, label: 'My Results' },
    { path: '/student/leaderboard', icon: FaTrophy, label: 'Leaderboard' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Calculate level progress
  const pointsForNextLevel = (userProfile?.level || 1) * 100;
  const currentLevelPoints = userProfile?.points || 0;
  const progressPercentage = (currentLevelPoints % 100) / 100 * 100;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-600 via-pink-600 to-blue-600 text-white shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">ExamQuest</h1>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg"
                  >
                    <FaTimes />
                  </button>
                </div>
                <p className="text-sm text-white/80 mt-2">Student Portal</p>
              </div>

              {/* User Stats Card */}
              <div className="p-4">
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={userProfile?.photoURL || 'https://via.placeholder.com/40'}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border-2 border-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{userProfile?.displayName}</p>
                      <div className="flex items-center gap-1 text-yellow-300">
                        <FaStar className="text-sm" />
                        <span className="text-sm">Level {userProfile?.level || 1}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* XP Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{userProfile?.points || 0} XP</span>
                      <span>{pointsForNextLevel} XP</span>
                    </div>
                    <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center justify-center gap-2 mt-3 bg-orange-500/30 rounded-lg py-2">
                    <FaFire className="text-orange-300" />
                    <span className="text-sm font-semibold">{userProfile?.streak || 0} Day Streak!</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.path, item.exact)
                        ? 'bg-white text-purple-600 shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <item.icon className="text-xl" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Sign Out */}
              <div className="p-4 border-t border-white/20">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-lg shadow-md px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
            >
              <FaBars className="text-xl" />
            </button>

            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                  <FaStar />
                  <span>{userProfile?.points || 0} XP</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                  <FaTrophy />
                  <span>Level {userProfile?.level || 1}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default StudentLayout;
