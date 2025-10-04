import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaFire, FaStar, FaClipboardList } from 'react-icons/fa';
import { firestoreService } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({ totalExams: 0, averageScore: 0, totalPoints: 0 });
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const results = await firestoreService.getWhere('examResults', 'studentId', '==', userProfile.uid);
      setRecentExams(results.slice(0, 5));
      
      if (results.length > 0) {
        const totalScore = results.reduce((sum, r) => sum + r.percentage, 0);
        setStats({
          totalExams: results.length,
          averageScore: Math.round(totalScore / results.length),
          totalPoints: userProfile.points || 0
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.displayName}! 👋</h1>
        <p>Ready to level up your knowledge?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Points</p>
              <p className="text-3xl font-bold">{stats.totalPoints}</p>
            </div>
            <FaStar className="text-4xl text-white/30" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Exams Taken</p>
              <p className="text-3xl font-bold">{stats.totalExams}</p>
            </div>
            <FaClipboardList className="text-4xl text-white/30" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Average Score</p>
              <p className="text-3xl font-bold">{stats.averageScore}%</p>
            </div>
            <FaTrophy className="text-4xl text-white/30" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Recent Exams</h2>
          <Link to="/student/results" className="text-blue-600 hover:text-blue-700 font-semibold">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : recentExams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No exams taken yet</p>
            <Link to="/student/exams" className="btn-primary">Start Your First Exam</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentExams.map((exam, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-gray-800">{exam.examTitle}</h3>
                  <p className="text-sm text-gray-600">
                    {exam.completedAt && new Date(exam.completedAt.seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{exam.percentage}%</p>
                  <p className="text-xs text-gray-600">{exam.score}/{exam.totalPoints} points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/student/exams">
          <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-pointer hover:shadow-lg">
            <div className="flex items-center gap-4">
              <FaClipboardList className="text-4xl" />
              <div>
                <h3 className="text-xl font-bold">Take an Exam</h3>
                <p className="text-white/80">Challenge yourself today!</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/student/leaderboard">
          <div className="card bg-gradient-to-r from-yellow-500 to-orange-600 text-white cursor-pointer hover:shadow-lg">
            <div className="flex items-center gap-4">
              <FaTrophy className="text-4xl" />
              <div>
                <h3 className="text-xl font-bold">Leaderboard</h3>
                <p className="text-white/80">See where you rank!</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
