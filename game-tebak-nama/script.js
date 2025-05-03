const levels = [
  { name: "arda", image: "img/arda.jpeg" },
  { name: "rifaldi", image: "img/rifaldi.jpeg" },
  { name: "anta", image: "img/anta.jpeg" }
];

const quizQuestions = [
  { question: "Siapa wali kelas XTP1?", answer: "pak bayu" },
  { question: "Siapa ketua kelas XTP1?", answer: "rifaldi" },
  { question: "Siapa guru mulok?", answer: "pak rudy" }
];

let currentLevel = 0;
let constructed = "";
let timerInterval;
let timeLeft = 30;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

let quizLives = 3;
let quizIndex = 0;

const benarSound = new Audio("sounds/benar.mp3");
const salahSound = new Audio("sounds/salah.mp3");
const klikSound = new Audio("sounds/klik.mpeg");
const bgMusic = new Audio("sounds/background.mp3");

bgMusic.loop = true;
bgMusic.volume = 0.5;

function populateLevelSelector() {
  const selector = document.getElementById("level-select");
  levels.forEach((level, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = `Level ${index + 1}`;
    selector.appendChild(option);
  });
}

function selectLevel() {
  const selector = document.getElementById("level-select");
  currentLevel = parseInt(selector.value);
  score = 0;
  document.getElementById("score").innerText = `⭐ Skor: ${score}`;
  loadLevel();
}

function shuffleLetters(word) {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters;
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 30;
  document.getElementById("timer").innerText = `⏱ Waktu: ${timeLeft}s`;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = `⏱ Waktu: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById("feedback").innerText = "Waktu habis! 😢";
      document.querySelectorAll(".letter-button").forEach(btn => btn.disabled = true);
    }
  }, 1000);
}

function loadLevel() {
  const level = levels[currentLevel];
  document.getElementById("level-info").innerText = `Level ${currentLevel + 1}`;
  document.getElementById("level-select").value = currentLevel;
  document.getElementById("person-image").src = level.image;
  document.getElementById("person-image").style.display = "block";

  const lettersContainer = document.getElementById("shuffled-letters");
  lettersContainer.innerHTML = "";

  const constructedContainer = document.getElementById("constructed-answer");
  constructedContainer.innerText = "";
  constructed = "";

  const shuffled = shuffleLetters(level.name);
  shuffled.forEach(letter => {
    const btn = document.createElement("button");
    btn.innerText = letter;
    btn.className = "letter-button";
    btn.onclick = () => {
      klikSound.currentTime = 0;
      klikSound.play();
      constructed += letter;
      constructedContainer.innerText = constructed;
      btn.disabled = true;

      if (constructed.length === level.name.length) {
        checkConstructedAnswer();
      }
    };
    lettersContainer.appendChild(btn);
  });

  document.getElementById("feedback").innerText = '';
  startTimer();
}

function resetAnswer() {
  constructed = "";
  document.getElementById("constructed-answer").innerText = "";
  document.querySelectorAll(".letter-button").forEach(btn => btn.disabled = false);
  document.getElementById("feedback").innerText = "";
}

function checkConstructedAnswer() {
  const correctAnswer = levels[currentLevel].name;
  if (constructed.toLowerCase() === correctAnswer) {
    clearInterval(timerInterval);
    benarSound.play();
    score += 100 + timeLeft * 2;
    document.getElementById("score").innerText = `⭐ Skor: ${score}`;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      document.getElementById("high-score").innerText = `🏅 Skor Tertinggi: ${highScore}`;
    }
    document.getElementById("feedback").innerText = "Benar! 👏";
    currentLevel++;
    if (currentLevel < levels.length) {
      setTimeout(loadLevel, 1000);
    } else {
      document.getElementById("shuffled-letters").innerHTML = '';
      document.getElementById("constructed-answer").style.display = "none";
      document.getElementById("timer").style.display = "none";
      showConfetti();
      setTimeout(startQuiz, 2000);
    }
  } else {
    salahSound.play();
    document.getElementById("feedback").innerText = "Salah, coba lagi!";
  }
}

// ==== QUIZ SYSTEM ====

function startQuiz() {
  if (localStorage.getItem("quizPassed")) {
    alert("Kamu sudah menyelesaikan semua tantangan sebelumnya. 🎉");
    return;
  }
  quizLives = 3;
  quizIndex = 0;
  showNextQuizQuestion();
  document.getElementById("quiz-section").style.display = "block";
}

function showNextQuizQuestion() {
  const quiz = document.getElementById("quiz-section");
  const q = quizQuestions[quizIndex];
  quiz.dataset.correct = q.answer.toLowerCase();
  quiz.dataset.question = q.question;
  updateQuizUI();
  document.getElementById("quiz-answer").value = "";
}

function updateQuizUI() {
  const quiz = document.getElementById("quiz-section");
  const questionText = quiz.dataset.question;
  const hearts = "❤️".repeat(quizLives) + "🤍".repeat(3 - quizLives);
  document.getElementById("quiz-question").innerText = `${questionText}\n${hearts}`;
}

function submitQuizAnswer() {
  const userAnswer = document.getElementById("quiz-answer").value.trim().toLowerCase();
  const quiz = document.getElementById("quiz-section");
  const correct = quiz.dataset.correct;
  if (userAnswer === correct) {
    quizIndex++;
    if (quizIndex < quizQuestions.length) {
      showNextQuizQuestion();
    } else {
      alert("Semua pertanyaan terjawab! 🎉 Kamu menyelesaikan semua tantangan!");
      quiz.style.display = "none";
      localStorage.setItem("quizPassed", true);
    }
  } else {
    quizLives--;
    if (quizLives <= 0) {
      alert("Jawaban salah. Nyawa habis! Game Over.");
      quiz.style.display = "none";
    } else {
      alert(`Jawaban salah. Sisa nyawa: ${quizLives}`);
      updateQuizUI();
    }
  }
}

function showConfetti() {
  const canvas = document.createElement("canvas");
  canvas.id = "confetti-canvas";
  canvas.style.position = "fixed";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);
  import('https://cdn.skypack.dev/canvas-confetti').then(module => {
    const confetti = module.default;
    const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
    myConfetti({ spread: 180, particleCount: 150, origin: { y: 0.6 } });
    setTimeout(() => document.body.removeChild(canvas), 5000);
  });
}

function toggleMusic() {
  if (bgMusic.paused) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
}

// Inisialisasi
populateLevelSelector();
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("high-score").innerText = `🏅 Skor Tertinggi: ${highScore}`;
});
loadLevel();
