// Data to be fed into the addExperienceHtml function
const experienceProperties = {
  work: {
    form: 'work-experience-form',
    target: 'work-list',
    dataSource: 'work-input-data',
    html: workExperienceHtml,
    fields: {
      organization: 'work-exp-organization',
      location: 'work-exp-location',
      position: 'work-exp-position',
      date: 'work-exp-date'
    },
    optionalFields: ['location'],
    bulletPoints: {
      'work-responsibilities': 'work-rsp-list',
      'work-skills': 'work-skill-list',
      formInputs: ['responsibility-list', 'work-skill-list']
    },
    accordionLabel: {
      format: '0 - 1, %',
      keys: {
        '0': 'position',
        '1': 'organization'
      }
    }
  },
  education: {
    form: 'education-form',
    target: 'education-list',
    dataSource: 'education-input-data',
    html: educationHtml,
    fields: {
      school_name: 'education-exp-school-name',
      location: 'education-exp-location',
      degree: 'education-exp-degree',
      date: 'education-exp-date',
      grade: 'education-exp-grade',
    },
    optionalFields: ['location', 'grade'],
    bulletPoints: {
      'education-modules': 'education-modules-list',
      'education-skills': 'education-skill-list',
      formInputs: ['module-list', 'education-skill-list']
    },
    accordionLabel: {
      format: '0 - 1, %',
      keys: {
        '0': 'degree',
        '1': 'school_name'
      }
    }
  },
  project: {
    form: 'project-form',
    target: 'projects-list',
    dataSource: 'project-input-data',
    html: projectHtml,
    fields: {
      name: 'project-exp-name',
      repository_url: 'project-exp-repo',
      deployed_url: 'project-exp-deploy',
    },
    optionalFields: ['repository_url', 'deployed_url'],
    accordionLabel: {
      format: '0',
      keys: {
        '0': 'name'
      }
    }
  }
}

/**
 * Adds the experience item to the list of items
 * @param {String} experienceType The key to reference the above object experienceProperties
 */
