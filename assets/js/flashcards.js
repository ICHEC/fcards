// assets/js/flashcards.js
let flashcards = [];
let currentIndex = 0;

async function loadFlashcards(jsonUrl) {
  try {
    const r = await fetch(jsonUrl, { cache: "no-store" });
    if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
    flashcards = await r.json();
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      throw new Error("Cards JSON is empty or not an array");
    }
    currentIndex = 0;
    initUI();
    renderCard();
  } catch (err) {
    console.error("Failed to load flashcards:", err);
    const container = document.getElementById("flashcard-container") || document.getElementById("flashcard");
    if (container) container.innerHTML = `<p style="color:red">Error loading cards: ${err.message}</p>`;
  }
}

/* safe typeset helper - waits for MathJax to be ready */
function safeTypeset(element) {
  return new Promise((resolve) => {
    const tryTypeset = () => {
      if (window.MathJax && MathJax.startup && MathJax.startup.promise) {
        MathJax.startup.promise.then(() => {
          if (MathJax.typesetPromise) {
            MathJax.typesetPromise([element]).then(resolve).catch((e) => {
              console.warn("MathJax typeset failed:", e);
              resolve();
            });
          } else {
            // older MathJax fallback
            try { MathJax.Hub && MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]); } catch (e) {}
            resolve();
          }
        }).catch((e) => {
          console.warn("MathJax startup promise failed:", e);
          resolve();
        });
      } else {
        // MathJax not yet defined — retry a few times then give up
        setTimeout(() => {
          tryTypeset();
        }, 150);
      }
    };
    tryTypeset();
  });
}

function initUI() {
  const flashcard = document.getElementById("flashcard");
  const front = flashcard.querySelector(".flashcard-front");
  const back = flashcard.querySelector(".flashcard-back");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // Prevent nav clicks from bubbling to the card (so they don't flip)
  [prevBtn, nextBtn].forEach(btn => {
    btn.addEventListener("click", (ev) => ev.stopPropagation());
  });

  // Flip on click (toggle class on outer .flashcard)
  flashcard.addEventListener("click", () => {
    flashcard.classList.toggle("is-flipped");
    // typeset visible side after flip
    safeTypeset(flashcard).catch(()=>{});
  });

  prevBtn.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (currentIndex > 0) {
      currentIndex--;
      renderCard();
    }
  });

  nextBtn.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (currentIndex < flashcards.length - 1) {
      currentIndex++;
      renderCard();
    }
  });

  // optional keyboard navigation
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowLeft") {
      if (currentIndex > 0) { currentIndex--; renderCard(); }
    } else if (ev.key === "ArrowRight") {
      if (currentIndex < flashcards.length - 1) { currentIndex++; renderCard(); }
    } else if (ev.key === " " || ev.key === "Spacebar") {
      // space toggles flip (avoid flipping when focused on button)
      const active = document.activeElement;
      if (active && (active.tagName === "BUTTON" || active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
      ev.preventDefault();
      document.getElementById("flashcard").classList.toggle("is-flipped");
      safeTypeset(document.getElementById("flashcard")).catch(()=>{});
    }
  });
}

async function renderCard() {
  const flashcard = document.getElementById("flashcard");
  const front = flashcard.querySelector(".flashcard-front");
  const back = flashcard.querySelector(".flashcard-back");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // Defensive checks
  if (!flashcard || !front || !back) {
    console.error("Flashcard DOM nodes missing");
    return;
  }
  if (!flashcards.length) {
    front.innerHTML = "<p>No cards available</p>";
    back.innerHTML = "";
    return;
  }

  // Reset flip and force reflow to avoid animation glitches
  flashcard.classList.remove("is-flipped");
  void flashcard.offsetWidth; // force reflow

  // Render content (try/catch so a broken card won't break the UI)
  try {
    const item = flashcards[currentIndex] || { front: "", back: "" };
    front.innerHTML = marked.parse(item.front || "");
    back.innerHTML = marked.parse(item.back || "");
  } catch (err) {
    console.error("Error rendering markdown:", err);
    front.textContent = flashcards[currentIndex].front || "";
    back.textContent = flashcards[currentIndex].back || "";
  }

  // update nav disabled state
  if (prevBtn) prevBtn.disabled = currentIndex === 0;
  if (nextBtn) nextBtn.disabled = currentIndex === (flashcards.length - 1);

  // typeset math on visible content first, then invisible side
  try {
    await safeTypeset(front);
    // we also typeset back in background so when flipped it appears quickly
    safeTypeset(back).catch(()=>{});
  } catch (e) {
    console.warn("Typeset error (ignored):", e);
  }
}

/* run (from template) */
document.addEventListener("DOMContentLoaded", () => {
  // nothing here – loadCards(jsonUrl) should be invoked by the template inline script
});
