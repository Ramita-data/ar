// --- Card symbols (image filenames in root folder) ---
const cards = [
  'apple', 'ball', 'cat', 'dog', 'star', 'heart', 'flower', 'moon',
  'sun', 'car', 'bird', 'fish', 'tree', 'key', 'crown', 'book'
];

const backgrounds = ['forest.png', 'space.png', 'ocean.png']; // dynamic backgrounds per level

let premiumLevelsUnlocked = false;
let gameCards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let level = 1;

// --- Sounds ---
const flipSound = new Audio('flip.mp3');
const matchSound = new Audio('match.mp3');
const successSound = new Audio('success.mp3');
const bgMusic = new Audio('background.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;

const gameBoard = document.getElementById('gameBoard');
const levelInfo = document.getElementById('levelInfo');
const startBtn = document.getElementById('startBtn');
const unlockBtn = document.getElementById('unlockBtn');
const body = document.body;

startBtn.addEventListener('click', startGame);

// --- Start game ---
function startGame() {
  if (bgMusic.paused) bgMusic.play(); // ensure music starts on click
  gameBoard.innerHTML = '';
  levelInfo.innerText = `Level ${level}`;
  setBackground();
  setupLevel();
}

// --- Set dynamic background ---
function setBackground() {
  const bgIndex = (level - 1) % backgrounds.length;
  body.style.backgroundImage = `url(${backgrounds[bgIndex]})`;
}

// --- Setup level ---
function setupLevel() {
  let totalPairs = level <= 3 || premiumLevelsUnlocked ? 4 + level : 4;
  gameCards = cards.slice(0, totalPairs).concat(cards.slice(0, totalPairs));
  shuffle(gameCards);

  gameCards.forEach(symbol => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;
    card.innerHTML = `<img src="${symbol}.png" width="80" height="80">`;
    card.addEventListener('click', flipCard);
    gameBoard.appendChild(card);
  });
}

// --- Flip card ---
function flipCard() {
  if (lockBoard || this === firstCard) return;
  this.classList.add('flipped');
  flipSound.currentTime = 0; 
  flipSound.play();
  if (!firstCard) { firstCard = this; return; }
  secondCard = this;
  checkMatch();
}

// --- Check match ---
function checkMatch() {
  if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchSound.currentTime = 0; 
    matchSound.play();
    resetBoard();
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetBoard();
    }, 1000);
  }
}

// --- Reset board ---
function resetBoard() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
  if (document.querySelectorAll('.card.flipped').length === gameCards.length) {
    successSound.currentTime = 0;
    successSound.play();
    level++;
    alert(`Level ${level - 1} completed!`);
    startGame();
  }
}

// --- Shuffle ---
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// --- Unlock premium via PayPal ---
unlockBtn.addEventListener('click', () => {
  unlockBtn.style.display = 'none';
  const div = document.createElement('div');
  div.id = 'paypal-button-container';
  document.body.appendChild(div);

  paypal.Buttons({
    createOrder: function (data, actions) {
      return actions.order.create({
        purchase_units: [{ amount: { value: '1.00' } }]
      });
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        premiumLevelsUnlocked = true;
        alert('✅ Premium levels unlocked!');
        startGame();
        div.remove();
        unlockBtn.style.display = 'inline-block';
      });
    }
  }).render('#paypal-button-container');
});
