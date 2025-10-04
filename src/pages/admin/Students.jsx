import { useState, useEffect } from 'react';
import { FaUser, FaTrophy, FaChartLine } from 'react-icons/fa';
import { firestoreService } from '../../services/firebase';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const [users, results] = await Promise.all([
        firestoreService.getAll('users'),
        firestoreService.getAll('examResults')
      ]);

      const studentData = users
        .filter(u => u.role === 'student')
        .map(student => {
          const studentResults = results.filter(r => r.studentId === student.uid);
          const totalExams = studentResults.length;
          const avgScore = totalExams > 0
            ? Math.round(studentResults.reduce((sum, r) => sum + r.percentage, 0) / totalExams)
            : 0;

          return {
            ...student,
            totalExams,
            avgScore,
            points: student.points || 0,
            level: student.level || 1
          };
        });

      setStudents(studentData);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Students</h1>
        <p className="text-gray-600 mt-1">View all registered students and their performance</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="card text-center py-12">
          <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No students registered yet</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Student</th>
                <th className="text-center py-3 px-4">Level</th>
                <th className="text-center py-3 px-4">Points</th>
                <th className="text-center py-3 px-4">Exams Taken</th>
                <th className="text-center py-3 px-4">Avg Score</th>
                <th className="text-left py-3 px-4">Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.uid} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {student.photoURL ? (
                        <img src={student.photoURL} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                          {student.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="font-semibold">{student.displayName || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">
                      {student.level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold">{student.points}</td>
                  <td className="py-3 px-4 text-center">{student.totalExams}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      student.avgScore >= 80 ? 'bg-green-100 text-green-800' :
                      student.avgScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.avgScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Students;
