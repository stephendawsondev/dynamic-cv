// Create and insert the disabled text area
const form = document.querySelector('#skill-form');
const previewButton = document.querySelector('#preview-button');
const previewContainer = document.querySelector('.cv-preview-container');
const previewButtonText = 'Preview CV';

 // Find how many pixels are in a millimeter
 const mmElement = document.getElementById('mm-measurement');
 const pxPerMm = mmElement.getBoundingClientRect().width;
 const pageSize = {
   width: 210,
   height: 297
 };
 // The TOTAL margin of the preview, i.e. the sum of both sides
 const previewMargin = {
   width: 32,
   height: 80
 };
 const stickyContainer = document.querySelector('#sticky-container');
 const pageList = document.querySelector('#cv-pages');
 // The maximum height of the CV should be the height of the screen minus a determined margin
 const maxScreenHeight = window.innerHeight - previewMargin.height;


 /**
  * Removes the https://www. part of a URL
  * @param {String} url The URL to be cleaned
  */
 function cleanUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/^www./, '');
 }


/**
 * Adds/Removes the experience item that was clicked from the preview
 * @param {Element} item the input that was triggered
 */
function updateExperienceItem(item) {
  const itemType = item.name;
  const itemFormat = itemType.replaceAll('_', '-');
  let itemHtml = components[itemType].standard;
  const itemData = userData[itemType][item.value];
  let emptySections = [];
  let extraAttrs = {};

  // Add the experience item
  if (item.checked) {
    // Fill in the sections with the user data
    for (let [key, value] of Object.entries(itemData)) {
      if (itemHtml.includes(`${key}">`)) {
        if (value) {
          // Adding the href and aria-label attributes to URLs
          if (key.toLowerCase().includes('url')) {
            itemHtml = itemHtml.replace(`${key}">`, `${key}">${cleanUrl(value)}`);
            let linkDescription = 'website';
            let projectName = 'this project';
            switch (key) {
              case 'repository_url':
                linkDescription = 'repository';
                projectName = itemData.name;
                break;
              case 'deployed_url':
                linkDescription = 'deployed site';
                projectName = itemData.name;
                break;
              default:
                break;
            }
            extraAttrs[key] = {
              'href': value,
              'aria-label': `Go to the ${linkDescription} of ${projectName} (Opens in a new tab)`
            };
          }
          else {
            itemHtml = itemHtml.replace(`${key}">`, `${key}">${value}`);
          }
        }
        else {
          emptySections.push(key);
          // Any sections that rely on this section having a value will also be removed
          if (itemHtml.includes(`${key}-required`)) {
            emptySections.push(`${key}-required`);
          }
        }
      }
    }

    // Bullet points
    if ('bullet_points' in itemData) {
      let bulletList = ``;
      for (let key in itemData.bullet_points) {
        const value = itemData.bullet_points[key];
        bulletList += `<li>${value}</li>`;
      }
      itemHtml = itemHtml.replace(`bullet-points">`, `bullet-points">${bulletList}`);
    }

    // Skills
    if ('skills' in itemData) {
      let numSkills = Object.keys(itemData.skills).length;
      if (numSkills === 0) {
        emptySections.push('skills-required');
      }
      else {
        let skillList = ``;
        let index = 0;
        for (let key in itemData.skills) {
          const value = itemData.skills[key];
          skillList += value;
          if (index < numSkills - 1) {
            skillList += ', ';
          }
          index++; 
        }
        itemHtml = itemHtml.replace(`skills-list">`, `skills-list">${skillList}`);
      }
    }

    // If the section is split into multiple parts, append the item to the last one
    const listSections = document.getElementsByClassName(`${itemFormat}-section`);
    const sectionEnd = listSections[listSections.length - 1];
    const appendSection = sectionEnd.classList.contains('primary') ? sectionEnd.querySelector('.preview-items') : sectionEnd;

    let newSection = document.createElement('div');
    newSection.id = `${itemFormat}-${item.value}`;
    newSection.className = 'exp-item';
    newSection.innerHTML = itemHtml;
    appendSection.appendChild(newSection);

    // Removing any unused sections, and adding extra properties
    setTimeout(() => {
      for (let section of emptySections) {
        let deleteSection = newSection.querySelector(`.${section}`);
        if (deleteSection) {
          deleteSection.remove();
        }
      }
      for (let [key, data] of Object.entries(extraAttrs)) {
        let propSection = newSection.querySelector(`.${key}`);
        if (propSection) {
          for (let [prop, value] of Object.entries(data)) {
            propSection.setAttribute(prop, value);
          }
        }
      }
    });
  }
  else {
    const selectedElement = document.getElementById(`${itemFormat}-${item.value}`);
    if (selectedElement) {
      selectedElement.remove();
    }
  }

  // Updating the headings
  setTimeout(() => updateSectionVisibility(itemType));
}


