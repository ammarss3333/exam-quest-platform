import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, 
  FaCheckCircle, FaTimesCircle, FaFileImport, FaFileExport 
} from 'react-icons/fa';
import { firestoreService } from '../../services/firebase';
import QuestionModal from '../../components/admin/QuestionModal';
import ImportModal from '../../components/admin/ImportModal';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    loadQuestions();
    loadCategories();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, filterCategory, filterType, filterDifficulty]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getAll('questions');
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await firestoreService.getAll('categories');
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(q => q.category === filterCategory);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(q => q.type === filterType);
    }

    // Difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty);
    }

    setFilteredQuestions(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await firestoreService.delete('questions', id);
        loadQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingQuestion(null);
    setShowModal(true);
  };

  const handleExport = () => {
    const exportData = {
      questions: questions.map(q => ({
        type: q.type,
        category: q.category,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        difficulty: q.difficulty,
        explanation: q.explanation
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return '📝';
      case 'true-false': return '✓✗';
      case 'short-answer': return '✍️';
      case 'drag-drop': return '🔄';
      default: return '❓';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Question Bank</h1>
          <p className="text-gray-600 mt-1">Manage your exam questions</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaFileImport />
            Import JSON
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaFileExport />
            Export JSON
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 btn-primary"
          >
            <FaPlus />
            Add Question
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="mcq">Multiple Choice</option>
            <option value="true-false">True/False</option>
            <option value="short-answer">Short Answer</option>
            <option value="drag-drop">Drag & Drop</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="input-field"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{questions.length}</p>
          <p className="text-gray-600 mt-1">Total Questions</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {questions.filter(q => q.difficulty === 'easy').length}
          </p>
          <p className="text-gray-600 mt-1">Easy</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {questions.filter(q => q.difficulty === 'medium').length}
          </p>
          <p className="text-gray-600 mt-1">Medium</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">
            {questions.filter(q => q.difficulty === 'hard').length}
          </p>
          <p className="text-gray-600 mt-1">Hard</p>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg">No questions found</p>
          <button onClick={handleAdd} className="btn-primary mt-4">
            Create Your First Question
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(question.type)}</span>
                    <span className={`badge ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className="badge bg-blue-100 text-blue-800">
                      {question.category}
                    </span>
                    <span className="badge bg-purple-100 text-purple-800">
                      {question.points} pts
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {question.question}
                  </h3>
                  {question.type === 'mcq' && question.options && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {question.options.map((option, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-2 rounded-lg text-sm ${
                            option === question.correctAnswer
                              ? 'bg-green-100 text-green-800 font-semibold'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {option === question.correctAnswer && <FaCheckCircle className="inline mr-2" />}
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(question)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <QuestionModal
          question={editingQuestion}
          categories={categories}
          onClose={() => {
            setShowModal(false);
            setEditingQuestion(null);
          }}
          onSave={() => {
            loadQuestions();
            setShowModal(false);
            setEditingQuestion(null);
          }}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={() => {
            loadQuestions();
            setShowImportModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Questions;