function addExperienceHtml(experienceType) {
  clearForm(experienceType);
  let propertyObject = experienceProperties[experienceType];

  // Retrieving the data posted from the server
  let itemExperienceData = JSON.parse(document.getElementById(propertyObject['dataSource']).innerText);
  let elements = convertHtmlToDOM(propertyObject.html);
  let itemListElement = elements[0];

  let collapseHeading = `${experienceType}-collapse-heading`;
  let collapseHeadingElement = itemListElement.getElementsByClassName(collapseHeading)[0];
  let collapseBody = `${experienceType}-collapse-body`;
  let collapseBodyElement = itemListElement.getElementsByClassName(collapseBody)[0];
  let appendTarget = document.getElementById(propertyObject.target);

  // Getting a unique number to identify the item for the accordion collapse
  let accordionId = 0;
  while (document.getElementById(`${collapseHeading}-${accordionId}`)) {
    accordionId++;
  }
  let newHeadingId = `${collapseHeading}-${accordionId}`;
  let newBodyId = `${collapseBody}-${accordionId}`;

  //Set the ID of the collapse heading and body, and the aria label of the body it contains
  collapseHeadingElement.id = newHeadingId;
  collapseBodyElement.id = newBodyId;
  collapseBodyElement.setAttribute('aria-labelledby', newHeadingId);

  // Update the button to trigger the body to expand
  let collapseHeadingButton = collapseHeadingElement.children[0];
  collapseHeadingButton.setAttribute('data-accordion-target', `#${newBodyId}`);
  collapseHeadingButton.setAttribute('aria-controls', `${newBodyId}`);

  // Removes the rounded bottom on the previous elements
  let collapseHeadings = appendTarget.getElementsByClassName(`${experienceType}-collapse-heading`);
  for (let oldHeading of collapseHeadings) {
    oldHeading.children[0].classList.remove('rounded-b-xl');
  }
  let collapsebodies = appendTarget.getElementsByClassName(`${experienceType}-collapse-body`);
  for (let oldBody of collapsebodies) {
    oldBody.classList.remove('rounded-b-xl');
  }
  // Rounding the new item
  collapseHeadingButton.classList.add('rounded-b-xl');
  collapseBodyElement.classList.remove('border-b-0');
  collapseBodyElement.classList.add('rounded-b-xl');
  if (appendTarget.children.length === 0) {
    collapseHeadingButton.classList.add('rounded-t-xl');
  }

  // Adding the text to the label
  let headingLabel = collapseHeadingElement.getElementsByClassName('collapse-label')[0];
  let labelFormat = propertyObject.accordionLabel.format;
  let labelKeys = propertyObject.accordionLabel.keys;
  
  // Replaces each key in the format with the appropriate value
  for (let [key, value] of Object.entries(labelKeys)) {
    labelFormat = labelFormat.replace(key, itemExperienceData[value]);
  }
  
  // Filling out the new information into the new set of elements
  for (let [field, className] of Object.entries(propertyObject.fields)) {
    let value = itemExperienceData[field];

    // Connecting the start and end date
    if (field == 'date') {
      let startDate = null;
      let endDate = 'Present';
      for (let [propField, propValue] of Object.entries(itemExperienceData)) {
        if (propField.includes('start_')) {
          startDate = propValue;
        }
        else if (propField.includes('end_') && propValue) {
          endDate = propValue;
        }
      }
      let dateMessage = `${startDate} - ${endDate}`;
      itemListElement.getElementsByClassName(className)[0].innerText = dateMessage;

      // Applying the date range to the collapse label, if requested
      if (labelFormat.includes('%')) {
        labelFormat = labelFormat.replace('%', dateMessage);
      }
    }
    else {
      // For all other fields
      console.log(className);
      let itemDetailValue = itemListElement.getElementsByClassName(className)[0];
      itemDetailValue.innerText = value;

      // Adding links if the detail is an anchor
      if (itemDetailValue.tagName === 'A') {
        itemDetailValue.setAttribute('href', value);
      }
    }
  }
  // Applying the label to the collapse header
  headingLabel.innerText = labelFormat;

  // Removing any optinal fields if no value is given
  if ('optionalFields' in propertyObject) {
    for (let field of propertyObject.optionalFields) {
      if (!(field in itemExperienceData && itemExperienceData[field])) {
        deleteItemListRow(itemListElement.getElementsByClassName(propertyObject.fields[field])[0]);
      }
    }
  }

  // Adding bullet point items
  if ('bulletPoints' in propertyObject) {
    let populatedItemLists = {};
    for (let [key, value] of Object.entries(itemExperienceData)) {
      for (let [bulletField, className] of Object.entries(propertyObject.bulletPoints)) {
        // This key specifies the IDs of where the bullet points are kept in the form, so ignore it
        if (bulletField === 'formInputs') {
          continue;
        }
        if (key.includes(bulletField)) {
          populatedItemLists[className] = true;
          let newListItem = convertHtmlToDOM(listItem)[0];
          newListItem.innerText = value;
          itemListElement.getElementsByClassName(className)[0].appendChild(newListItem);
        }
      }
    }
    // Removing any item lists that don't contain any items
    for (let [bulletField, className] of Object.entries(propertyObject.bulletPoints)) {
      if (bulletField === 'formInputs') {
        continue;
      }
      if (!(className in populatedItemLists)) {
        deleteItemListRow(itemListElement.getElementsByClassName(className)[0]);
      }
    }
  }
  for (let element of elements) {
    appendTarget.appendChild(element);
  }
  // Resetting the accordion
  setAccordion(appendTarget, experienceType);
}


/**
 * Clears the extra data stored in a form
 * @param {String} experienceType 
 */
