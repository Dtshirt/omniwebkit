'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Calculator, 
  Delete, 
  RotateCcw, 
  History,
  Copy,
  Download,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const BasicCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState([]);
  const [memory, setMemory] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [settings, setSettings] = useState({
    decimals: 10,
    thousands: true,
    sounds: false
  });

  // Calculator buttons layout
  const buttons = [
    [
      { label: 'MC', type: 'memory', action: 'clear' },
      { label: 'MR', type: 'memory', action: 'recall' },
      { label: 'M+', type: 'memory', action: 'add' },
      { label: 'M-', type: 'memory', action: 'subtract' }
    ],
    [
      { label: 'C', type: 'function', action: 'clear' },
      { label: '±', type: 'function', action: 'negate' },
      { label: '%', type: 'operator', value: '%' },
      { label: '÷', type: 'operator', value: '/' }
    ],
    [
      { label: '7', type: 'number', value: '7' },
      { label: '8', type: 'number', value: '8' },
      { label: '9', type: 'number', value: '9' },
      { label: '×', type: 'operator', value: '*' }
    ],
    [
      { label: '4', type: 'number', value: '4' },
      { label: '5', type: 'number', value: '5' },
      { label: '6', type: 'number', value: '6' },
      { label: '−', type: 'operator', value: '-' }
    ],
    [
      { label: '1', type: 'number', value: '1' },
      { label: '2', type: 'number', value: '2' },
      { label: '3', type: 'number', value: '3' },
      { label: '+', type: 'operator', value: '+' }
    ],
    [
      { label: '0', type: 'number', value: '0', span: 2 },
      { label: '.', type: 'number', value: '.' },
      { label: '=', type: 'equals', value: '=' }
    ]
  ];

  // Scientific calculator buttons (additional)
  const scientificButtons = [
    [
      { label: '√', type: 'function', action: 'sqrt' },
      { label: 'x²', type: 'function', action: 'square' },
      { label: 'xʸ', type: 'operator', value: '^' },
      { label: '1/x', type: 'function', action: 'reciprocal' }
    ],
    [
      { label: 'sin', type: 'function', action: 'sin' },
      { label: 'cos', type: 'function', action: 'cos' },
      { label: 'tan', type: 'function', action: 'tan' },
      { label: 'ln', type: 'function', action: 'ln' }
    ]
  ];

  // Format number for display
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    
    const number = parseFloat(num);
    if (!isFinite(number)) return 'Error';
    
    // Handle very large or very small numbers
    if (Math.abs(number) > 1e15 || (Math.abs(number) < 1e-10 && number !== 0)) {
      return number.toExponential(6);
    }
    
    // Format with thousands separator if enabled
    const formatted = number.toFixed(settings.decimals).replace(/\.?0+$/, '');
    
    if (settings.thousands) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    
    return formatted;
  };

  // Add to history
  const addToHistory = (expression, result) => {
    const historyItem = {
      id: Date.now(),
      expression,
      result,
      timestamp: new Date().toLocaleTimeString()
    };
    setHistory(prev => [historyItem, ...prev.slice(0, 19)]); // Keep last 20 items
  };

  // Perform calculation
  const calculate = (firstOperand, secondOperand, operation) => {
    switch (operation) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '*':
        return firstOperand * secondOperand;
      case '/':
        return secondOperand !== 0 ? firstOperand / secondOperand : NaN;
      case '%':
        return (firstOperand * secondOperand) / 100;
      case '^':
        return Math.pow(firstOperand, secondOperand);
      default:
        return secondOperand;
    }
  };

  // Handle button click
  const handleButtonClick = (button) => {
    if (settings.sounds) {
      // Play click sound (you can implement this)
    }

    switch (button.type) {
      case 'number':
        handleNumber(button.value);
        break;
      case 'operator':
        handleOperator(button.value);
        break;
      case 'equals':
        handleEquals();
        break;
      case 'function':
        handleFunction(button.action);
        break;
      case 'memory':
        handleMemory(button.action);
        break;
      default:
        break;
    }
  };

  const handleNumber = (value) => {
    if (waitingForOperand) {
      setDisplay(value);
      setWaitingForOperand(false);
    } else {
      if (value === '.' && display.includes('.')) return;
      setDisplay(display === '0' && value !== '.' ? value : display + value);
    }
  };

  const handleOperator = (nextOperator) => {
    const inputValue = parseFloat(display.replace(/,/g, ''));

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const result = calculate(currentValue, inputValue, operation);
      
      const expression = `${formatNumber(currentValue)} ${operation} ${formatNumber(inputValue)}`;
      addToHistory(expression, formatNumber(result));
      
      setDisplay(formatNumber(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperator);
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display.replace(/,/g, ''));

    if (previousValue !== null && operation) {
      const result = calculate(previousValue, inputValue, operation);
      const expression = `${formatNumber(previousValue)} ${operation} ${formatNumber(inputValue)}`;
      
      addToHistory(expression, formatNumber(result));
      
      setDisplay(formatNumber(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleFunction = (action) => {
    const inputValue = parseFloat(display.replace(/,/g, ''));
    let result;
    let expression;

    switch (action) {
      case 'clear':
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
        return;
      
      case 'negate':
        result = -inputValue;
        expression = `-(${formatNumber(inputValue)})`;
        break;
      
      case 'sqrt':
        if (inputValue < 0) {
          result = NaN;
        } else {
          result = Math.sqrt(inputValue);
        }
        expression = `√(${formatNumber(inputValue)})`;
        break;
      
      case 'square':
        result = inputValue * inputValue;
        expression = `(${formatNumber(inputValue)})²`;
        break;
      
      case 'reciprocal':
        if (inputValue === 0) {
          result = NaN;
        } else {
          result = 1 / inputValue;
        }
        expression = `1/(${formatNumber(inputValue)})`;
        break;
      
      case 'sin':
        result = Math.sin(inputValue * Math.PI / 180);
        expression = `sin(${formatNumber(inputValue)}°)`;
        break;
      
      case 'cos':
        result = Math.cos(inputValue * Math.PI / 180);
        expression = `cos(${formatNumber(inputValue)}°)`;
        break;
      
      case 'tan':
        result = Math.tan(inputValue * Math.PI / 180);
        expression = `tan(${formatNumber(inputValue)}°)`;
        break;
      
      case 'ln':
        if (inputValue <= 0) {
          result = NaN;
        } else {
          result = Math.log(inputValue);
        }
        expression = `ln(${formatNumber(inputValue)})`;
        break;
      
      default:
        return;
    }

    if (action !== 'clear') {
      addToHistory(expression, formatNumber(result));
      setDisplay(formatNumber(result));
      setWaitingForOperand(true);
    }
  };

  const handleMemory = (action) => {
    const inputValue = parseFloat(display.replace(/,/g, ''));

    switch (action) {
      case 'clear':
        setMemory(0);
        toast.success('Memory cleared');
        break;
      case 'recall':
        setDisplay(formatNumber(memory));
        setWaitingForOperand(true);
        break;
      case 'add':
        setMemory(prev => prev + inputValue);
        toast.success('Added to memory');
        break;
      case 'subtract':
        setMemory(prev => prev - inputValue);
        toast.success('Subtracted from memory');
        break;
      default:
        break;
    }
  };

  // Keyboard support
  const handleKeyPress = useCallback((event) => {
    const { key } = event;
    
    if (key >= '0' && key <= '9' || key === '.') {
      event.preventDefault();
      handleNumber(key);
    } else if (['+', '-', '*', '/', '%'].includes(key)) {
      event.preventDefault();
      handleOperator(key);
    } else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      handleEquals();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
      event.preventDefault();
      handleFunction('clear');
    } else if (key === 'Backspace') {
      event.preventDefault();
      const newDisplay = display.slice(0, -1) || '0';
      setDisplay(newDisplay);
    }
  }, [display, previousValue, operation, waitingForOperand]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const copyResult = () => {
    navigator.clipboard.writeText(display.replace(/,/g, '')).then(() => {
      toast.success('Result copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy result');
    });
  };

  const downloadHistory = () => {
    if (history.length === 0) {
      toast.error('No calculation history to download');
      return;
    }

    const content = history.map((item, index) => 
      `${index + 1}. ${item.expression} = ${item.result} (${item.timestamp})`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calculator_history_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success('History cleared');
  };

  const getButtonStyle = (button) => {
    const baseStyle = "h-14 rounded-lg font-semibold text-lg transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500";
    
    switch (button.type) {
      case 'number':
        return `${baseStyle} bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600 shadow-sm`;
      case 'operator':
        return `${baseStyle} bg-primary-600 text-white hover:bg-primary-700 shadow-lg`;
      case 'equals':
        return `${baseStyle} bg-green-600 text-white hover:bg-green-700 shadow-lg`;
      case 'function':
        return `${baseStyle} bg-orange-500 text-white hover:bg-orange-600 shadow-lg`;
      case 'memory':
        return `${baseStyle} bg-purple-500 text-white hover:bg-purple-600 shadow-lg text-sm`;
      default:
        return baseStyle;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Breadcrumbs items={[{ name: 'Basic Calculator', href: '/tools/basic-calculator' }]} />
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
            <Calculator className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Basic Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A full-featured calculator with memory functions, history, and keyboard support.
            Perfect for daily calculations and basic math operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              {/* Display */}
              <div className="mb-6">
                <div className="bg-gray-900 dark:bg-gray-800 p-6 rounded-xl">
                  <div className="text-right">
                    {/* Operation Display */}
                    {previousValue !== null && operation && (
                      <div className="text-gray-400 text-lg mb-2">
                        {formatNumber(previousValue)} {operation}
                      </div>
                    )}
                    
                    {/* Main Display */}
                    <div className="text-gray-900 dark:text-white text-4xl font-mono font-bold break-all">
                      {display}
                    </div>
                    
                    {/* Memory Indicator */}
                    {memory !== 0 && (
                      <div className="text-blue-400 text-sm mt-2">
                        M: {formatNumber(memory)}
                      </div>
                    )}
                  </div>
                  
                  {/* Display Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <span>Use keyboard or click buttons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={copyResult}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Copy result"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleFunction('clear')}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Clear (Esc)"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Button Grid */}
              <div className="space-y-3">
                {buttons.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-4 gap-3">
                    {row.map((button, buttonIndex) => (
                      <button
                        key={buttonIndex}
                        onClick={() => handleButtonClick(button)}
                        className={`${getButtonStyle(button)} ${
                          button.span === 2 ? 'col-span-2' : ''
                        }`}
                      >
                        {button.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Scientific Functions */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  Scientific Functions
                </h3>
                <div className="space-y-2">
                  {scientificButtons.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-4 gap-2">
                      {row.map((button, buttonIndex) => (
                        <button
                          key={buttonIndex}
                          onClick={() => handleButtonClick(button)}
                          className={`h-10 text-sm ${getButtonStyle(button)}`}
                        >
                          {button.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History & Settings Panel */}
          <div className="space-y-6">
            {/* History */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-semibold">History</h2>
                </div>
                <div className="flex items-center space-x-2">
                  {history.length > 0 && (
                    <>
                      <button
                        onClick={downloadHistory}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                        title="Download history"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={clearHistory}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                        title="Clear history"
                      >
                        <Delete className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => {
                        setDisplay(item.result.replace(/,/g, ''));
                        setWaitingForOperand(true);
                      }}
                    >
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.expression}
                      </div>
                      <div className="font-mono font-semibold text-gray-900 dark:text-white">
                        = {item.result}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.timestamp}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No calculations yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold">Settings</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Decimal Places: {settings.decimals}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={settings.decimals}
                    onChange={(e) => setSettings(prev => ({ ...prev, decimals: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium">Thousands Separator</span>
                  <input
                    type="checkbox"
                    checked={settings.thousands}
                    onChange={(e) => setSettings(prev => ({ ...prev, thousands: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium">Button Sounds</span>
                  <input
                    type="checkbox"
                    checked={settings.sounds}
                    onChange={(e) => setSettings(prev => ({ ...prev, sounds: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="card p-6">
              <h3 className="font-semibold mb-3">Keyboard Shortcuts</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Numbers & Operators</span>
                  <span>0-9, +, -, *, /, %</span>
                </div>
                <div className="flex justify-between">
                  <span>Calculate</span>
                  <span>Enter or =</span>
                </div>
                <div className="flex justify-between">
                  <span>Clear</span>
                  <span>Esc or C</span>
                </div>
                <div className="flex justify-between">
                  <span>Backspace</span>
                  <span>Backspace</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicCalculator;