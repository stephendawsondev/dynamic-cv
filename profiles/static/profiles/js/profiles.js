/**
 * Converts an HTML string into a set of DOM objects. Taken from ChatGPT
 * @param {String} htmlString The HTML to be converted
 * @returns {DOM} A set of DOM objects created 
 */
function convertHtmlToDOM(htmlString) {
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');
  let children = doc.body.childNodes;
  let elementList = [];
  children.forEach((element) => {
    elementList.push(element); 
  });
  return elementList;
}


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
    bulletPoints: {
      'work-responsibilities': 'work-rsp-list',
      'work-skills': 'work-skill-list'
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
    bulletPoints: {
      'education-modules': 'education-modules-list',
      'education-skills': 'education-skill-list'
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
    }
  }
}

/**
 * 
 * @param {String} experienceType The key to reference the above object experienceProperties
 */
function addExperienceHtml(experienceType) {
  let propertyObject = experienceProperties[experienceType];

  // Remove the hidden bullet point inputs left behind by the form after it has reset
  let bulletPointInputs = document.getElementById(propertyObject.form).getElementsByClassName('bullet-point-inputs');
  for (let bullet of bulletPointInputs) {
    bullet.setAttribute('data-item-id', '0');
    while (bullet.children.length > 0) {
      bullet.children[0].remove();
    }
  }

  // Retrieving the data posted from the server
  let workExperienceData = JSON.parse(document.getElementById(propertyObject['dataSource']).innerText);
  let elements = convertHtmlToDOM(propertyObject.html);
  let itemListElement = elements[0];
  
  // Filling out the new information into the new set of elements
  for (let [field, className] of Object.entries(propertyObject.fields)) {
    let value = workExperienceData[field];

    // Connecting the start and end date
    if (field == 'date') {
      let startDate = null;
      let endDate = 'Present';
      for (let [propField, propValue] of Object.entries(workExperienceData)) {
        if (propField.includes('start_')) {
          startDate = propValue;
        }
        else if (propField.includes('end_') && propValue) {
          endDate = propValue;
        }
      }
      itemListElement.getElementsByClassName(className)[0].innerText = `${startDate} - ${endDate}`;
    }
    else {
      // For all other fields
      itemListElement.getElementsByClassName(className)[0].innerText = value;
    }
  }

  if ('bulletPoints' in propertyObject) {
    for (let [key, value] of Object.entries(workExperienceData)) {
      for (let [bulletField, className] of Object.entries(propertyObject.bulletPoints)) {
        if (key.includes(bulletField)) {
          let newListItem = convertHtmlToDOM(listItem)[0];
          newListItem.innerText = value;
          itemListElement.getElementsByClassName(className)[0].appendChild(newListItem);
        }
      }
    }
  }
  for (let element of elements) {
    document.getElementById(propertyObject.target).appendChild(element);
  }
}


/**
 * When an item add form is submitted, this adds the item to the list of already existing items
 * @param {Event} event the event that is called
 */
function addListItem(event) {
  event.preventDefault();
    let inputElement = this.getElementsByClassName('add-item-input')[0];
    let inputText = inputElement.value.trim();
    let inputMainId = this.getAttribute('data-main-input');
    let inputMainForm = document.getElementById(inputMainId);
    let itemId = parseInt(inputMainForm.getAttribute('data-item-id'));

    // Checking for duplicates
    let currentItems = inputMainForm.children;
    for (let item of currentItems) {
      let itemText = item.value;
      if (itemText === inputText) {
        inputElement.setCustomValidity("Cannot enter the same value twice");
        setTimeout(() => {this.getElementsByClassName('add-item-submit')[0].click()}, 1);
        return;
      }
    }
    
    // Creating a hidden input to store this item
    let hiddenInput = document.createElement('input');
    let mainListId = `${inputMainId}-${itemId}`;
    hiddenInput.type = 'hidden';
    hiddenInput.name = mainListId;
    hiddenInput.id = mainListId;
    hiddenInput.value = inputText;
    inputMainForm.appendChild(hiddenInput);
    inputMainForm.setAttribute('data-item-id', `${itemId + 1}`);

    // Rendering the item on the frontend
    let elementId = `item-${inputMainId}-${itemId}`;
    let listItemHtml = `
    <li id="${elementId}" class="list-item list-disc" data-main-list="${mainListId}">
      <span class="flex flex justify-between">
        <span>${inputText}</span>
        <button type="button" class="delete-list-item" data-id="${elementId}"><span
            class="text-2xl">&times;</span></button>
      </span>
    `;
    // Interpret the above HTML as DOM objects
    let itemElement = new DOMParser().parseFromString(listItemHtml, 'text/html').getElementsByClassName('list-item')[0];
    this.getElementsByClassName('item-list')[0].appendChild(itemElement);

    inputElement.value = "";
    setTimeout(enableRemoveButton, 1, itemElement);
}


/**
 * Removes the specified item from the list and the main form's gidden inputs
 * @param {Element} element The element of the item to be deleted
 */
function enableRemoveButton(element) {
  element.getElementsByClassName('delete-list-item')[0].addEventListener('click', function(event) {
    let removeElement = document.getElementById(this.getAttribute('data-id'));
    let mainListElement = document.getElementById(removeElement.getAttribute('data-main-list'));
  
    mainListElement.remove();
    removeElement.remove();
  })
}


/**
 * Is called when the checkbox for when the user is currently in a work/education
 * experience. Enables/Disables the fields specified in the checkbox depending on its state
 */
function checkActiveExperience() {
  let disableIds = this.getAttribute('data-disables').split(',');
  console.log(this.checked);
  for (let disableId of disableIds) {
    let disableElement = document.getElementById(disableId);
    disableElement.disabled = this.checked;
    disableElement.required = !this.checked;
  }
}
const experienceActiveChecks = document.getElementsByClassName('is-active-check');
for (let checkbox of experienceActiveChecks) {
  checkbox.addEventListener('click', checkActiveExperience);
}
// Forcing dependent elements that are not required by default to be required
const dependentIds = ['id_end_date', 'id_end_year', 'id_grade'];
for (let depId of dependentIds) {
  let element = document.getElementById(depId);
  element.required = true;
}


// Adding the bullet points to the list
const addItemForms = document.getElementsByClassName('add-item-form');
for (let itemForm of addItemForms) {
  itemForm.addEventListener('submit', addListItem);
}

// Removes any custom validity every time the input changes
const addItemInputs = document.getElementsByClassName('add-item-input');
for (let itemInput of addItemInputs) {
  itemInput.addEventListener('input', function() {
    this.setCustomValidity("");
  });
}