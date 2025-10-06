
import { useState, useEffect, useCallback } from 'react';
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

const DraggableItem = ({ item, index, onDragStart, isDropped }) => {
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
      className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg cursor-move shadow-lg hover:shadow-xl transition-all ${isDragging ? 'opacity-50' : 'opacity-100'} ${isDropped ? 'pointer-events-none opacity-70' : ''}`}
    >
      {item}
    </div>
  );
};

const DropZone = ({ match, onDrop, droppedItem, onRemove }) => {
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
      className={`border-2 border-dashed rounded-lg p-4 min-h-[60px] transition-all ${isOver ? 'border-blue-500 bg-blue-50' : droppedItem ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
    >
      <p className="text-sm font-semibold text-gray-700 mb-2">{match}</p>
      {droppedItem && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg text-sm flex justify-between items-center">
          {droppedItem}
          <button onClick={() => onRemove(match)} className="ml-2 text-white hover:text-red-200">
            <FaTimes />
          </button>
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
  }, [timeLeft, exam, handleSubmit]); // Added handleSubmit to dependency array

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
      const durationInMinutes = Number(examData.duration) || 0;
      setTimeLeft(durationInMinutes * 60); // Convert minutes to seconds

      const questionIds = Array.isArray(examData.selectedQuestions) ? examData.selectedQuestions : [];

      if (questionIds.length === 0) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const questionPromises = questionIds.map((qId) =>
        firestoreService.getOne("questions", qId)
      );
      const loadedQuestions = await Promise.all(questionPromises);
      setQuestions(
        loadedQuestions.filter((q) => q && typeof q === "object").map(q => ({ ...q, type: q.type || "mcq" }))
      );
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Failed to load exam');
      navigate('/student/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = useCallback((answer) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [currentQuestionIndex]: answer
    }));
  }, [currentQuestionIndex]);

  const handleDragDrop = useCallback((item, match) => {
    setDragDropAnswers(prevAnswers => {
      const currentQuestionAnswers = prevAnswers[currentQuestionIndex] || {};
      const newCurrentQuestionAnswers = { ...currentQuestionAnswers };

      // Check if the item is already dropped somewhere else for this question
      // Remove the item from its previous match if it was already dropped elsewhere
      for (const dropZoneMatch in newCurrentQuestionAnswers) {
        if (newCurrentQuestionAnswers[dropZoneMatch] === item) {
          delete newCurrentQuestionAnswers[dropZoneMatch];
          break;
        }
      }

      // Place the item in the new drop zone, overwriting any existing item in that zone
      newCurrentQuestionAnswers[match] = item;

      const updatedDragDropAnswers = {
        ...prevAnswers,
        [currentQuestionIndex]: newCurrentQuestionAnswers
      };

      // Convert to array format for final answer
      const pairs = Object.entries(newCurrentQuestionAnswers).map(([match, item]) => ({ item, match }));
      handleAnswer(pairs);

      return updatedDragDropAnswers;
    });
  }, [currentQuestionIndex, handleAnswer]);

  const handleRemoveDroppedItem = useCallback((match) => {
    setDragDropAnswers(prevAnswers => {
      const currentQuestionAnswers = prevAnswers[currentQuestionIndex] || {};
      const newCurrentQuestionAnswers = { ...currentQuestionAnswers };
      delete newCurrentQuestionAnswers[match];

      const updatedDragDropAnswers = {
        ...prevAnswers,
        [currentQuestionIndex]: newCurrentQuestionAnswers
      };

      const pairs = Object.entries(newCurrentQuestionAnswers).map(([match, item]) => ({ item, match }));
      handleAnswer(pairs);

      return updatedDragDropAnswers;
    });
  }, [currentQuestionIndex, handleAnswer]);

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

  const calculateScore = useCallback(() => {
    let score = 0;
    let totalPoints = 0;

    questions.forEach((question, index) => {
      const questionPoints = Number(question?.points) || 0;
      totalPoints += questionPoints;
      const userAnswer = answers[index];

      if (!userAnswer) return;

      const questionType = question?.type;

      if (questionType === 'drag-drop') {
        const correctPairs = Array.isArray(question?.correctAnswer)
          ? question.correctAnswer
          : [];
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

          if (correctPairs.length > 0 && correctMatches === correctPairs.length) {
            score += questionPoints;
          }
        }
      } else if (questionType === 'short-answer') {
        if (
          typeof userAnswer === 'string' &&
          typeof question?.correctAnswer === 'string' &&
          userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
        ) {
          score += questionPoints;
        }
      } else {
        if (
          (Array.isArray(question?.correctAnswer) &&
            JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)) ||
          userAnswer === question?.correctAnswer
        ) {
          score += questionPoints;
        }
      }
    });

    return { score, totalPoints };
  }, [questions, answers]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0 && timeLeft > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);

    try {
      if (!currentUser || !userProfile) {
        alert('You must be signed in to submit the exam.');
        setSubmitting(false);
        return;
      }

      const { score, totalPoints } = calculateScore();
      const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

      const resultData = {
        examId,
        examTitle: exam.title,
        studentId: currentUser.uid,
        studentName: userProfile.displayName,
        answers: Object.entries(answers).map(([index, answer]) => {
          const questionIndex = parseInt(index, 10);
          const questionAtIndex = questions[questionIndex] || {};
          return {
            questionIndex,
            questionId: questionAtIndex.id || null,
            answer
          };
        }),
        score,
        totalPoints,
        percentage: Math.round(percentage),
        completedAt: new Date(),
        timeTaken: (exam.duration * 60) - timeLeft
      };

      await firestoreService.create('examResults', resultData);

      const pointsEarned = Math.round(score);
      const newPoints = (userProfile.points || 0) + pointsEarned;
      const newLevel = Math.floor(newPoints / 100) + 1;

      await updateUserProfile({
        points: newPoints,
        level: newLevel
      });

      if (percentage >= (exam.passingScore || 60)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      navigate(`/student/exam-result/${examId}`, {
        state: { score, totalPoints, percentage, pointsEarned }
      });
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Please try again.');
      setSubmitting(false);
    }
  }, [submitting, questions, answers, timeLeft, currentUser, userProfile, calculateScore, exam, examId, updateUserProfile, navigate]);

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

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Exam unavailable
          </h2>
          <p className="text-gray-600">
            We couldn't load this exam right now. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No questions available
          </h2>
          <p className="text-gray-600">            This exam doesn't have any questions yet. Please contact your instructor.
          </p>

        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex] || {};
  const currentQuestionType = currentQuestion.type || 'mcq';
  const progress = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  const droppedItemsForCurrentQuestion = dragDropAnswers[currentQuestionIndex] || {};
  const isItemDropped = (item) => Object.values(droppedItemsForCurrentQuestion).includes(item);

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
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
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
                {currentQuestionType.replace('-', ' ')}
              </span>
              <span className="badge bg-blue-100 text-blue-800">
                {currentQuestion.category || 'General'}
              </span>
              <span className="badge bg-yellow-100 text-yellow-800">
                {(currentQuestion.points ?? 0)} points
              </span>
            </div>

            {/* Reading Passage */}
            {currentQuestionType === 'reading-comprehension' && currentQuestion.passage && (
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
              {currentQuestion.question || 'This question is unavailable.'}
            </h2>



            {/* Answer Options */}
            <div className="space-y-4 mt-6">
              {/* MCQ and Reading Comprehension */}
              {(currentQuestionType === 'mcq' || currentQuestionType === 'reading-comprehension') && currentQuestion && (
                <div className="space-y-3">
                  {(Array.isArray(currentQuestion.options) ? currentQuestion.options : []).map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQuestionIndex] === option ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestionIndex] === option ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
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
              {currentQuestionType === 'true-false' && (
                <div className="grid grid-cols-2 gap-4">
                  {['true', 'false'].map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQuestionIndex] === option ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestionIndex] === option ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
                          {answers[currentQuestionIndex] === option && (
                            <FaCheckCircle className="text-white text-sm" />
                          )}
                        </div>
                        <span className="font-medium text-gray-700">
                          {option === 'true' ? '✓ True' : '✗ False'}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Short Answer */}
              {currentQuestionType === 'short-answer' && (
                <input
                  type="text"
                  value={answers[currentQuestionIndex] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                />
              )}

              {/* Drag and Drop */}
              {currentQuestionType === 'drag-drop' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Items</h3>
                    {(Array.isArray(currentQuestion.items) ? currentQuestion.items : []).map((item, idx) => (
                      <DraggableItem
                        key={idx}
                        item={item}
                        index={idx}
                        onDragStart={() => {}}
                        isDropped={isItemDropped(item)}
                      />
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Matches</h3>
                    {(Array.isArray(currentQuestion.matches) ? currentQuestion.matches : []).map((match, idx) => (
                      <DropZone
                        key={idx}
                        match={match}
                        onDrop={handleDragDrop}
                        droppedItem={droppedItemsForCurrentQuestion[match]}
                        onRemove={handleRemoveDroppedItem}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0 || submitting}
                className="btn btn-secondary"
              >
                <FaArrowLeft className="inline-block mr-2" /> Previous
              </motion.button>
              {currentQuestionIndex < questions.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  Next <FaArrowRight className="inline-block ml-2" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn btn-success"
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </DndProvider>
  );
};

export default TakeExam;

