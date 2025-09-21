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
      <div class="flashcard-side front">${marked.parse(cardData.front)}</div>
      <div class="flashcard-side back">${marked.parse(cardData.back)}</div>
    </div>
  `;

  container.appendChild(card);

  // Flip on click
  card.addEventListener("click", () => {
    card.classList.toggle("flipped");
    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  });

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
