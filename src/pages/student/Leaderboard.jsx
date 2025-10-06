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
                    <img src={student.photoURL ? student.photoURL : 'https://via.placeholder.com/40'} alt="" className="w-12 h-12 rounded-full" />
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
