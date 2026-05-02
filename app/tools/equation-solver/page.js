'use client'
import { useState } from 'react';
import { Calculator, Trash2, Info, Check } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function EquationSolver() {
  const [equation, setEquation] = useState('');
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const solveEquation = () => {
    setError('');
    setResult(null);
    setSteps([]);

    try {
      // Remove spaces and convert to lowercase
      const eq = equation.trim().toLowerCase();
      
      if (!eq.includes('=')) {
        setError('Equation must contain an equals sign (=)');
        return;
      }

      const [leftSide, rightSide] = eq.split('=').map(s => s.trim());
      
      if (!leftSide || !rightSide) {
        setError('Both sides of the equation must have values');
        return;
      }

      // Check if it's a valid linear equation
      const variable = 'x';
      const solution = solveLinearEquation(leftSide, rightSide);
      
      if (solution !== null) {
        setResult(solution);
        setHistory(prev => [{
          equation: eq,
          solution: solution,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 4)]);
      } else {
        setError('Unable to solve this equation. Please try a linear equation in x.');
      }
    } catch (err) {
      setError('Invalid equation format. Please check your input.');
    }
  };

  const solveLinearEquation = (left, right) => {
    try {
      // Parse both sides to extract coefficients
      const leftCoeff = parseExpression(left);
      const rightCoeff = parseExpression(right);
      
      const stepsArray = [];
      stepsArray.push(`Original equation: ${left} = ${right}`);
      
      // Move all x terms to left and constants to right
      const xCoeff = leftCoeff.x - rightCoeff.x;
      const constant = rightCoeff.constant - leftCoeff.constant;
      
      stepsArray.push(`Combine like terms: ${xCoeff}x = ${constant}`);
      
      if (xCoeff === 0) {
        if (constant === 0) {
          setSteps(stepsArray);
          setError('Infinite solutions - equation is always true');
          return 'Infinite solutions';
        } else {
          setSteps(stepsArray);
          setError('No solution - equation has no valid answer');
          return 'No solution';
        }
      }
      
      const solution = constant / xCoeff;
      stepsArray.push(`Divide both sides by ${xCoeff}: x = ${constant}/${xCoeff}`);
      stepsArray.push(`Solution: x = ${solution.toFixed(4)}`);
      
      setSteps(stepsArray);
      return solution;
    } catch (err) {
      return null;
    }
  };

  const parseExpression = (expr) => {
    let x = 0;
    let constant = 0;
    
    // Remove all spaces
    expr = expr.replace(/\s/g, '');
    
    // Add '+' at the beginning if it doesn't start with a sign
    if (expr[0] !== '+' && expr[0] !== '-') {
      expr = '+' + expr;
    }
    
    // Match terms: coefficient (optional) followed by x, or just a number
    const terms = expr.match(/[+-][^+-]+/g) || [];
    
    for (let term of terms) {
      term = term.trim();
      
      if (term.includes('x')) {
        // Extract coefficient of x
        const coeffStr = term.replace('x', '').trim();
        if (coeffStr === '+' || coeffStr === '') {
          x += 1;
        } else if (coeffStr === '-') {
          x -= 1;
        } else {
          x += parseFloat(coeffStr);
        }
      } else {
        // It's a constant
        constant += parseFloat(term);
      }
    }
    
    return { x, constant };
  };

  const examples = [
    '2x + 5 = 13',
    '3x - 7 = 2x + 1',
    '5x + 10 = 2x + 25',
    'x + 15 = 3x - 5'
  ];

  const clearAll = () => {
    setEquation('');
    setResult(null);
    setSteps([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Equation Solver', href: '/tools/equation-solver' }]} />
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Equation Solver
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Solve linear equations step by step</p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-6">
          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Enter your equation
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={equation}
                onChange={(e) => setEquation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && solveEquation()}
                placeholder="e.g., 2x + 5 = 13"
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-lg"
              />
              <button
                onClick={solveEquation}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Solve
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Examples */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setEquation(ex)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all text-sm font-medium"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Result Section */}
          {result !== null && (
            <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-900">Solution Found!</h3>
              </div>
              <p className="text-3xl font-bold text-green-700 ml-11">
                x = {typeof result === 'number' ? result.toFixed(4) : result}
              </p>
            </div>
          )}

          {/* Steps Section */}
          {steps.length > 0 && (
            <div className="p-6 bg-indigo-50 rounded-2xl">
              <h3 className="text-lg font-bold text-indigo-900 mb-4">Solution Steps:</h3>
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                      {i + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 pt-1 font-mono">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Solutions</h3>
            <div className="space-y-3">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 transition-all cursor-pointer"
                  onClick={() => setEquation(item.equation)}
                >
                  <div>
                    <p className="font-mono text-gray-800 dark:text-gray-100">{item.equation}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">x = {typeof item.solution === 'number' ? item.solution.toFixed(4) : item.solution}</p>
                  </div>
                  <span className="text-xs text-gray-400">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Supports linear equations with variable x</p>
        </div>
      </div>
    </div>
  );
}