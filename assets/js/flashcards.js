let flashcards = [];
let currentIndex = 0;

async function loadFlashcards(jsonUrl) {
  const res = await fetch(jsonUrl);
  flashcards = await res.json();
  currentIndex = 0;
  renderFlashcard();
}

function renderFlashcard() {
  const container = document.getElementById("flashcard-container");
  container.innerHTML = "";

  const cardData = flashcards[currentIndex];

  const card = document.createElement("div");
  card.className = "flashcard";
  card.innerHTML = `
    <div class="flashcard-inner">
      <div class="flashcard-front">${marked.parse(cardData.front)}</div>
      <div class="flashcard-back">${marked.parse(cardData.back)}</div>
    </div>
  `;

  container.appendChild(card);

  // Flip on click
  card.addEventListener("click", () => {
    card.classList.toggle("is-flipped"); // match CSS
    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  });

  // Always reset to front before showing a new card
  card.classList.remove("is-flipped");
  void card.offsetWidth; // force reflow (prevents ghost transforms)

  // Typeset math after rendering
  if (window.MathJax) {
    MathJax.typesetPromise();
  }
}

// Navigation
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderFlashcard();
    }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentIndex < flashcards.length - 1) {
      currentIndex++;
      renderFlashcard();
    }
  });
});
