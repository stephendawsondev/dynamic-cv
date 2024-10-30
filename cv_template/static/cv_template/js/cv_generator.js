function updateSkills(event) {
  // Get the name and id of the skill
  const skillText = event.target.parentElement.innerText.trim();
  const skillId = parseInt(event.target.value);

  // If we store the skills in a list of hidden elements, we can store them in any order
  const hiddenSkillList = document.getElementById('id_hidden_skill_list');

  // Checking if the skill is already in the list
  let hasSkill = false;
  const hiddenPoints = hiddenSkillList.children;
  for (let point of hiddenPoints) {
    const pointId = parseInt(point.value);
    if (skillId === pointId) {
      hasSkill = true;
      point.remove();
      break;
    }
  }

  // Adding the skill to the list
  if (!hasSkill) {
    const numSkills = parseInt(hiddenSkillList.getAttribute('data-num-skills'));
    let newSkill = document.createElement('input');
    newSkill.setAttribute('type', 'hidden');
    newSkill.name = `user_skills_${numSkills}`;
    newSkill.value = skillId;
    newSkill.setAttribute('data-skill', skillText);
    hiddenSkillList.appendChild(newSkill);
    hiddenSkillList.setAttribute('data-num-skills', numSkills + 1);
  }

  // Updating the preview
  const preview = document.getElementById('preview-skills');
  let previewText = '';
  for (let i = 0; i < hiddenPoints.length; i++) {
    let child = hiddenPoints[i];
    previewText += child.getAttribute('data-skill');
    if (i < hiddenPoints.length - 1) {
      previewText += ', ';
    }
  }
  preview.innerText = previewText;
}


document.addEventListener('DOMContentLoaded', function () {

  [...document.getElementById('div_id_skills').getElementsByTagName('input')].map((item) => {
    item.addEventListener('click', updateSkills);
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

  function togglePreview() {
    if (window.innerWidth < 1024) { // 'lg' breakpoint
      if (previewContainer.classList.contains('hidden')) {
        previewContainer.classList.remove('hidden');
        previewContainer.classList.add('fixed', 'inset-0', 'z-50', 'bg-white', 'overflow-auto', 'p-4');
        previewButton.textContent = 'Hide Preview';
      } else {
        previewContainer.classList.add('hidden');
        previewContainer.classList.remove('fixed', 'inset-0', 'z-50', 'bg-white', 'overflow-auto', 'p-4');
        previewButton.textContent = 'Preview CV';
      }
    }
  }

  previewButton.addEventListener('click', togglePreview);

  previewContainer.addEventListener('click', function (event) {
    if (window.innerWidth < 1024 && event.target === previewContainer) {
      togglePreview();
    }
  });

  function handleResize() {
    if (window.innerWidth >= 1024) {
      previewContainer.classList.remove('hidden', 'fixed', 'inset-0', 'z-50', 'bg-white', 'overflow-auto', 'p-4');
      previewContainer.classList.add('lg:block');
      previewButton.classList.add('hidden');
    } else {
      previewContainer.classList.add('hidden');
      previewContainer.classList.remove('lg:block');
      previewButton.classList.remove('hidden');
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  function updateSummaryPreview() {
    const useDefaultSummaryInput = document.getElementById('id_use_default_summary');
    const summaryPreview = document.getElementById('preview-summary');
    if (useDefaultSummaryInput.checked) {
      summaryPreview.innerHTML = '{{ default_summary|escapejs }}';
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

    // Hobbies Preview
    const hobbiesPreview = document.getElementById('preview-hobbies');
    hobbiesPreview.innerHTML = '';
    const hobbiesCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="hobbies"]:checked');
    hobbiesCheckboxes.forEach(checkbox => {
      const hobbyInfo = checkbox.parentElement.textContent.trim();
      const li = document.createElement('li');
      li.textContent = hobbyInfo;
      hobbiesPreview.appendChild(li);
    });

    // Extra Info Preview
    const extraInfoPreview = document.getElementById('preview-extra-info');
    extraInfoPreview.innerHTML = '';
    const extraInfoCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="extra_info"]:checked');
    extraInfoCheckboxes.forEach(checkbox => {
      const extraInfo = checkbox.parentElement.textContent.trim();
      const div = document.createElement('div');
      div.className = 'extra-info-item';
      div.innerHTML = `
      <li>${extraInfo}</li>
`;
      extraInfoPreview.appendChild(div);
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

    // const skillsPreview = document.getElementById('preview-skills');
    // const skillsCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="skills"]:checked');
    // const skillsList = Array.from(skillsCheckboxes).map(checkbox => checkbox.parentElement.textContent.trim());
    // skillsPreview.textContent = skillsList.join(', ');

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