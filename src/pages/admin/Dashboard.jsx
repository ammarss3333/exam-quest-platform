import { useState, useEffect } from 'react';
import { FaUsers, FaClipboardList, FaQuestionCircle, FaChartLine, FaTrophy, FaFolder } from 'react-icons/fa';
import { firestoreService } from '../../services/firebase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuestions: 0,
    totalExams: 0,
    totalCategories: 0,
    activeExams: 0,
    totalSubmissions: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [users, questions, exams, categories, results] = await Promise.all([
        firestoreService.getAll('users'),
        firestoreService.getAll('questions'),
        firestoreService.getAll('exams'),
        firestoreService.getAll('categories'),
        firestoreService.getAll('examResults')
      ]);

      const students = users.filter(u => u.role === 'student');
      const activeExams = exams.filter(e => e.isActive !== false);

      setStats({
        totalStudents: students.length,
        totalQuestions: questions.length,
        totalExams: exams.length,
        totalCategories: categories.length,
        activeExams: activeExams.length,
        totalSubmissions: results.length
      });

      const recent = results
        .sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0))
        .slice(0, 10)
        .map(r => ({
          ...r,
          studentName: users.find(u => u.uid === r.studentId)?.displayName || 'Unknown',
          examName: exams.find(e => e.id === r.examId)?.title || 'Unknown Exam'
        }));

      setRecentActivity(recent);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: FaUsers, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Questions', value: stats.totalQuestions, icon: FaQuestionCircle, color: 'from-purple-500 to-purple-600' },
    { title: 'Total Exams', value: stats.totalExams, icon: FaClipboardList, color: 'from-green-500 to-green-600' },
    { title: 'Active Exams', value: stats.activeExams, icon: FaTrophy, color: 'from-yellow-500 to-yellow-600' },
    { title: 'Categories', value: stats.totalCategories, icon: FaFolder, color: 'from-pink-500 to-pink-600' },
    { title: 'Submissions', value: stats.totalSubmissions, icon: FaChartLine, color: 'from-indigo-500 to-indigo-600' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your exam platform</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat, index) => (
              <div key={index} className={`card bg-gradient-to-br ${stat.color} text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                    <p className="text-4xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <stat.icon className="text-5xl text-white/30" />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Submissions</h2>
            {recentActivity.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No submissions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Student</th>
                      <th className="text-left py-3 px-4">Exam</th>
                      <th className="text-center py-3 px-4">Score</th>
                      <th className="text-center py-3 px-4">%</th>
                      <th className="text-left py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((a, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{a.studentName}</td>
                        <td className="py-3 px-4">{a.examName}</td>
                        <td className="py-3 px-4 text-center">{a.score}/{a.totalPoints}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded text-sm ${a.percentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {a.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{a.completedAt && new Date(a.completedAt.seconds * 1000).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;