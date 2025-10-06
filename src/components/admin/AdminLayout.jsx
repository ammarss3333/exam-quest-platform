import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaHome, FaQuestionCircle, FaClipboardList, FaUsers, 
  FaChartBar, FaCog, FaSignOutAlt, FaBars, FaTimes,
  FaFolderOpen
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
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
    { path: '/admin', icon: FaHome, label: 'Dashboard', exact: true },
    { path: '/admin/questions', icon: FaQuestionCircle, label: 'Questions' },
    { path: '/admin/categories', icon: FaFolderOpen, label: 'Categories' },
    { path: '/admin/exams', icon: FaClipboardList, label: 'Exams' },
    { path: '/admin/students', icon: FaUsers, label: 'Students' },
    { path: '/admin/analytics', icon: FaChartBar, label: 'Analytics' },
    { path: '/admin/settings', icon: FaCog, label: 'Settings' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 to-purple-700 text-white shadow-2xl"
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
                <p className="text-sm text-white/80 mt-2">Admin Panel</p>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.path, item.exact)
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <item.icon className="text-xl" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* User Profile */}
              <div className="p-4 border-t border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={userProfile?.photoURL ? userProfile.photoURL : 'https://via.placeholder.com/40'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{userProfile?.displayName}</p>
                    <p className="text-xs text-white/80 truncate">{userProfile?.email}</p>
                  </div>
                </div>
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
        <header className="bg-white shadow-md px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
            >
              <FaBars className="text-xl" />
            </button>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                <span>👑</span>
                <span>Admin</span>
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

export default AdminLayout;
