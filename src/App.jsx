import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Questions from './pages/admin/Questions';
import Categories from './pages/admin/Categories';
import Exams from './pages/admin/Exams';
import Students from './pages/admin/Students';

// Student Pages
import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './pages/student/Dashboard';
import StudentExams from './pages/student/Exams';
import TakeExam from './pages/student/TakeExam';
import ExamResult from './pages/student/ExamResult';
import Results from './pages/student/Results';
import Leaderboard from './pages/student/Leaderboard';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && userProfile?.role !== 'admin') {
    return <Navigate to="/student" replace />;
  }

  if (!adminOnly && userProfile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Main App Component
function AppRoutes() {
  const { currentUser, userProfile } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/" 
        element={
          currentUser ? (
            userProfile?.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/student" replace />
            )
          ) : (
            <Login />
          )
        } 
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="questions" element={<Questions />} />
        <Route path="categories" element={<Categories />} />
        <Route path="exams" element={<Exams />} />
        <Route path="students" element={<Students />} />
      </Route>

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="exams" element={<StudentExams />} />
        <Route path="exam/:examId" element={<TakeExam />} />
        <Route path="exam-result/:examId" element={<ExamResult />} />
        <Route path="results" element={<Results />} />
        <Route path="leaderboard" element={<Leaderboard />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter basename="/exam-quest-platform">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
