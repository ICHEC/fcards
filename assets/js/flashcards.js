let flashcards = [];
let currentIndex = 0;
let isTransitioning = false;

async function loadFlashcards(jsonUrl) {
  const res = await fetch(jsonUrl);
  flashcards = await res.json();
  currentIndex = 0;
  renderFlashcard("next");
}

function renderFlashcard(direction = "next") {
  const container = document.getElementById("flashcard-container");
  const oldCard = container.querySelector(".flashcard");

  // Instantly remove old card
  if (oldCard) oldCard.remove();

  const cardData = flashcards[currentIndex];
  const card = document.createElement("div");
  card.className = `flashcard ${direction === "next" ? "enter-next" : "enter-prev"}`;
  card.innerHTML = `
    <div class="flashcard-inner">
      <div class="flashcard-front">
        <span class="card-label">Front</span>
        ${marked.parse(cardData.front)}
      </div>
      <div class="flashcard-back">
        <span class="card-label">Back</span>
        ${marked.parse(cardData.back)}
      </div>
    </div>
  `;

  container.appendChild(card);

  // Flip handler
  card.addEventListener("click", () => {
    card.classList.toggle("is-flipped");
    if (window.MathJax) MathJax.typesetPromise();
  });

  // Typeset math
  if (window.MathJax) MathJax.typesetPromise();

  // Disable buttons while animating
  isTransitioning = true;
  updateNavButtons();
  setTimeout(() => {
    isTransitioning = false;
    updateNavButtons();
  }, 400);
}

function updateNavButtons() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn.disabled = (currentIndex === 0 || isTransitioning);
  nextBtn.disabled = (currentIndex === flashcards.length - 1 || isTransitioning);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (!isTransitioning && currentIndex > 0) {
      currentIndex--;
      renderFlashcard("prev");
    }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (!isTransitioning && currentIndex < flashcards.length - 1) {
      currentIndex++;
      renderFlashcard("next");
    }
  });
});
