// ১. Default core data
const defaultQuestions = [
  { level: "Level 1", question: "What is the capital of Bangladesh?", options: ["Chittagong", "Dhaka", "Sylhet", "Khulna"], answer: "Dhaka" },
  { level: "Level 1", question: "What is 5 + 5?", options: ["8", "9", "10", "11"], answer: "10" },
  { level: "Level 2", question: "Which HTML element is used for JavaScript?", options: ["<js>", "<script>", "<javascript>", "<link>"], answer: "<script>" },
  { level: "Level 3", question: "What does CSS stand for?", options: ["Creative Style Sheets", "Computer Style Sheets", "Cascading Style Sheets", "Personal Sheets"], answer: "Cascading Style Sheets" }
];

let allQuestions = JSON.parse(localStorage.getItem('quiz_questions')) || defaultQuestions;
let activeQuestions = []; 
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 10;
let selectedLevel = "";

// Screens
const modeScreen = document.getElementById('mode-screen');
const levelScreen = document.getElementById('level-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const adminScreen = document.getElementById('admin-screen');

// Elements
const levelButtonsDiv = document.getElementById('level-buttons');
const currentLevelTitle = document.getElementById('current-level-title');
const questionCounter = document.getElementById('question-counter');
const questionText = document.getElementById('question-text');
const optionButtons = document.getElementById('option-buttons');
const nextBtn = document.getElementById('next-btn');
const timeLeftDisplay = document.getElementById('time-left');
const finalScore = document.getElementById('final-score');
const totalQuestionsDisplay = document.getElementById('total-questions');
const goToLevelsBtn = document.getElementById('go-to-levels-btn');

// Mode handling
document.getElementById('player-mode-btn').addEventListener('click', showLevels);
document.getElementById('admin-mode-btn').addEventListener('click', () => {
    let password = prompt("Enter Admin Password (Default: 1234):");
    if(password === "1234") {
        modeScreen.classList.add('hide');
        adminScreen.classList.remove('hide');
    } else {
        alert("Wrong Password!");
    }
});

// Generalized Back Button
document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        modeScreen.classList.remove('hide');
        levelScreen.classList.add('hide');
        quizScreen.classList.add('hide');
        resultScreen.classList.add('hide');
        adminScreen.classList.add('hide');
    });
});

// Show Levels dynamically from allQuestions list
function showLevels() {
    modeScreen.classList.add('hide');
    resultScreen.classList.add('hide');
    levelScreen.classList.remove('hide');
    levelButtonsDiv.innerHTML = "";

    // Array theke unique level name gulo ber korar logic (Ekhon notun level auto append hobe)
    const uniqueLevels = [...new Set(allQuestions.map(q => q.level))];

    uniqueLevels.forEach(lvl => {
        const count = allQuestions.filter(q => q.level === lvl).length;
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerHTML = `<strong>${lvl}</strong> <span style="float:right; color:var(--text-muted);">${count} Questions</span>`;
        btn.addEventListener('click', () => startQuiz(lvl));
        levelButtonsDiv.appendChild(btn);
    });
}

// Start Quiz Game
function startQuiz(lvl) {
    selectedLevel = lvl;
    activeQuestions = allQuestions.filter(q => q.level === lvl);
    
    if(activeQuestions.length === 0) {
        alert("No questions available here!");
        return;
    }

    levelScreen.classList.add('hide');
    resultScreen.classList.add('hide'); // Result screen complete hide kora holo
    quizScreen.classList.remove('hide');
    
    currentQuestionIndex = 0;
    score = 0;
    currentLevelTitle.innerText = selectedLevel;
    showQuestion();
}

function showQuestion() {
    resetState();
    let currentQuestion = activeQuestions[currentQuestionIndex];
    questionCounter.innerText = `Question ${currentQuestionIndex + 1} of ${activeQuestions.length}`;
    questionText.innerText = currentQuestion.question;

    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('option-btn');
        button.addEventListener('click', selectAnswer);
        optionButtons.appendChild(button);
    });
    startTimer();
}

// State reset logic - (Fixes the play again right-side duplicate bug)
function resetState() {
    clearInterval(timer);
    timeLeft = 10;
    timeLeftDisplay.innerText = timeLeft;
    nextBtn.classList.add('hide');
    
    // Clear old elements perfectly
    while (optionButtons.firstChild) {
        optionButtons.removeChild(optionButtons.firstChild);
    }
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timeLeftDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeOut();
        }
    }, 1000);
}

function handleTimeOut() {
    const correctAnswer = activeQuestions[currentQuestionIndex].answer;
    Array.from(optionButtons.children).forEach(button => {
        if (button.innerText === correctAnswer) button.classList.add('correct');
        button.disabled = true;
    });
    nextBtn.classList.remove('hide');
}

function selectAnswer(e) {
    clearInterval(timer);
    const selectedButton = e.target;
    const correctAnswer = activeQuestions[currentQuestionIndex].answer;

    if (selectedButton.innerText === correctAnswer) {
        selectedButton.classList.add('correct');
        score++;
    } else {
        selectedButton.classList.add('wrong');
        Array.from(optionButtons.children).forEach(button => {
            if (button.innerText === correctAnswer) button.classList.add('correct');
        });
    }
    Array.from(optionButtons.children).forEach(button => button.disabled = true);
    nextBtn.classList.remove('hide');
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < activeQuestions.length) {
        showQuestion();
    } else {
        // Show Final Score
        quizScreen.classList.add('hide');
        resultScreen.classList.remove('hide');
        finalScore.innerText = score;
        totalQuestionsDisplay.innerText = activeQuestions.length;
    }
});

// Play Again & Go to level setup
document.getElementById('restart-btn').addEventListener('click', () => {
    startQuiz(selectedLevel);
});

goToLevelsBtn.addEventListener('click', showLevels);

// --- Admin Panel Logic ---
document.getElementById('admin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const lvl = document.getElementById('admin-level').value.trim(); // Trim extra space
    const qText = document.getElementById('admin-question').value;
    const opts = document.getElementById('admin-options').value.split(',').map(o => o.trim());
    const ans = document.getElementById('admin-answer').value.trim();

    if(!opts.includes(ans)) {
        alert("Error: Correct Answer must exactly match one of the options!");
        return;
    }

    const newQuestion = { level: lvl, question: qText, options: opts, answer: ans };
    allQuestions.push(newQuestion);
    
    localStorage.setItem('quiz_questions', JSON.stringify(allQuestions));
    
    alert(`Success: Question added to "${lvl}"`);
    document.getElementById('admin-form').reset();
});