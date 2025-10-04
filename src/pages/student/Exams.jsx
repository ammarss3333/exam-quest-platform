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
