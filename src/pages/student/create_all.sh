#!/bin/bash

# Student Dashboard
cat > Dashboard.jsx << 'EOF'
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
EOF

# Student Exams List
cat > Exams.jsx << 'EOF'
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaClock, FaTrophy } from 'react-icons/fa';
import { firestoreService } from '../../services/firebase';

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await firestoreService.getAll('exams');
      const activeExams = data.filter(e => e.isActive !== false);
      setExams(activeExams);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Available Exams</h1>
        <p className="text-gray-600 mt-1">Choose an exam to test your knowledge</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : exams.length === 0 ? (
        <div className="card text-center py-12">
          <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No exams available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="card hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{exam.title}</h3>
              {exam.description && <p className="text-gray-600 mb-4">{exam.description}</p>}
              
              <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaClipboardList className="text-purple-600" />
                  <span>{exam.totalQuestions} Questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaTrophy className="text-yellow-600" />
                  <span>{exam.totalPoints} Points</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  <span>{exam.duration} Minutes</span>
                </div>
              </div>

              <Link to={`/student/exam/${exam.id}`} className="btn-primary w-full text-center">
                Start Exam
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentExams;
EOF

# Exam Result
cat > ExamResult.jsx << 'EOF'
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaTrophy, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { firestoreService } from '../../services/firebase';

const ExamResult = () => {
  const { examId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, [examId]);

  const loadResult = async () => {
    try {
      const results = await firestoreService.getAll('examResults');
      const found = results.find(r => r.examId === examId);
      setResult(found);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600 mb-4">Result not found</p>
        <Link to="/student/results" className="btn-primary">View All Results</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card text-center bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <FaTrophy className="text-6xl mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Exam Completed!</h1>
        <p className="text-xl">{result.examTitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-gray-600 mb-2">Your Score</p>
          <p className="text-4xl font-bold text-purple-600">{result.score}/{result.totalPoints}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 mb-2">Percentage</p>
          <p className="text-4xl font-bold text-blue-600">{result.percentage}%</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 mb-2">Status</p>
          <p className={`text-2xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
            {result.passed ? 'PASSED' : 'FAILED'}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/student/exams" className="btn-primary flex-1 text-center">
          Take Another Exam
        </Link>
        <Link to="/student/results" className="btn-secondary flex-1 text-center">
          View All Results
        </Link>
      </div>
    </div>
  );
};

export default ExamResult;
EOF

# Results History
cat > Results.jsx << 'EOF'
import { useState, useEffect } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import { firestoreService } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

const Results = () => {
  const { userProfile } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const data = await firestoreService.getWhere('examResults', 'studentId', '==', userProfile.uid);
      setResults(data.sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0)));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Exam Results</h1>
        <p className="text-gray-600 mt-1">Your complete exam history</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="card text-center py-12">
          <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No exam results yet</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Exam</th>
                <th className="text-center py-3 px-4">Score</th>
                <th className="text-center py-3 px-4">Percentage</th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{result.examTitle}</td>
                  <td className="py-3 px-4 text-center">{result.score}/{result.totalPoints}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      result.percentage >= 80 ? 'bg-green-100 text-green-800' :
                      result.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {result.completedAt && new Date(result.completedAt.seconds * 1000).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Results;
EOF

# Leaderboard
cat > Leaderboard.jsx << 'EOF'
import { useState, useEffect } from 'react';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import { firestoreService } from '../../services/firebase';

const Leaderboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const users = await firestoreService.getAll('users');
      const studentData = users
        .filter(u => u.role === 'student')
        .map(s => ({ ...s, points: s.points || 0, level: s.level || 1 }))
        .sort((a, b) => b.points - a.points);
      setStudents(studentData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
        <p className="text-gray-600 mt-1">Top students by points</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="card text-center py-12">
          <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No students yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((student, index) => (
            <div key={student.uid} className={`card ${index < 3 ? 'border-2 border-yellow-400' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-gray-400 w-12 text-center">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                
                <div className="flex items-center gap-3 flex-1">
                  {student.photoURL ? (
                    <img src={student.photoURL} alt="" className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {student.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{student.displayName || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">Level {student.level}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{student.points}</p>
                  <p className="text-sm text-gray-600">points</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
EOF

echo "All student pages created!"
