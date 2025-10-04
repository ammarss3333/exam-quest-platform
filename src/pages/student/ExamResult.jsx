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
