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
