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


/**
 * Converts a work experience form input into a list item to be displayed in the list.
 * Ignore the warnings for undeclared variables. They are declared in a script
 * tag in work-experience-form.html
 */
function addWorkExperienceHtml() {
  let workExperienceData = JSON.parse(document.getElementById('work-input-data').innerText);
  let elements = convertHtmlToDOM(workExperienceHtml);
  let workListElement = elements[0];
  
  // Filling out the new information into the new set of elements
  workListElement.getElementsByClassName('work-exp-organization')[0].innerText = workExperienceData.organization;
  workListElement.getElementsByClassName('work-exp-location')[0].innerText = workExperienceData.location;
  workListElement.getElementsByClassName('work-exp-position')[0].innerText = workExperienceData.position;
  workListElement.getElementsByClassName('work-exp-date')[0].innerText = `${workExperienceData.start_date} - ${workExperienceData.end_date}`;

  for (let [key, value] of Object.entries(workExperienceData)) {
    if (key.includes("work-responsibilities")) {
      let newListItem = convertHtmlToDOM(responsibilityItem)[0];
      newListItem.innerText = value;
      workListElement.getElementsByClassName('work-rsp-list')[0].appendChild(newListItem);
    }
    else if (key.includes("work-skills")) {
      let newListItem = convertHtmlToDOM(skillItem)[0];
      newListItem.innerText = value;
      workListElement.getElementsByClassName('work-skill-list')[0].appendChild(newListItem);
    }
  }
  for (let element of elements) {
    document.getElementById('work-list').appendChild(element);
  }
}


const experienceProperties = {
  work: {
    target: 'work-list',
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

  },
}

function addExperienceHtml(experienceType) {

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
    let elementId = `item-${inputMainForm}-${itemId}`;
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


let addItemForms = document.getElementsByClassName('add-item-form');
for (let itemForm of addItemForms) {
  itemForm.addEventListener('submit', addListItem);
}

// Removes any custom validity every time the input changes
let addItemInputs = document.getElementsByClassName('add-item-input');
for (let itemInput of addItemInputs) {
  itemInput.addEventListener('input', function() {
    this.setCustomValidity("");
  });
}