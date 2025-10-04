import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaClipboardList, FaToggleOn, FaToggleOff, FaClock, FaTrophy } from 'react-icons/fa';
import { firestoreService } from '../../services/firebase';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: 30,
    passingScore: 60,
    selectedQuestions: [],
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examsData, questionsData, categoriesData] = await Promise.all([
        firestoreService.getAll('exams'),
        firestoreService.getAll('questions'),
        firestoreService.getAll('categories')
      ]);
      setExams(examsData);
      setQuestions(questionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter an exam title');
      return;
    }

    if (formData.selectedQuestions.length === 0) {
      alert('Please select at least one question');
      return;
    }

    try {
      const examData = {
        ...formData,
        totalQuestions: formData.selectedQuestions.length,
        totalPoints: formData.selectedQuestions.reduce((sum, qId) => {
          const q = questions.find(qu => qu.id === qId);
          return sum + (q?.points || 0);
        }, 0),
        updatedAt: new Date()
      };

      if (editingExam) {
        await firestoreService.update('exams', editingExam.id, examData);
        alert('Exam updated successfully!');
      } else {
        await firestoreService.create('exams', {
          ...examData,
          createdAt: new Date()
        });
        alert('Exam created successfully!');
      }
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Error saving exam: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      duration: 30,
      passingScore: 60,
      selectedQuestions: [],
      isActive: true
    });
    setEditingExam(null);
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description || '',
      category: exam.category || '',
      duration: exam.duration || 30,
      passingScore: exam.passingScore || 60,
      selectedQuestions: exam.selectedQuestions || [],
      isActive: exam.isActive !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this exam? This cannot be undone.')) {
      return;
    }

    try {
      await firestoreService.delete('exams', id);
      alert('Exam deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Error deleting exam: ' + error.message);
    }
  };

  const toggleActive = async (exam) => {
    try {
      await firestoreService.update('exams', exam.id, {
        isActive: !exam.isActive
      });
      loadData();
    } catch (error) {
      console.error('Error toggling exam status:', error);
      alert('Error updating exam status: ' + error.message);
    }
  };

  const toggleQuestionSelection = (questionId) => {
    setFormData(prev => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.includes(questionId)
        ? prev.selectedQuestions.filter(id => id !== questionId)
        : [...prev.selectedQuestions, questionId]
    }));
  };

  const filteredQuestions = formData.category
    ? questions.filter(q => q.category === formData.category)
    : questions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Exams</h1>
          <p className="text-gray-600 mt-1">Create and manage exams for students</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Create Exam
        </button>
      </div>

      {/* Exams List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading exams...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="card text-center py-12">
          <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No exams yet</h3>
          <p className="text-gray-600 mb-4">Create your first exam to get started</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <FaPlus className="inline mr-2" /> Create Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{exam.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      exam.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {exam.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {exam.description && (
                    <p className="text-gray-600 mb-3">{exam.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Passing:</span>
                      <span>{exam.passingScore}%</span>
                    </div>
                    {exam.category && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                          {exam.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(exam)}
                    className={`p-2 rounded-lg transition-colors ${
                      exam.isActive
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title={exam.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {exam.isActive ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                  </button>
                  <button
                    onClick={() => handleEdit(exam)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingExam ? 'Edit Exam' : 'Create Exam'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Mathematics Final Exam"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input w-full"
                    rows="2"
                    placeholder="Brief description of the exam"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, selectedQuestions: [] })}
                    className="input w-full"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="input w-full"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%) *
                  </label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                    className="input w-full"
                    min="0"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Active (visible to students)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Questions * ({formData.selectedQuestions.length} selected)
                </label>
                <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto p-4 space-y-2">
                  {filteredQuestions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No questions available. Please create questions first.
                    </p>
                  ) : (
                    filteredQuestions.map((question) => (
                      <label
                        key={question.id}
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedQuestions.includes(question.id)}
                          onChange={() => toggleQuestionSelection(question.id)}
                          className="mt-1 w-4 h-4 text-purple-600 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-gray-800">{question.question}</p>
                          <div className="flex gap-2 mt-1 text-xs text-gray-600">
                            <span className="px-2 py-1 bg-gray-100 rounded">{question.type}</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                              {question.points} pts
                            </span>
                            {question.category && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {question.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingExam ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