/**
 * Updates the order of a bullet point list when a checkbox is clicked
 * @param {Event} event The click event of the checkbox
 */
function updateBulletPointOrder(event) {
  // Get the id of the bullet point item
  const bulletId = event.target.value;
  const selected = event.target.checked;
  
  // Get the hidden input list the item is targeting
  const element = event.target;
  const bulletType = element.name;
  const orderData = document.getElementById(`id_${bulletType}_order`);

  // Adding/Removing the item id from the list, depending on if the checkbox is checked
  let orderList = orderData.value ? orderData.value.split(',') : [];
  let bulletIndex = orderList.indexOf(bulletId);
  if (selected) {
    if (bulletIndex === -1) {
      orderList.push(bulletId);
    }
  }
  else {
    if (bulletIndex >= 0) {
      orderList.splice(bulletIndex, 1);
    }
  }

  // Setting the new value of the list order, and updating the preview
  const checkboxContainer = document.getElementById(`div_id_${bulletType}`);
  const previewContainer = document.getElementById(`preview-${bulletType.replaceAll('_', '-')}`);

  // If the preview container is a list, make the items appear on a new line
  const newLine = (previewContainer.tagName === 'UL');

  let previewText = '';
  let orderText = '';
  for (let i = 0; i < orderList.length; i++) {
    orderText += orderList[i];
    const bulletInput = checkboxContainer.querySelector(`input[value="${orderList[i]}"]`);
    const bulletText = bulletInput.parentElement.innerText.trim();
    if (newLine) {
      previewText += `<li>${bulletText}</li>`;
    }
    else {
      previewText += bulletText;
    }
    
    if (i < orderList.length - 1) {
      orderText += ',';
      if (!newLine) {
        previewText += ', ';
      }
    }
  }
  orderData.value = orderText;
  if (newLine) {
    previewContainer.innerHTML = previewText;
  }
  else {
    previewContainer.innerText = previewText;
  }
  updateSectionVisibility(bulletType);
}


/**
 * Moves a section to the preview if an item is present, or removes it if it is empty
 * @param {String} sectionType The section to be moved
 */
function updateSectionVisibility(sectionType) {
  const sectionFormat = sectionType.replaceAll('_', '-');
  const sectionElement = document.getElementsByClassName(`${sectionFormat}-section`)[0];
  const previewContainer = document.getElementById(`preview-${sectionFormat}`);
  const headingOrder = document.getElementById('id_headings_order');
  let headingData = headingOrder.value ? headingOrder.value.split(',') : [];
  let sectionIndex = headingData.indexOf(sectionType);

  if (previewContainer.children.length > 0 || previewContainer.innerText.trim()) {
    if (!sectionElement.parentNode.className.includes('cv-preview')) {
      // Add the new heading to the last page
      const pages = document.getElementsByClassName('cv-preview');
      pages[pages.length - 1].appendChild(sectionElement);
    }
    if (sectionIndex === -1) {
      headingData.push(sectionType);
    }
  }
  else {
    document.getElementById('preview-unused-headings').appendChild(sectionElement);
    if (sectionIndex >= 0) {
      headingData.splice(sectionIndex, 1);
    }
  }
  headingOrder.value = headingData.join();
  renderPreview();
}


/**
 * Adds the headings to the first page on page load
 */
function loadPreview() {
  // Clean the URLs for the contact information
  [...document.querySelector('.links').getElementsByTagName('a')].map((item) => {
    item.innerText = cleanUrl(item.innerText);
  });
  let page = document.querySelector('.cv-preview');
  const headingOrder = document.getElementById('id_headings_order');
  const headingValues = headingOrder.value ? headingOrder.value.split(',') : [];
  for (let val of headingValues) {
    const valF = val.replaceAll('_', '-');
    const headingSection = document.querySelector(`.${valF}-section`);
    page.appendChild(headingSection);
  }
  renderPreview();
}