function clearForm(experienceType) {
  let propertyObject = experienceProperties[experienceType];
  let clearingForm = document.getElementById(propertyObject.form);

  // Remove the visible bullet points from the form
  if ('bulletPoints' in propertyObject) {
    for (let formId of propertyObject.bulletPoints.formInputs) {
      let listElement = document.getElementById(formId);
      while (listElement.children.length > 0) {
        listElement.children[0].remove();
      }
    }
  }

  // Re-enable all optional fields and making them required again, if disabled
  let optionalFields = [];
  if ('optionalFields' in propertyObject) {
    optionalFields = [...propertyObject.optionalFields];
  }
  // Adding the date to the optional fields to be processed
  if ('date' in propertyObject.fields) {
    switch (experienceType) {
      case 'work':
        optionalFields.push(`end_date`);
        break;
      case 'education':
        optionalFields.push(`end_year`);
        break;
      default:
        break;
    }
  }
  for (let optionalField of optionalFields) {
    let optionalInput = document.getElementById(`id_${optionalField}`);
    if (optionalInput.hasAttribute('disabled')) {
      optionalInput.removeAttribute('disabled');
      optionalInput.setAttribute('required', true);
    }
  }

  // Remove the hidden bullet point inputs left behind by the form after it has reset
  let bulletPointInputs = clearingForm.getElementsByClassName('bullet-point-inputs');
  for (let bullet of bulletPointInputs) {
    bullet.setAttribute('data-item-id', '0');
    while (bullet.children.length > 0) {
      bullet.children[0].remove();
    }
  }
}


const savedAccordions = {};
/**
 * Initializes an accordion
 * @param {Element} accordionParent The parent of the list of accordions
 * @param {String} experienceType The type of experience list ("work", "education", "project")
 */
function setAccordion(accordionParent, experienceType) {
  let parentId = accordionParent.id;
  let listItems = accordionParent.children;
  let itemData = [];
  for (let item of listItems) {
    let itemHeading = item.getElementsByClassName(`${experienceType}-collapse-heading`)[0];

    // Remove the aria-expanded attribute as it gets added again below
    itemHeading.children[0].removeAttribute('aria-expanded');

    let itemBody = item.getElementsByClassName(`${experienceType}-collapse-body`)[0];
    itemData.push({
      id: itemHeading.id,
      triggerEl: itemHeading,
      targetEl: itemBody,
      active: false
    });
  }

  // Returning functionality to the dropdown icons
  let accordion = new Accordion(accordionParent, itemData);
  accordion.updateOnToggle(() => {
    updateAccordionIcons(parentId);
  });

  savedAccordions[experienceType] = accordion;
}


/**
 * Deletes a row in the item list
 * @param {Element} deleteElement The VALUE part of the row
 */
function deleteItemListRow(deleteElement) {
  // Move 2 siblings up to find the label. Only moving 1 results in a blank space
  let deleteElementLabel = deleteElement.previousSibling.previousSibling;
  deleteElement.remove();
  deleteElementLabel.remove();
}


/**
 * Updates the accordion items depending on what is active
 * @param {String} accordionParentId The id of the parent accordion element
 */
function updateAccordionIcons(accordionParentId) {
  let accordionParent = document.getElementById(accordionParentId);
  let children = accordionParent.children;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let heading = child.getElementsByTagName('h2')[0];
    // Remove FlowBites default color settings when the accordion is clicked
    heading.className = 'work-collapse-heading 2xl:w-[50%]';
    let isActive = (heading.getAttribute('aria-expanded') == 'true');
    let button = heading.getElementsByTagName('button')[0];
    button.classList.remove('rounded-b-xl');
    let buttonIcon = heading.getElementsByTagName('svg')[0];
    buttonIcon.classList.remove('rotate-180');
    
    if (!isActive) {
      buttonIcon.classList.add('rotate-180');
      if (i === children.length - 1) {
        button.classList.add('rounded-b-xl');
      }
    }
  }
}


window.addEventListener('DOMContentLoaded', () => {
  // Removes any custom validity every time the input changes
  const addItemInputs = document.getElementsByClassName('add-item-input');
  for (let itemInput of addItemInputs) {
    itemInput.addEventListener('input', function() {
      this.setCustomValidity("");
    });
  }

  // Forcing dependent elements that are not required by default to be required
  const dependentIds = ['id_end_date', 'id_end_year', 'id_grade'];
  for (let depId of dependentIds) {
    let element = document.getElementById(depId);
    element.required = true;
  }

  // Initializing all accordions. Must use a timeout because window.onload is called to quick
  setTimeout(() => {
    for (let [experienceType, objectProperties] of Object.entries(experienceProperties)) {
      let accordionElement = document.getElementById(objectProperties.target);
      if (accordionElement.children.length > 0) {
        setAccordion(accordionElement, experienceType);
      }
    }
  }, 700);
});