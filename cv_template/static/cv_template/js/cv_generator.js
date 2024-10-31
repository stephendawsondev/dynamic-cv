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

  if ((sectionType === 'projects' && document.getElementById('project-table').children.length > 0)
    || (sectionType !== 'projects' && (previewContainer.children.length > 0 || previewContainer.innerText.trim()))) {
    if (!sectionElement.parentNode.className.includes('cv-preview')) {
      document.getElementsByClassName('cv-preview')[0].appendChild(sectionElement);
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
}


document.addEventListener('DOMContentLoaded', function () {

  // Make all checkboxes update the preview
  [...document.getElementById('div_id_work_experience').getElementsByTagName('input'),
    ...document.getElementById('div_id_education').getElementsByTagName('input'),
    ...document.getElementById('div_id_projects').getElementsByTagName('input'),
  ].map((item) => {
    item.addEventListener('click', () => {
      setTimeout(() => updateSectionVisibility(item.name), 1);
    });
  });
  [...document.getElementById('div_id_skills').getElementsByTagName('input'),
    ...document.getElementById('div_id_hobbies').getElementsByTagName('input'),
    ...document.getElementById('div_id_extra_info').getElementsByTagName('input')
  ].map((item) => {
    item.addEventListener('click', updateBulletPointOrder);
  });

  // Hide the summary input if "Use default summary" is checked
  const summaryCheckbox = document.querySelector('#id_use_default_summary');
  const summaryInput = document.querySelector('#div_id_summary');
  if (summaryCheckbox.checked) {
    summaryInput.style.display = 'none';
  }

  // Create and insert the disabled text area
  const form = document.querySelector('#skill-form');
  const previewButton = document.querySelector('#preview-button');
  const previewContainer = document.querySelector('.cv-preview-container');
  const previewButtonText = 'Preview CV';

  function togglePreview() {
    if (window.innerWidth < 1024) { // 'lg' breakpoint
      if (previewContainer.classList.contains('hidden')) {
        previewContainer.classList.remove('hidden');
        previewContainer.classList.add('fixed', 'inset-0', 'z-50');
        previewButton.textContent = 'Hide Preview';
      } else {
        previewContainer.classList.add('hidden');
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

  // Find how many pixels are in a millimeter
  const mmElement = document.getElementById('mm-measurement');
  const pxPerMm = mmElement.getBoundingClientRect().width;
  const pageSize = {
    width: 210,
    height: 297
  };
  // The TOTAL margin 
  const previewMargin = {
    width: 32,
    height: 96
  };
  const cvPreview = document.querySelector('.cv-preview');
  const stickyContainer = document.querySelector('#sticky-container');
  // The maximum height of the CV should be the height of the screen minus a determined margin
  const maxScreenHeight = window.innerHeight - previewMargin.height;

  function handleResize() {

    if (window.innerWidth >= 1024) {
      previewContainer.classList.remove('hidden', 'fixed', 'inset-0', 'z-50');
      previewContainer.classList.add('lg:block');
      previewButton.classList.add('hidden');
      previewButton.textContent = previewButtonText;

      // Find the size of the preview container
      const previewSize = previewContainer.getBoundingClientRect();

      // Finds the scale of the page where the width touches the edge and where the height touches the edge.
      // The smallest scale is the one that won't overflow, so we want the smallest
      const scale = Math.min(
        1 / ((pageSize.width * pxPerMm) / (previewSize.width - previewMargin.width)),
        1 / ((pageSize.height * pxPerMm) / maxScreenHeight)
      );

      cvPreview.style.scale = scale;
      cvPreview.style.left = `${(previewSize.width - ((pageSize.width * pxPerMm) * scale)) / 2}px`;
      cvPreview.style.top = '';

      // Also adjust the height of the sticky container so that the page scrolls to the bottom
      stickyContainer.style.height = `${((pageSize.height * pxPerMm) * scale) + previewMargin.height}px`;
    } else {
      // Prevents the preview from disappearing whenever the screen is resized
      if (previewButton.classList.contains('hidden')) {
        previewContainer.classList.add('hidden');
      }
      previewContainer.classList.remove('lg:block');
      previewButton.classList.remove('hidden');

      const scale = Math.min(
        1 / ((pageSize.width * pxPerMm) / (document.body.clientWidth - previewMargin.width)),
        1 / ((pageSize.height * pxPerMm) / (window.innerHeight - previewMargin.height))
      );
      cvPreview.style.scale = scale;
      cvPreview.style.left = `${(document.body.clientWidth - ((pageSize.width * pxPerMm) * scale)) / 2}px`;
      cvPreview.style.top = `${Math.max((window.innerHeight - ((pageSize.height * pxPerMm) * scale)) / 2, 0)}px`;
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  function updateSummaryPreview() {
    const useDefaultSummaryInput = document.getElementById('id_use_default_summary');
    const summaryPreview = document.getElementById('preview-summary');
    if (useDefaultSummaryInput.checked) {
      summaryPreview.innerHTML = defaultSummary;
    } else {
      const richTextEditor = document.querySelector('.ck-editor__editable_inline:not(.ck-comment__input *)');
      if (richTextEditor) {
        summaryPreview.innerHTML = richTextEditor.innerHTML;
      }
    }
  }

  form.addEventListener('input', function (event) {
    if (!event.target.closest('.ck-editor')) {
      updatePreview();
    }
  });

  if (window.CKEDITOR) {
    CKEDITOR.on('instanceReady', function (evt) {
      evt.editor.on('change', function () {
        updateSummaryPreview();
      });
    });
  }

  const useDefaultSummaryInput = document.getElementById('id_use_default_summary');
  useDefaultSummaryInput.addEventListener('change', updateSummaryPreview);

  const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="education"], input[type="checkbox"][name^="work_experience"], input[type="checkbox"][name^="skills"], input[type="checkbox"][name^="projects"][name^="extra_info"][name^="hobbies"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updatePreview);
  });

  function updateLinks() {
    const links = document.querySelectorAll('.cv-preview .links li');
    links.forEach(li => {
      const link = li.querySelector('a');
      if (link) {
        li.textContent = link.href.replace(/^https?:\/\//, '');
      }
    });
  }

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

    updateLinks();
  }

  updatePreview();

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