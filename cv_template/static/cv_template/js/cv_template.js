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

  requirejs.config({
    paths: {
      jspdf: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min",
      html2canvas:
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min",
    },
  });

  require(["jspdf", "html2canvas"], function (jspdf, html2canvas) {
    const { jsPDF } = jspdf;
    window.html2canvas = html2canvas;

    document
      .getElementById("generate-pdf")
      .addEventListener("click", function () {
        const element = document.querySelector(".cv");
        const pages = element.querySelectorAll(".page");

        document.body.classList.add("generating-pdf");

        // Create a clone of the CV element
        const clone = element.cloneNode(true);

        // Apply styles to the clone
        clone.style.position = "absolute";
        clone.style.left = "-9999px";
        clone.style.top = "0";
        document.body.appendChild(clone);

        // Show all pages in the clone
        clone.querySelectorAll(".page").forEach((page) => {
          page.style.display = "block";
          page.style.boxShadow = "none";
          page.style.margin = "0";
          page.style.pageBreakAfter = "always";
        });

        html2canvas(clone, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
        }).then((canvas) => {
          // Remove the clone after capturing
          document.body.removeChild(clone);

          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF({
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          });

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 0;
          let pageCount = 0;

          const significantContentThreshold = 10;

          while (heightLeft > significantContentThreshold) {
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            position -= pageHeight;
            pageCount++;

            if (heightLeft > significantContentThreshold) {
              pdf.addPage();
            }
          }

          pdf.save(document.title.split("-")[0].trim() + ".pdf");

          document.body.classList.remove("generating-pdf");
        });
      });
  });
});
