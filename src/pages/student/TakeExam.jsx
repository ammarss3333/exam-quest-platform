import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import confetti from 'canvas-confetti';
import { 
  FaClock, FaCheckCircle, FaArrowRight, FaArrowLeft, 
  FaFlag, FaTimes 
} from 'react-icons/fa';
import { firestoreService } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

const DraggableItem = ({ item, index }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ITEM',
    item: { item, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg cursor-move shadow-lg hover:shadow-xl transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {item}
    </div>
  );
};

const DropZone = ({ match, onDrop, droppedItem }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'ITEM',
    drop: (item) => onDrop(item.item, match),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`border-2 border-dashed rounded-lg p-4 min-h-[60px] transition-all ${
        isOver
          ? 'border-blue-500 bg-blue-50'
          : droppedItem
          ? 'border-green-500 bg-green-50'
          : 'border-gray-300 bg-gray-50'
      }`}
    >
      <p className="text-sm font-semibold text-gray-700 mb-2">{match}</p>
      {droppedItem && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg text-sm">
          {droppedItem}
        </div>
      )}
    </div>
  );
};

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragDropAnswers, setDragDropAnswers] = useState({});

  useEffect(() => {
    loadExam();
  }, [examId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && exam) {
      handleSubmit();
    }
  }, [timeLeft]);

  const loadExam = async () => {
    try {
      setLoading(true);
      const examData = await firestoreService.getOne('exams', examId);
      
      if (!examData) {
        alert('Exam not found');
        navigate('/student/exams');
        return;
      }

      setExam(examData);
      setTimeLeft(examData.duration * 60); // Convert minutes to seconds

      // Load questions
      const questionPromises = examData.questions.map(qId =>
        firestoreService.getOne('questions', qId)
      );
      const loadedQuestions = await Promise.all(questionPromises);
      setQuestions(loadedQuestions.filter(q => q !== null));
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Failed to load exam');
      navigate('/student/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer
    });
  };

  const handleDragDrop = (item, match) => {
    const currentAnswers = dragDropAnswers[currentQuestionIndex] || {};
    setDragDropAnswers({
      ...dragDropAnswers,
      [currentQuestionIndex]: {
        ...currentAnswers,
        [match]: item
      }
    });

    // Convert to array format for final answer
    const pairs = Object.entries({
      ...currentAnswers,
      [match]: item
    }).map(([match, item]) => ({ item, match }));
    
    handleAnswer(pairs);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    let totalPoints = 0;

    questions.forEach((question, index) => {
      totalPoints += question.points;
      const userAnswer = answers[index];

      if (!userAnswer) return;

      if (question.type === 'drag-drop') {
        // Check drag-drop answers
        const correctPairs = question.correctAnswer;
        const userPairs = userAnswer;

        if (Array.isArray(userPairs) && Array.isArray(correctPairs)) {
          let correctMatches = 0;
          userPairs.forEach(userPair => {
            const isCorrect = correctPairs.some(
              correctPair => 
                correctPair.item === userPair.item && 
                correctPair.match === userPair.match
            );
            if (isCorrect) correctMatches++;
          });

          if (correctMatches === correctPairs.length) {
            score += question.points;
          }
        }
      } else if (question.type === 'short-answer') {
        // Case-insensitive comparison for short answers
        if (userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
          score += question.points;
        }
      } else {
        // Direct comparison for MCQ, True/False, Reading Comprehension
        if (userAnswer === question.correctAnswer) {
          score += question.points;
        }
      }
    });

    return { score, totalPoints };
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0 && timeLeft > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);

    try {
      const { score, totalPoints } = calculateScore();
      const percentage = (score / totalPoints) * 100;

      // Save result
      const resultData = {
        examId,
        examTitle: exam.title,
        studentId: currentUser.uid,
        studentName: userProfile.displayName,
        answers: Object.entries(answers).map(([index, answer]) => ({
          questionIndex: parseInt(index),
          questionId: questions[parseInt(index)].id,
          answer
        })),
        score,
        totalPoints,
        percentage: Math.round(percentage),
        completedAt: new Date(),
        timeTaken: (exam.duration * 60) - timeLeft
      };

      await firestoreService.create('examResults', resultData);

      // Update user points and level
      const pointsEarned = Math.round(score);
      const newPoints = (userProfile.points || 0) + pointsEarned;
      const newLevel = Math.floor(newPoints / 100) + 1;

      await updateUserProfile({
        points: newPoints,
        level: newLevel
      });

      // Celebration if passed
      if (percentage >= (exam.passingScore || 60)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Navigate to results
      navigate(`/student/exam-result/${examId}`, { 
        state: { score, totalPoints, percentage, pointsEarned } 
      });
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <FaClock />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="progress-bar h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="card"
          >
            {/* Question Header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="badge bg-purple-100 text-purple-800">
                {currentQuestion.type.replace('-', ' ')}
              </span>
              <span className="badge bg-blue-100 text-blue-800">
                {currentQuestion.category}
              </span>
              <span className="badge bg-yellow-100 text-yellow-800">
                {currentQuestion.points} points
              </span>
            </div>

            {/* Reading Passage */}
            {currentQuestion.type === 'reading-comprehension' && currentQuestion.passage && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📖 Reading Passage
                </h3>
                <p className="text-gray-700 leading-relaxed font-serif whitespace-pre-wrap">
                  {currentQuestion.passage}
                </p>
              </div>
            )}

            {/* Question Text */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {currentQuestion.question}
            </h2>

            {/* Question Image */}
            {currentQuestion.imageUrl && (
              <div className="mb-6">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question" 
                  className="w-full max-h-96 object-contain rounded-lg border-2 border-gray-200"
                />
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-4 mt-6">
              {/* MCQ and Reading Comprehension */}
              {(currentQuestion.type === 'mcq' || currentQuestion.type === 'reading-comprehension') && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        answers[currentQuestionIndex] === option
                          ? 'border-purple-500 bg-purple-50 shadow-lg'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestionIndex] === option
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {answers[currentQuestionIndex] === option && (
                            <FaCheckCircle className="text-white text-sm" />
                          )}
                        </div>
                        <span className="font-medium text-gray-700">{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* True/False */}
              {currentQuestion.type === 'true-false' && (
                <div className="grid grid-cols-2 gap-4">
                  {['true', 'false'].map((option) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAnswer(option)}
                      className={`p-6 rounded-xl border-2 font-semibold text-lg transition-all ${
                        answers[currentQuestionIndex] === option
                          ? 'border-purple-500 bg-purple-50 shadow-lg'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {option === 'true' ? '✓ True' : '✗ False'}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Short Answer */}
              {currentQuestion.type === 'short-answer' && (
                <input
                  type="text"
                  value={answers[currentQuestionIndex] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="input-field text-lg"
                />
              )}

              {/* Drag and Drop */}
              {currentQuestion.type === 'drag-drop' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Drag items:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestion.options.map((item, index) => (
                        <DraggableItem key={index} item={item} index={index} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Drop to match:</h3>
                    <div className="space-y-3">
                      {currentQuestion.correctAnswer.map((pair, index) => (
                        <DropZone
                          key={index}
                          match={pair.match}
                          onDrop={handleDragDrop}
                          droppedItem={dragDropAnswers[currentQuestionIndex]?.[pair.match]}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaArrowLeft className="mr-2" />
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
              <FaFlag className="ml-2" />
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary">
              Next
              <FaArrowRight className="ml-2" />
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="card mt-6">
          <h3 className="font-semibold text-gray-700 mb-3">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`aspect-square rounded-lg font-semibold transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-purple-600 text-white'
                    : answers[index]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default TakeExam;
