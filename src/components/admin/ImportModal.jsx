import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaFileUpload, FaCheckCircle } from 'react-icons/fa';
import { firestoreService } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

const ImportModal = ({ onClose, onImport }) => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/json') {
        setError('Please select a valid JSON file');
        return;
      }

      setFile(selectedFile);
      setError('');

      // Read and preview file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          setPreview(jsonData);
          setError('');
        } catch (err) {
          setError('Invalid JSON format');
          setFile(null);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!preview || !preview.questions) {
      setError('Invalid JSON structure. Must contain a "questions" array');
      return;
    }

    if (!currentUser) {
      setError('You must be signed in to import questions.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let imported = 0;
      let failed = 0;

      for (const question of preview.questions) {
        try {
          // Validate required fields
          if (!question.type || !question.category || !question.question) {
            failed++;
            continue;
          }

          // Add createdBy field
          const questionData = {
            ...question,
            createdBy: currentUser.uid,
            imageUrl: question.imageUrl || ''
          };

          await firestoreService.create('questions', questionData);
          imported++;
        } catch (err) {
          console.error('Error importing question:', err);
          failed++;
        }
      }

      setSuccess(`Successfully imported ${imported} questions${failed > 0 ? `. ${failed} failed.` : ''}`);
      
      setTimeout(() => {
        onImport();
      }, 2000);
    } catch (err) {
      setError('Failed to import questions. Please check the file format.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Import Questions from JSON</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <FaCheckCircle />
              {success}
            </div>
          )}

          {/* File Upload Area */}
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="json-upload"
              />
              <label htmlFor="json-upload" className="cursor-pointer flex flex-col items-center">
                <FaFileUpload className="text-6xl text-gray-400 mb-4" />
                <span className="text-blue-600 font-semibold text-lg">Click to upload JSON file</span>
                <span className="text-sm text-gray-500 mt-2">
                  Upload a JSON file containing questions
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-600 text-xl" />
                    <div>
                      <p className="font-semibold text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {preview?.questions?.length || 0} questions found
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* Preview */}
              {preview && preview.questions && (
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <h3 className="font-semibold text-gray-800 mb-3">Preview:</h3>
                  <div className="space-y-2">
                    {preview.questions.slice(0, 5).map((q, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge bg-blue-100 text-blue-800 text-xs">
                            {q.type}
                          </span>
                          <span className="badge bg-purple-100 text-purple-800 text-xs">
                            {q.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 truncate">{q.question}</p>
                      </div>
                    ))}
                    {preview.questions.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        ... and {preview.questions.length - 5} more questions
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* JSON Format Example */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Expected JSON Format:</h3>
            <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
{`{
  "questions": [
    {
      "type": "mcq",
      "category": "Mathematics",
      "question": "What is 2 + 2?",
      "options": ["2", "3", "4", "5"],
      "correctAnswer": "4",
      "points": 10,
      "difficulty": "easy",
      "explanation": "Basic addition",
      "imageUrl": "https://... (optional)"
    }
  ]
}`}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="btn-primary flex-1"
              disabled={!file || loading}
            >
              {loading ? 'Importing...' : 'Import Questions'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImportModal;