const headings = ['work-experience', 'education', 'projects', 'skills', 'hobbies', 'extra-info'];
/**
 * Renders the selected sections to the CV preview, creating new pages where necessary.
 * Updates the current order of sections rather than re-render the CV entirely as it results
 * in a much smoother update with less frame flashing
 */
function renderPreview() {
  console.clear();

  // Wait until all elements have been resized until proceeding
  setTimeout(() => {
    const pageList = document.querySelector('#cv-pages');
    // Finding the upper margin of the page
    let pages = [...document.getElementsByClassName('cv-preview')];
    const pageRect = pages[0].getBoundingClientRect();
    const verticalMargin = (10 * pxPerMm) * parseFloat(pages[0].style.scale);

    // What space is available on the page, and how much space each heading takes up
    const availableSpace = pageRect.height - (verticalMargin * 2);
    let headingSpaces = pages.map((item) => [...item.children].map((child) => child.getBoundingClientRect().height));
    
    for (let i = 0; i < pages.length; i++) {
      console.log(i);
      let page = pages[i];
      let usedSpace = headingSpaces[i].reduce((item, prevNum) => Math.ceil(item + prevNum), 0);
      let sectionsMovedForward = 0;

      // Moving sections to the next page if there is not enough room
      if (usedSpace > availableSpace) {
        let sectionSpace = 0;
        for (let j = 0; j < headingSpaces[i].length; j++) {
          const sectionHeight = Math.ceil(headingSpaces[i][j]);
          const sectionElement = page.children[j];
          // If the element hasn't already been broken into another element
          const isPrimaryElement = sectionElement.classList.contains('primary');

          if (sectionSpace + sectionHeight > availableSpace) {
            let appendSection = sectionElement;
            let appendHeight = sectionHeight;

            // Creating a new page if this is the last
            if (i === pages.length - 1) {
              const newPage = document.createElement('div');
              newPage.className = 'cv-preview page bg-white shadow-md';
              newPage.style.scale = pages[0].style.scale;
              newPage.style.left = pages[0].style.left;
              pageList.appendChild(newPage);
              headingSpaces.push([]);
              pages.push(newPage);
            }
            const nextPage = pages[i + 1];

            // Breaking up sections if they take up more than a page
            let itemListElement = null;
            let pageBreakSpaces = null;
            let breakIndex = 0;
            if (sectionHeight >= availableSpace) {
              // Adding the heights of all the other elements, not including the item list, that make up the section
              let extraHeight = isPrimaryElement ? [...sectionElement.children]
              .splice(0, sectionElement.children.length - 1)
              .reduce((totalHeight, element) => totalHeight + element.getBoundingClientRect().height, 0) : 0;
              
              // Finding the heights of each element within the section
              itemListElement = isPrimaryElement ? sectionElement.children[1] : sectionElement;
              pageBreakSpaces = [...itemListElement.children].map((element) => element.getBoundingClientRect().height);

              while (breakIndex < pageBreakSpaces.length && sectionSpace + extraHeight + pageBreakSpaces[breakIndex] < availableSpace) {
                breakIndex++;
                extraHeight += pageBreakSpaces[breakIndex];
              }
              if (breakIndex > 0) {
                let newSection = document.createElement('section');
                newSection.className = appendSection.className.replace('primary', 'secondary');
                document.getElementById('preview-unused-headings').appendChild(newSection);

                appendHeight = 0;
                while (breakIndex < pageBreakSpaces.length) {
                  newSection.appendChild(itemListElement.children[breakIndex]);
                  appendHeight += pageBreakSpaces.splice(breakIndex, 1);
                  headingSpaces[i][j] -= appendHeight;
                }
                appendSection = newSection;
              }
            }
            if (headingSpaces[i + 1].length > sectionsMovedForward) {
              nextPage.insertBefore(appendSection, nextPage.children[sectionsMovedForward]);
              headingSpaces[i + 1].splice(sectionsMovedForward, 0, appendHeight);
            }
            else {
              nextPage.appendChild(appendSection);
              headingSpaces[i + 1].push(appendHeight);
            }
            headingSpaces[i].splice(j, 1);
            j--;
            sectionsMovedForward++;
          }
          sectionSpace += sectionHeight;
        }
      }
      // Checking if there is enough room to take sections from the next page
      else {
        // If the last section is broken into segments, and the section is to be moved back a page, then piece it back together
        const hasChildren = page.children.length;
        const lastSection = hasChildren ? page.children[page.children.length - 1] : null;
        const sectionSegments = lastSection ? [...document.getElementsByClassName(lastSection.classList[0])] : [];
        const firstPage = sectionSegments.length > 0 ? pages.indexOf(sectionSegments[0].parentNode) : 0;
        const sectionIndex = lastSection ? sectionSegments.indexOf(lastSection) : 0;
        let sectionHeights = sectionSegments.map(segment => [...segment.children].map(element => element.getBoundingClientRect().height));
        const hasSegments = sectionSegments.length > 1 && sectionIndex < sectionHeights.length;

        // Move any page-breaking sections back a page to try and spread the section more efficiently
        while (i < pages.length - 1
          && (usedSpace + headingSpaces[i + 1][0] <= availableSpace
            || headingSpaces[i + 1][0] >= availableSpace
            || (hasSegments && usedSpace + sectionHeights[sectionIndex + 1][0] <= availableSpace))) {
          let nextPage = pages[i + 1];
          // Move the page index back 1 to re-evaluate the page
          let nextEvalPage = i - 1;
          const isPageBreak = headingSpaces[i + 1][0] >= availableSpace || hasSegments;

          // Putthing the segments back together to be divided again in the next iteration
          if (hasSegments) {
            while (sectionSegments.length > 1) {
              // Find the page index of the section to relocate its height value
              const currentSection = sectionSegments[1];
              const currentPage = pages.indexOf(currentSection.parentNode);

              // Add the height of the segment to the height of the first segment
              const segmentHeight = headingSpaces[currentPage].splice(0, 1)[0];
              headingSpaces[firstPage][headingSpaces[firstPage].length - 1] += segmentHeight;

              // Move all the children into the main segment, and then delete the secondary one
              while (currentSection.children.length > 0) {
                sectionSegments[0].children[1].appendChild(currentSection.children[0]);
              }
              sectionSegments.splice(1, 1);
              currentSection.remove();
            }
            nextEvalPage = firstPage - 1;
          }
          else {
            headingSpaces[i].push(headingSpaces[i + 1][0]);
            headingSpaces[i + 1].splice(0, 1);
            page.appendChild(nextPage.children[0]);
          }

          // Re-evaluate the current page now that there is a page break
          if (isPageBreak) {
            i = nextEvalPage;
            break;
          }
          // Removing the next page if there are no sections left in it
          if (pages[i + 1].children.length === 0) {
            // If the page to be deleted is active, move to the previous page
            if (nextPage.classList.contains('active')) {
              page.classList.add('active');
            }
            pages.splice(i + 1, 1);
            headingSpaces.splice(i + 1, 1);
            nextPage.remove();
          }

        }
      }
    }
    // Enabling/Disabling the page navigation buttons depending on if there is more than 1 page
    if (pages.length > 1) {
      document.getElementById('preview-page-buttons').classList.remove('hidden');
      // Update the buttons enabled status
      navigatePreview(0);
    }
    else {
      document.getElementById('preview-page-buttons').classList.add('hidden');
    }
  });
}


