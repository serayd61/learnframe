'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const QUIZ_QUESTIONS = [
  { id: 1, question: "What is the native token of Base?", answer: "ETH" },
  { id: 2, question: "Which company developed Base?", answer: "Coinbase" },
  { id: 3, question: "What is Base built on?", answer: "Optimism" },
  { id: 4, question: "Is Base EVM compatible? (yes/no)", answer: "Yes" },
  { id: 5, question: "What type of network is Base? (Layer1/Layer2)", answer: "Layer2" },
  { id: 6, question: "What is Base's underlying blockchain?", answer: "Ethereum" },
  { id: 7, question: "What year was Base launched?", answer: "2023" },
  { id: 8, question: "What type of rollup is Base? (Optimistic/ZK)", answer: "Optimistic" },
  { id: 9, question: "Are gas fees on Base higher or lower than Ethereum?", answer: "Lower" },
  { id: 10, question: "What is the name of Base's major upgrade?", answer: "Bedrock" }
];

export function BatchQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(10).fill(''));
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const { writeContract: startSession } = useWriteContract();
  const { writeContract: submitAnswers, data: submitHash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: submitHash });

  const handleStartQuiz = async () => {
    try {
      await startSession({
        address: process.env.NEXT_PUBLIC_BATCH_QUIZ as `0x${string}`,
        abi: [{ name: 'startQuizSession', type: 'function', inputs: [], outputs: [] }],
        functionName: 'startQuizSession',
      });
      setQuizStarted(true);
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < 9) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitAll = async () => {
    if (answers.some(a => !a.trim())) {
      alert('Please answer all questions before submitting!');
      return;
    }

    try {
      await submitAnswers({
        address: process.env.NEXT_PUBLIC_BATCH_QUIZ as `0x${string}`,
        abi: [{
          name: 'submitBatchAnswers',
          type: 'function',
          inputs: [{ name: 'userAnswers', type: 'string[10]' }],
          outputs: []
        }],
        functionName: 'submitBatchAnswers',
        args: [answers],
      });
      setQuizCompleted(true);
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  const checkAnswers = () => {
    let correct = 0;
    answers.forEach((answer, i) => {
      if (answer.toLowerCase() === QUIZ_QUESTIONS[i].answer.toLowerCase()) {
        correct++;
      }
    });
    return correct;
  };

  if (isSuccess && quizCompleted) {
    const correctCount = checkAnswers();
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">
            {correctCount === 10 ? '🎉 Perfect Score!' : '📊 Quiz Completed'}
          </h2>
          <p className="text-2xl mb-6">
            You got {correctCount}/10 correct
          </p>
          {correctCount === 10 ? (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
              <p className="text-xl">Congratulations! You earned 100 LEARN tokens!</p>
            </div>
          ) : (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6">
              <p className="text-xl">You need all 10 correct to earn tokens. Try again!</p>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
          >
            Try Another Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Base Blockchain Quiz</h2>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-3">📋 Quiz Rules:</h3>
          <ul className="space-y-2">
            <li>• 10 questions about Base blockchain</li>
            <li>• You must get ALL 10 correct to earn tokens</li>
            <li>• 100 LEARN tokens for perfect score</li>
            <li>• Only 1 transaction at the end</li>
            <li>• 30 minutes time limit</li>
          </ul>
        </div>
        <button
          onClick={handleStartQuiz}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold text-lg"
        >
          Start Quiz Session →
        </button>
      </div>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Question {currentQuestion + 1} of 10</span>
          <span>{answers.filter(a => a).length}/10 Answered</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">{question.question}</h3>
        <input
          type="text"
          value={answers[currentQuestion]}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder="Type your answer..."
          className="w-full px-4 py-3 bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
        <p className="text-sm text-gray-400 mt-2">Hint: {question.answer.length} characters</p>
      </div>

      {/* Answer Status Grid */}
      <div className="grid grid-cols-10 gap-2 mb-6">
        {answers.map((answer, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuestion(i)}
            className={`py-2 rounded-lg text-sm font-bold ${
              i === currentQuestion ? 'bg-blue-600' :
              answer ? 'bg-green-600/50' : 'bg-slate-700'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg font-bold"
        >
          ← Previous
        </button>

        {currentQuestion === 9 ? (
          <button
            onClick={handleSubmitAll}
            disabled={isLoading || answers.some(a => !a.trim())}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 rounded-lg font-bold text-lg"
          >
            {isLoading ? 'Submitting...' : 'Submit All Answers'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
