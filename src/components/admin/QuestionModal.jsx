import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { firestoreService, storageService } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

const QuestionModal = ({ question, categories, onClose, onSave }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    type: 'mcq',
    category: '',
    question: '',
    passage: '', // For reading comprehension

    options: ['', '', '', ''],
    correctAnswer: '',
    points: 10,
    difficulty: 'medium',
    explanation: '',
    dragDropPairs: [{ item: '', match: '' }] // For drag-drop
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    if (question) {
setFormData({
        type: question.type || 'mcq',
        category: question.category || '',
        question: question.question || '',
        passage: question.passage || '',
        options: question.options || ['', '', '', ''],
        correctAnswer: question.correctAnswer || '',
        points: question.points || 10,
        difficulty: question.difficulty || 'medium',
        explanation: question.explanation || '',
        dragDropPairs: question.correctAnswer && Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [{ item: '', match: '' }]
      });

    }
  }, [question]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!currentUser) {
        setError('You must be signed in to save questions.');
        setLoading(false);
        return;
      }

      // Validation
      if (!formData.category || !formData.question) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }



      // Prepare data based on question type
      let dataToSave = {
        type: formData.type,
        category: formData.category,
        question: formData.question,
        imageUrl: imageUrl || '',
        points: parseInt(formData.points),
        difficulty: formData.difficulty,
        explanation: formData.explanation,
        createdBy: currentUser.uid
      };

      // Add passage for reading comprehension
      if (formData.type === 'reading-comprehension') {
        if (!formData.passage) {
          setError('Please provide a reading passage');
          setLoading(false);
          return;
        }
        dataToSave.passage = formData.passage;
        dataToSave.options = formData.options.filter(opt => opt.trim() !== '');
        dataToSave.correctAnswer = formData.correctAnswer;
      } else if (formData.type === 'mcq') {
        const validOptions = formData.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          setError('Please provide at least 2 options');
          setLoading(false);
          return;
        }
        dataToSave.options = validOptions;
        dataToSave.correctAnswer = formData.correctAnswer;
      } else if (formData.type === 'true-false') {
        dataToSave.correctAnswer = formData.correctAnswer;
      } else if (formData.type === 'short-answer') {
        dataToSave.correctAnswer = formData.correctAnswer;
      } else if (formData.type === 'drag-drop') {
        const validPairs = formData.dragDropPairs.filter(
          pair => pair.item.trim() !== '' && pair.match.trim() !== ''
        );
        if (validPairs.length < 2) {
          setError('Please provide at least 2 drag-drop pairs');
          setLoading(false);
          return;
        }
        dataToSave.items = validPairs.map(p => p.item);
        dataToSave.matches = validPairs.map(p => p.match);
        dataToSave.correctAnswer = validPairs;
      }

      // Save to Firestore
      if (question?.id) {
        await firestoreService.update('questions', question.id, dataToSave);
      } else {
        await firestoreService.create('questions', dataToSave);
      }

      onSave();
    } catch (err) {
      setError('Failed to save question. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleDragDropChange = (index, field, value) => {
    const newPairs = [...formData.dragDropPairs];
    newPairs[index][field] = value;
    setFormData({ ...formData, dragDropPairs: newPairs });
  };

  const addDragDropPair = () => {
    setFormData({
      ...formData,
      dragDropPairs: [...formData.dragDropPairs, { item: '', match: '' }]
    });
  };

  const removeDragDropPair = (index) => {
    const newPairs = formData.dragDropPairs.filter((_, i) => i !== index);
    setFormData({ ...formData, dragDropPairs: newPairs });
  };





  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {question ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Question Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field"
                required
              >
                <option value="mcq">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="short-answer">Short Answer</option>
                <option value="drag-drop">Drag & Drop</option>
                <option value="reading-comprehension">Reading Comprehension</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reading Passage (for reading comprehension) */}
          {formData.type === 'reading-comprehension' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reading Passage *
              </label>
              <textarea
                value={formData.passage}
                onChange={(e) => setFormData({ ...formData, passage: e.target.value })}
                className="input-field min-h-[200px] font-serif"
                placeholder="Enter the reading passage here..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Students will read this passage before answering the question
              </p>
            </div>
          )}

          {/* Question Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {formData.type === 'reading-comprehension' ? 'Question about the passage *' : 'Question *'}
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="input-field min-h-[100px]"
              placeholder="Enter your question here..."
              required
            />
          </div>



          {/* Options for MCQ and Reading Comprehension */}
          {(formData.type === 'mcq' || formData.type === 'reading-comprehension') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Answer Options *
              </label>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="input-field flex-1"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-3 text-red-600 hover:bg-red-100 rounded-lg"
                      disabled={formData.options.length <= 2}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <FaPlus /> Add Option
              </button>
            </div>
          )}

          {/* Correct Answer for MCQ, True/False, Short Answer, Reading Comprehension */}
          {formData.type !== 'drag-drop' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correct Answer *
              </label>
              {formData.type === 'true-false' ? (
                <select
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Answer</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : formData.type === 'mcq' || formData.type === 'reading-comprehension' ? (
                <select
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Correct Option</option>
                  {formData.options.filter(opt => opt.trim() !== '').map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  className="input-field"
                  placeholder="Enter the correct answer"
                  required
                />
              )}
            </div>
          )}

          {/* Drag-Drop Pairs */}
          {formData.type === 'drag-drop' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Drag & Drop Pairs *
              </label>
              <div className="space-y-3">
                {formData.dragDropPairs.map((pair, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={pair.item}
                      onChange={(e) => handleDragDropChange(index, 'item', e.target.value)}
                      className="input-field flex-1"
                      placeholder="Item to drag"
                    />
                    <span className="flex items-center text-gray-400">→</span>
                    <input
                      type="text"
                      value={pair.match}
                      onChange={(e) => handleDragDropChange(index, 'match', e.target.value)}
                      className="input-field flex-1"
                      placeholder="Match target"
                    />
                    <button
                      type="button"
                      onClick={() => removeDragDropPair(index)}
                      className="p-3 text-red-600 hover:bg-red-100 rounded-lg"
                      disabled={formData.dragDropPairs.length <= 2}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addDragDropPair}
                className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <FaPlus /> Add Pair
              </button>
            </div>
          )}

          {/* Points and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Points
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                className="input-field"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="input-field"
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="input-field min-h-[80px]"
              placeholder="Explain the correct answer..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default QuestionModal;