/**
 * Moves to the next/previous page in the preview
 * @param {Number} direction Positive for next page, negative for previous page, 0 to just update the buttons
 */
function navigatePreview(direction) {
  const pageList = document.querySelector('#cv-pages');
  const pages = pageList.children;
  const prevPage = document.getElementById('preview-previous-page');
  const nextPage = document.getElementById('preview-next-page');
  prevPage.disabled = true;
  nextPage.disabled = true;

  let index = 0;
  while (index < pages.length && !pages[index].classList.contains('active')) {
    index++;
  }
  if (direction > 0 && index < pages.length - 1) {
    pages[index].classList.remove('active');
    index++;
  }
  else if (direction < 0 && index > 0) {
    pages[index].classList.remove('active');
    index--;
  }
  pages[index].classList.add('active');
  if (index > 0) {
    prevPage.disabled = false;
  }
  if (index < pages.length - 1) {
    nextPage.disabled = false;
  }
}


/**
 * Is triggered when the window is resized
 */
function handleResize() {
  const pages = [...document.getElementsByClassName('cv-preview')];
  let scale = 1;

  if (window.innerWidth >= 1024) {
    previewContainer.classList.remove('invisible', 'absolute', 'fixed', 'inset-0', 'z-50');
    previewContainer.classList.add('lg:block');
    previewButton.classList.add('hidden');
    previewButton.textContent = previewButtonText;

    // Find the size of the preview container
    const previewSize = previewContainer.getBoundingClientRect();

    // Finds the scale of the page where the width touches the edge and where the height touches the edge.
    // The smallest scale is the one that won't overflow, so we want the smallest
    scale = Math.min(
      1 / ((pageSize.width * pxPerMm) / (previewSize.width - previewMargin.width)),
      1 / ((pageSize.height * pxPerMm) / maxScreenHeight)
    );

    pages.map(page => {
      page.style.scale = scale;
      page.style.left = `${(previewSize.width - ((pageSize.width * pxPerMm) * scale)) / 2}px`;
    });
  } else {
    // Prevents the preview from disappearing whenever the screen is resized
    if (previewButton.classList.contains('hidden')) {
      previewContainer.classList.add('invisible', 'absolute');
    }
    previewContainer.classList.remove('lg:block');
    previewButton.classList.remove('hidden');

    scale = Math.min(
      1 / ((pageSize.width * pxPerMm) / (document.body.clientWidth - previewMargin.width)),
      1 / ((pageSize.height * pxPerMm) / (window.innerHeight - previewMargin.height))
    );

    pages.map(page => {
      page.style.scale = scale;
      page.style.left = `${(document.body.clientWidth - ((pageSize.width * pxPerMm) * scale)) / 2}px`;
    });
  }
  // Also adjust the height of the sticky container so that the page scrolls to the bottom
  stickyContainer.style.height = `${((pageSize.height * pxPerMm) * scale) + previewMargin.height}px`;
  // As well as the page list so the buttons appear below it
  pageList.style.height = `${((pageSize.height * pxPerMm) * scale) + 28}px`;
}

