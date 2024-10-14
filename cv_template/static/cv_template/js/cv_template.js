document.addEventListener("DOMContentLoaded", function () {
  const cv = document.querySelector(".cv");
  const sections = document.querySelectorAll(".cv-section");
  const pageHeightPx = 1129;
  const pageNavigationContainer = document.querySelector(".page-navigation");

  function createNewPage() {
    const newPage = document.createElement("div");
    newPage.classList.add("page");
    return newPage;
  }

  async function layoutSections() {
    const initialPage = cv.querySelector(".page");

    // Append all sections to the initial page
    for (const section of sections) {
      initialPage.appendChild(section);
    }

    // Wait for a short delay to ensure the sections are rendered
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Calculate section heights
    const sectionHeights = Array.from(sections).map(
      (section) => section.offsetHeight
    );
    console.log("Section Heights:", sectionHeights);

    // Clear the initial page
    initialPage.innerHTML = "";

    let currentPage = initialPage;
    let currentPageHeight = 0;

    // Redistribute sections to new pages if necessary
    sections.forEach((section, index) => {
      const sectionHeight = sectionHeights[index];

      if (currentPageHeight + sectionHeight > pageHeightPx) {
        currentPage = createNewPage();
        cv.appendChild(currentPage);
        currentPageHeight = 0;
      }

      currentPage.appendChild(section);
      currentPageHeight += sectionHeight;
    });

    updatePageNavigation();
  }

  function updatePageNavigation() {
    const pages = document.querySelectorAll(".page");
    pageNavigationContainer.innerHTML = "";

    pages.forEach((page, index) => {
      const pageLink = document.createElement("a");
      pageLink.href = "#";
      pageLink.textContent = `Page ${index + 1}`;
      pageLink.addEventListener("click", function (event) {
        event.preventDefault();
        showPage(index + 1);
      });
      pageNavigationContainer.appendChild(pageLink);
    });
  }

  function showPage(pageNumber) {
    const pages = document.querySelectorAll(".page");

    pages.forEach((page, index) => {
      if (index === pageNumber - 1) {
        page.classList.add("active");
      } else {
        page.classList.remove("active");
      }
    });
  }

  function toggleMobileClass() {
    if (window.innerWidth <= 767) {
      document.body.classList.add("mobile");
      document.body.classList.remove("desktop");
    } else {
      document.body.classList.remove("mobile");
      document.body.classList.add("desktop");
    }
  }

  window.addEventListener("load", toggleMobileClass);
  window.addEventListener("resize", toggleMobileClass);

  window.addEventListener("load", layoutSections);
});
