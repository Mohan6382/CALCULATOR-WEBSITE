let currentDisplay = '0';
let currentCalculation = '';
let calculationHistory = [];
let isScientificMode = false;
let doubleClickTimer = null;
let clickCount = 0;

const display = document.getElementById('display');
const historyList = document.getElementById('historyList');
const scientificPad = document.getElementById('scientificPad');
const standardMode = document.getElementById('standardMode');
const scientificMode = document.getElementById('scientificMode');
const themeToggle = document.getElementById('themeToggle');
const toggleHistory = document.getElementById('toggleHistory');
const downloadHistory = document.getElementById('downloadHistory');
const newsletterForm = document.getElementById('newsletterForm');

document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    setupEventListeners();
    setupKeyboardSupport();
});

function setupEventListeners() {
    document.querySelectorAll('.calc-btn').forEach(button => {
        button.addEventListener('click', () => {
            handleButtonClick(button);
            createFloatingDigit(button);
        });
    });

    standardMode.addEventListener('click', () => setCalculatorMode('standard'));
    scientificMode.addEventListener('click', () => setCalculatorMode('scientific'));

    themeToggle.addEventListener('click', toggleTheme);

    toggleHistory.addEventListener('click', () => {
        historyList.classList.toggle('hidden');
    });

    downloadHistory.addEventListener('click', downloadHistoryAsPDF);

    newsletterForm.addEventListener('submit', handleNewsletterSubmit);

    document.querySelector('.calc-btn.clear').addEventListener('click', handleClearClick);
}

function handleButtonClick(button) {
    const number = button.dataset.number;
    const operation = button.dataset.operation;

    if (number) {
        appendNumber(number);
    } else if (operation) {
        handleOperation(operation);
    }

    updateDisplay();
}

function appendNumber(number) {
    if (currentDisplay === '0' && number !== '.') {
        currentDisplay = number;
    } else {
        currentDisplay += number;
    }
}

function handleOperation(operation) {
    switch (operation) {
        case 'clear':
            currentDisplay = '0';
            break;
        case 'delete':
            currentDisplay = currentDisplay.slice(0, -1) || '0';
            break;
        case '=':
            calculate();
            break;
        case 'sin':
        case 'cos':
        case 'tan':
        case 'log':
        case 'sqrt':
            handleScientificOperation(operation);
            break;
        default:
            currentDisplay += ` ${operation} `;
    }
}

function handleScientificOperation(operation) {
    const number = parseFloat(currentDisplay);
    let result;

    switch (operation) {
        case 'sin':
            result = Math.sin(number);
            break;
        case 'cos':
            result = Math.cos(number);
            break;
        case 'tan':
            result = Math.tan(number);
            break;
        case 'log':
            result = Math.log10(number);
            break;
        case 'sqrt':
            result = Math.sqrt(number);
            break;
    }

    currentDisplay = result.toString();
    addToHistory(`${operation}(${number})`, currentDisplay);
}

function calculate() {
    try {
        const result = eval(currentDisplay);
        addToHistory(currentDisplay, result);
        currentDisplay = result.toString();
    } catch (error) {
        currentDisplay = 'Error';
    }
}

function addToHistory(expression, result) {
    const historyItem = {
        expression,
        result,
        timestamp: new Date().toLocaleString()
    };

    calculationHistory.unshift(historyItem);
    if (calculationHistory.length > 10) {
        calculationHistory.pop();
    }

    saveHistory();
    updateHistoryDisplay();
}

function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
}

function loadHistory() {
    const saved = localStorage.getItem('calculatorHistory');
    if (saved) {
        calculationHistory = JSON.parse(saved);
        updateHistoryDisplay();
    }
}

function updateHistoryDisplay() {
    historyList.innerHTML = calculationHistory.map(item => `
        <div class="history-item">
            <div class="expression">${item.expression} = ${item.result}</div>
            <div class="timestamp">${item.timestamp}</div>
        </div>
    `).join('');
}

function setCalculatorMode(mode) {
    isScientificMode = mode === 'scientific';
    scientificPad.classList.toggle('hidden', !isScientificMode);
    standardMode.classList.toggle('active', !isScientificMode);
    scientificMode.classList.toggle('active', isScientificMode);
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
}

function setupKeyboardSupport() {
    document.addEventListener('keydown', (event) => {
        if (event.key.match(/[0-9.]/)) {
            appendNumber(event.key);
        } else if (event.key.match(/[+\-*/%]/)) {
            handleOperation(event.key);
        } else if (event.key === 'Enter') {
            handleOperation('=');
        } else if (event.key === 'Backspace') {
            handleOperation('delete');
        } else if (event.key === 'Escape') {
            handleOperation('clear');
        }
        updateDisplay();
    });
}

function updateDisplay() {
    display.textContent = currentDisplay;
}

function createFloatingDigit(button) {
    const digit = document.createElement('div');
    digit.className = 'float-digit';
    digit.textContent = button.textContent;
    
    const rect = button.getBoundingClientRect();
    digit.style.left = `${rect.left + rect.width / 2}px`;
    digit.style.top = `${rect.top}px`;
    
    document.body.appendChild(digit);
    
    setTimeout(() => {
        document.body.removeChild(digit);
    }, 1000);
}

function handleClearClick() {
    clickCount++;
    
    if (clickCount === 1) {
        doubleClickTimer = setTimeout(() => {
            clickCount = 0;
        }, 300);
    } else if (clickCount === 2) {
        clearTimeout(doubleClickTimer);
        clickCount = 0;
        activateSecretMode();
    }
}

function activateSecretMode() {
    document.body.style.animation = 'rainbow 5s linear infinite';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 5000);
}

function handleNewsletterSubmit(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    alert(`Thanks for subscribing! We'll keep you updated about new features.`);
    event.target.reset();
}

function downloadHistoryAsPDF() {
    const historyText = calculationHistory
        .map(item => `${item.expression} = ${item.result} (${item.timestamp})`)
        .join('\n');
    
    const blob = new Blob([historyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculator-history.txt';
    a.click();
    URL.revokeObjectURL(url);
}