function updateSummaryPreview() {
  const useDefaultSummaryInput = document.getElementById('id_use_default_summary');
  const summaryPreview = document.getElementById('preview-summary');
  const summaryContainer = document.getElementById('div_id_summary');
  const hasSummaryInput = document.getElementById('id_has_summary');
  hasSummaryInput.disabled = true;
  if (useDefaultSummaryInput.checked) {
    summaryContainer.style.display = 'none';
    if (defaultSummary.trim()) {
      summaryPreview.innerHTML = `<p>${defaultSummary}</p>`;
      hasSummaryInput.disabled = false;
    }
  } else {
    summaryContainer.style.display = 'block';
    const richTextEditor = document.querySelector('.ck-editor__editable_inline:not(.ck-comment__input *)');
    if (richTextEditor) {
      if (richTextEditor.textContent.trim()) {
        summaryPreview.innerHTML = richTextEditor.innerHTML;
        hasSummaryInput.disabled = false;
      }
      else {
        summaryPreview.innerHTML = "";
      }
    }
  }
  renderPreview();
}


document.addEventListener('DOMContentLoaded', function () {

  // Make all checkboxes update the preview
  [...document.getElementById('div_id_work_experience').getElementsByTagName('input'),
    ...document.getElementById('div_id_education').getElementsByTagName('input'),
    ...document.getElementById('div_id_projects').getElementsByTagName('input'),
  ].map((item) => {
    item.addEventListener('click', () => {
      updateExperienceItem(item);
    });
  });
  [...document.getElementById('div_id_skills').getElementsByTagName('input'),
    ...document.getElementById('div_id_hobbies').getElementsByTagName('input'),
    ...document.getElementById('div_id_extra_info').getElementsByTagName('input')
  ].map((item) => {
    item.addEventListener('click', updateBulletPointOrder);
  });

  window.addEventListener('resize', handleResize);
  handleResize();

  // Page navigation
  document.getElementById('preview-previous-page').addEventListener('click', () => navigatePreview(-1));
  document.getElementById('preview-next-page').addEventListener('click', () => navigatePreview(1));

  // Hide the summary input if "Use default summary" is checked
  const summaryCheckbox = document.querySelector('#id_use_default_summary');
  const summaryInput = document.querySelector('#div_id_summary');
  if (summaryCheckbox.checked) {
    summaryInput.style.display = 'none';
  }

  function togglePreview() {
    if (window.innerWidth < 1024) { // 'lg' breakpoint
      if (previewContainer.classList.contains('invisible')) {
        previewContainer.classList.remove('invisible', 'absolute');
        previewContainer.classList.add('fixed', 'inset-0', 'z-50');
        previewButton.textContent = 'Hide Preview';
      } else {
        previewContainer.classList.add('invisible', 'absolute');
        previewContainer.classList.remove('fixed', 'inset-0', 'z-50');
        previewButton.textContent = previewButtonText;
      }
    }
  }

  previewButton.addEventListener('click', togglePreview);

  previewContainer.addEventListener('click', function (event) {
    if (window.innerWidth < 1024 && event.target === previewContainer) {
      togglePreview();
    }
  });

  // form.addEventListener('input', function (event) {
  //   if (!event.target.closest('.ck-editor')) {
  //     updatePreview();
  //   }
  // });

  if (window.CKEDITOR) {
    CKEDITOR.on('instanceReady', function (evt) {
      evt.editor.on('input', function () {
        updateSummaryPreview();
      });
    });
  }
  const positionInput = document.getElementById('id_position_title');
  document.getElementById('id_position_title').addEventListener('input', (event) => {
    const positionPreview = document.getElementById('preview-position');
    positionPreview.innerText = positionInput.value;
    renderPreview();
  });

  const useDefaultSummaryInput = document.getElementById('id_use_default_summary');
  useDefaultSummaryInput.addEventListener('change', updateSummaryPreview);

  // const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="education"], input[type="checkbox"][name^="skills"], input[type="checkbox"][name^="projects"][name^="extra_info"][name^="hobbies"]');
  // checkboxes.forEach(checkbox => {
  //   checkbox.addEventListener('change', updatePreview);
  // });

  const accentColorInput = document.getElementById('id_color');

  function updateAccentColor() {
    const color = accentColorInput.value;
    const previewH2s = document.querySelectorAll('.cv-preview h2');
    const previewH3s = document.querySelectorAll('.cv-preview h3');

    previewH2s.forEach(h2 => h2.style.color = color);
    previewH3s.forEach(h3 => {
      h3.style.color = color;
    });
  }

  accentColorInput.addEventListener('input', updateAccentColor);

  function updatePreview() {
    const positionInput = document.getElementById('id_position_title');
    if (positionInput) {
      document.getElementById('preview-position').textContent = positionInput.value;
    }

    updateSummaryPreview();
    updateAccentColor();

    const educationPreview = document.getElementById('preview-education');
    educationPreview.innerHTML = '';
    const educationCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="education"]:checked');
    educationCheckboxes.forEach(checkbox => {
      const educationInfo = checkbox.parentElement.textContent.trim().split(' - ');
      if (educationInfo.length >= 4) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td class="date-cell">09/10-05/14</td>
        <td>Example University</td>
        <td>Example Location</td>
        <td class="accreditation">Example degree</td>
      `;
        educationPreview.appendChild(tr);
      }
    });

    const workExperiencePreview = document.getElementById('preview-work-experience');
    workExperiencePreview.innerHTML = '';
    const workExperienceCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="work_experience"]:checked');
    workExperienceCheckboxes.forEach(checkbox => {
      const workInfo = checkbox.parentElement.textContent.trim().split(' - ');
      if (workInfo.length >= 3) {
        const div = document.createElement('div');
        div.className = 'job';
        div.innerHTML = `
        <div class="header">
          <div class="details">${workInfo[1]} - ${workInfo[0]}</div>
          <div class="date">${workInfo[2]}</div>
        </div>
        <ul class="work-details">
          <li>Your first key responsibility or achievement will be listed here.</li>
          <li>Your second key responsibility or achievement will be listed here.</li>
          <li>Your third key responsibility or achievement will be listed here.</li>
        </ul>
      `;
        workExperiencePreview.appendChild(div);
      }
    });

    const projectsPreview = document.getElementById('preview-projects').getElementsByTagName('tbody')[0];
    projectsPreview.innerHTML = '';
    const projectCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="projects"]:checked');
    projectCheckboxes.forEach(checkbox => {
      const projectInfo = checkbox.parentElement.textContent.trim().split(' - ');
      if (projectInfo.length >= 1) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${projectInfo[0]}</td>
        <td>This is where the project description will go. It will provide a brief overview of the project.</td>
        <td>example.com/${projectInfo[0].toLowerCase().replace(/\s+/g, '-')}</td>
      `;
        projectsPreview.appendChild(tr);
      }
    });

  }

  // updatePreview();
  loadPreview();

  const richTextEditor = document.querySelector('.ck-editor__editable_inline:not(.ck-comment__input *)');
  if (richTextEditor) {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          updateSummaryPreview();
        }
      });
    });

    observer.observe(richTextEditor, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }
});