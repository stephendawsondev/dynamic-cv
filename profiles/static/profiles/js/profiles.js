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
  for (let disableId of disableIds) {
    let disableElement = document.getElementById(disableId);
    disableElement.disabled = this.checked;
    disableElement.required = !this.checked;
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
  let itemElement = convertHtmlToDOM(listItemHtml)[0];
  this.getElementsByClassName('item-list')[0].appendChild(itemElement);

  inputElement.value = "";
  setTimeout(enableRemoveButton, 1, itemElement);
}


/**
 * Returns a list of bullet points saved in the user's profile
 * @param {Element} inputElement The input element requesting the autocomplete
 * @returns {Array} A list of bullet point names
 */
function getAutocompleteList(inputElement) {
  let autocompleteList = [];
  let fullListId = "autocomplete-list-";
  const inputClass = inputElement.className;
  if (inputClass.includes('skill')) {
    fullListId += "skill";
  }
  else {
    fullListId += "bullet-";
    if (inputClass.includes('work')) {
      fullListId += 'work';
    }
    else {
      fullListId += 'education';
    }
  }
  const fullListElement = document.getElementById(fullListId);

  // Only showing the autocomplete items if they are not already in the list
  let autocompleteBullets = [...fullListElement.children].map(item => item.innerText);
  let usedBullets = [...inputElement.closest('form').querySelector('.item-list').children].map(item => item.children[0].children[0].innerText);
  
  for (let bullet of autocompleteBullets) {
    if (!usedBullets.includes(bullet)) {
      autocompleteList.push(bullet);
    }
  }
  return autocompleteList;
}


window.addEventListener('DOMContentLoaded', () => {
  // Removes any custom validity every time the input changes
  const addItemInputs = document.getElementsByClassName('add-item-input');
  for (let itemInput of addItemInputs) {
    itemInput.addEventListener('input', function() {
      this.setCustomValidity("");
    });
  }

  // Form validation for the skill input
  let noSpecCharInputs = document.getElementsByClassName('no-special-chars');
  for (let charInput of noSpecCharInputs) {
    charInput.addEventListener('input', function () {
      let skillTextValidity = '';
      let skillValue = this.value;
  
      // No special characters
      let hasSpecialCharacters = false;
  
      // The character ^ seems to mess with the regex here, so remove it before the evaluation
      let skillTextChars = skillValue.replace('^', '');
      if (skillTextChars !== skillValue) {
        hasSpecialCharacters = true;
      }
      else {
        skillTextChars = skillValue.replace(/([a-zA-z0-9 ]+)/g, '');
        if (skillTextChars.length > 0) {
          hasSpecialCharacters = true;
        }
      }
      if (hasSpecialCharacters) {
        skillTextValidity = "Skill cannot contain special characters";
      }
  
      this.setCustomValidity(skillTextValidity);
    });
  }

  function validateDates(startElement, endElement) {
    startElement.setCustomValidity('');
    let checkboxInput = document.getElementById('id_experience_active');
    if (!checkboxInput) {
      if (startElement.id.includes('date')) {
        checkboxInput = document.getElementById('id_current_work');
      }
      else {
        checkboxInput = document.getElementById('id_current_education');
      }
    }
    if (!checkboxInput.checked && endElement.value) {
      let startDateValues = startElement.value.split('-');
      let endDateValues = endElement.value.split('-');
      let isInvalidDate = true;
      for (let i in startDateValues) {
        if (parseInt(startDateValues[i]) < parseInt(endDateValues[i])) {
          isInvalidDate = false;
          break;
        }
        else if (parseInt(startDateValues[i]) > parseInt(endDateValues[i])) {
          isInvalidDate = true;
          break;
        }
      }
      if (isInvalidDate) {
        startElement.setCustomValidity('Start date cannot be after end date');
      }
    }
  }
  
  const experienceActiveChecks = document.getElementsByClassName('is-active-check');
  for (let checkbox of experienceActiveChecks) {
    checkbox.addEventListener('click', checkActiveExperience);
    checkActiveExperience.call(checkbox);
  }

  // Adding the bullet points to the list
  const addItemForms = document.getElementsByClassName('add-item-form');
  for (let itemForm of addItemForms) {
    itemForm.addEventListener('submit', addListItem);
  }

  // Making sure the start date is less than the end date
  let startDates = [
    document.getElementById('id_start_date'),
    document.getElementById('id_start_year')
  ];
  let endDates = [
    document.getElementById('id_end_date'),
    document.getElementById('id_end_year')
  ];
  for (let i in startDates) {
    let startElement = startDates[i];
    let endElement = endDates[i];
    if (startElement) {
      startElement.addEventListener('input', function() {
        validateDates(startElement, endElement);
      });
      endElement.addEventListener('input', function() {
        validateDates(startElement, endElement);
      });
    }
  }
  // Validating the dates when the checkbox is clicked
  let checkboxes = [
    document.getElementById('id_experience_active'),
    document.getElementById('id_current_work'),
    document.getElementById('id_current_education'),
  ];
  for (let checkbox of checkboxes) {
    if (checkbox) {
      checkbox.addEventListener('click', function() {
        let startDates = [
          document.getElementById('id_start_date'),
          document.getElementById('id_start_year')
        ];
        if (checkbox.id === 'id_current_work') {
          startDates.splice(1, 1);
        }
        else if (checkbox.id === 'id_current_edication') {
          startDates.splice(0, 1);
        }
        for (let startDate of startDates) {
          if (startDate) {
            startDate.dispatchEvent(new Event('input'));
          }
        }
      });
    }
  }

  // Add custom autocomplete to work experience and education bullet points
  document.querySelectorAll('.autocomplete').forEach((item) => {
    // Add the autocomplete element when the input is focused on
    item.addEventListener('focus', () => {
      // Generating the list of autocomplete items
      const autocompleteItems = getAutocompleteList(item);

      if (autocompleteItems.length > 0) {
        let element = document.createElement("ul");
        element.className = "autocomplete-list w-full z-40 absolute max-h-64 overflow-y-auto text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg";
        element.setAttribute('data-hover', false);

        element.addEventListener('mouseenter', function() {
          this.setAttribute('data-hover', true);
        });
        element.addEventListener('mouseleave', function() {
          this.setAttribute('data-hover', false);
        });

        for (let autocompleteItem of autocompleteItems) {
          let itemElement = document.createElement('li');
          itemElement.className = 'w-full px-4 py-2 border-b border-gray-200 cursor-pointer bg-white hover:bg-gray-100';
          itemElement.innerText = autocompleteItem;
          itemElement.addEventListener('click', function() {
            item.value = this.innerText;
            item.parentNode.getElementsByClassName('add-item-submit')[0].click();
            this.parentNode.remove();
          });
          element.appendChild(itemElement);
        }
  
        item.parentNode.appendChild(element);
      }
    });
    // Add the autocomplete element when the input is focused on
    item.addEventListener('focusout', () => {
      let element = item.parentNode.getElementsByClassName('autocomplete-list')[0];
      if (element && element.getAttribute('data-hover') === 'false') {
        element.remove();
      }
    });
  });
});