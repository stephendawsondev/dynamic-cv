document.addEventListener("DOMContentLoaded", () => {
  const originalTexts = document.querySelectorAll(".original-text");
  const replacementTexts = document.querySelectorAll(".replacement-text");

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function strikeThrough(element) {
    return new Promise((resolve) => {
      element.classList.add("strike");
      element.addEventListener("animationend", () => resolve(), { once: true });
    });
  }

  function typeWriter(element) {
    return new Promise((resolve) => {
      const text = element.dataset.text;
      let i = 0;
      function type() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(type, 50);
        } else {
          resolve();
        }
      }
      type();
    });
  }

  async function animateElements() {
    let originalIndex = 0;
    let replacementIndex = 0;

    while (
      originalIndex < originalTexts.length ||
      replacementIndex < replacementTexts.length
    ) {
      const currentOriginal = originalTexts[originalIndex];
      const currentReplacement = replacementTexts[replacementIndex];

      if (!currentOriginal && currentReplacement) {
        await typeWriter(currentReplacement);
        await sleep(1000);
        replacementIndex++;
      } else if (currentOriginal && !currentReplacement) {
        await strikeThrough(currentOriginal);
        await sleep(500);
        originalIndex++;
      } else {
        const originalPosition =
          currentOriginal.compareDocumentPosition(currentReplacement);
        if (originalPosition & Node.DOCUMENT_POSITION_FOLLOWING) {
          await strikeThrough(currentOriginal);
          await sleep(500);
          originalIndex++;
        } else {
          await typeWriter(currentReplacement);
          await sleep(1000);
          replacementIndex++;
        }
      }
    }
  }

  replacementTexts.forEach((el) => {
    el.textContent = "";
  });

  animateElements();
});
