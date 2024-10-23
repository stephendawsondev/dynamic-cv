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
  let autocompleteBullets = [...fullListElement.children].map(item => item.innerText);

  // If there is a value in the input, only show autocomplete items that contain that input
  if (inputElement.value) {
    autocompleteBullets = autocompleteBullets.filter(item => item.toLowerCase().includes(inputElement.value.toLowerCase()));
  }

  // Only showing the autocomplete items if they are not already in the list
  let usedBullets = [...inputElement.closest('form').querySelector('.item-list').children].map(item => item.children[0].children[0].innerText);
  
  for (let bullet of autocompleteBullets) {
    if (!usedBullets.includes(bullet)) {
      autocompleteList.push(bullet);
    }
  }
  return autocompleteList;
}


function updateAutocompleteList(inputElement) {
  // Deleting the old autocomplete list, if one exists
  let oldAutocomplete = inputElement.parentNode.getElementsByClassName('autocomplete-list');
  if (oldAutocomplete.length > 0) {
    deleteAutocompleteList();
  }
  // Generating the list of autocomplete items
  const autocompleteItems = getAutocompleteList(inputElement);

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
    window.addEventListener('keydown', navigateAutocomplete);

    for (let autocompleteItem of autocompleteItems) {
      let itemElement = document.createElement('li');
      itemElement.className = 'w-full px-4 py-2 border-b border-gray-200 cursor-pointer bg-white data-[selected="true"]:bg-gray-100';
      itemElement.innerText = autocompleteItem;
      itemElement.setAttribute('data-hover', false);
      itemElement.setAttribute('data-selected', false);

      itemElement.addEventListener('click', function() {
        inputElement.value = this.innerText;
        inputElement.parentNode.getElementsByClassName('add-item-submit')[0].click();
        deleteAutocompleteList();
      });
      // Updating the selected class if the item is hovered over
      itemElement.addEventListener('mouseenter', function() {
        [...this.parentNode.children].map(item => {
          item.setAttribute('data-hover', false);
          item.setAttribute('data-selected', false);
        });
        this.setAttribute('data-hover', true);
        this.setAttribute('data-selected', true);
      });
      itemElement.addEventListener('mouseleave', function() {
        this.setAttribute('data-hover', false);
      });
      element.appendChild(itemElement);
    }
    inputElement.parentNode.appendChild(element);
    window.addEventListener('scroll', updateAutocompletePosition);
    updateAutocompletePosition();
  }
}


/**
 * Moves the autocomplete list above the input if there is no room below
 */
function updateAutocompletePosition() {
  const autocompleteElement = document.getElementsByClassName('autocomplete-list')[0];
  if (autocompleteElement) {
    autocompleteElement.classList.remove('bottom-[100%]');
    const inputElement = autocompleteElement.parentNode.getElementsByClassName('add-item-input')[0];
    const inputBounds = inputElement.getBoundingClientRect();
    const listHeight = autocompleteElement.offsetHeight;
    if (inputBounds.y > window.innerHeight - listHeight - inputElement.offsetHeight - 32) {
      autocompleteElement.classList.add('bottom-[100%]');
    }
  }
}


/**
 * Handles the keyboard shortcuts for navigating the autocomplete list
 * @param {Event} event The JavaScript keydown event
 */
function navigateAutocomplete(event) {
  // Scrolling up and down the autocomplete list using the up and down arrow keys
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    // Only scroll using the up and down keys if the user is not hovering over an item
    const autocompleteElement = document.getElementsByClassName('autocomplete-list')[0];
    let hoveredItems = [...autocompleteElement.children].filter((item) => item.getAttribute('data-hover') === "true");
    if (hoveredItems.length === 0) {
      event.preventDefault();
      let children = autocompleteElement.children;

      // Finds the index of the current selected 
      let foundIndex = findSelectedAutocompleteItem();
      if (foundIndex >= 0) {
        children[foundIndex].setAttribute('data-selected', false);
      }
      // Down arrow key
      if (event.key === 'ArrowDown') {
        if (foundIndex + 1 < children.length) {
          foundIndex++;
        }
      }
      // Up arrow key
      else {
        if (foundIndex> -1) {
          foundIndex--;
        }
      }
      if (foundIndex >= 0) {
        let newSelectedItem = children[foundIndex];
        newSelectedItem.setAttribute('data-selected', true);
        // Moving the scrollbar if the selected item is outside of the visible window
        let listHeight = autocompleteElement.offsetHeight;
        let itemHeight = newSelectedItem.offsetHeight;
        if (itemHeight * foundIndex < autocompleteElement.scrollTop) {
          autocompleteElement.scrollTo(0, itemHeight * foundIndex);
        }
        else if (newSelectedItem.offsetHeight * (foundIndex + 1) > autocompleteElement.scrollTop + listHeight) {
          autocompleteElement.scrollTo(0, (itemHeight * (foundIndex + 1)) - listHeight);
        }
      }
    }
  }
  else if (event.key === 'Enter' || event.key === 'Tab') {
    const autocompleteElement = document.getElementsByClassName('autocomplete-list')[0];
    const selectedIndex = findSelectedAutocompleteItem();

    if (selectedIndex >= 0) {
      const selectedText = autocompleteElement.children[selectedIndex].innerText;
      autocompleteElement.parentElement.getElementsByClassName('add-item-input')[0].value = selectedText;
      if (event.key === 'Tab') {
        event.preventDefault();
      }
      deleteAutocompleteList();
    }
  }
}


/**
 * Removes an autocomplete list, and unbinds the keydown event from the window
 */
function deleteAutocompleteList() {
  let autocompleteList = document.getElementsByClassName('autocomplete-list');
  if (autocompleteList.length > 0) {
    window.removeEventListener('keydown', navigateAutocomplete);
    window.removeEventListener('scroll', updateAutocompletePosition);
    autocompleteList[0].remove();
  }
}


/**
 * Finds the position of the selected autocomplete item
 * @returns {Number} The index of the selected item in the autocomplete list (or -1 if none is found)
 */
function findSelectedAutocompleteItem() {
  const autocompleteElement = document.getElementsByClassName('autocomplete-list')[0];
  const children = autocompleteElement.children; 
  let itemIndex = -1;
  for (let i = 0; i < children.length; i++) {
    if (children[i].getAttribute('data-selected') === 'true') {
      itemIndex = i;
      break;
    }
  }
  return itemIndex;
}


window.addEventListener('DOMContentLoaded', () => {
  // Removes any custom validity every time the input changes
  const addItemInputs = document.getElementsByClassName('add-item-input');
  for (let itemInput of addItemInputs) {
    itemInput.addEventListener('input', function() {
      this.setCustomValidity("");
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
    // Add the autocomplete element when the input is focused on and updated
    item.addEventListener('focus', () => updateAutocompleteList(item));
    item.addEventListener('input', () => updateAutocompleteList(item));
    // Add the autocomplete element when the input is focused on
    item.addEventListener('focusout', () => {
      let element = item.parentNode.getElementsByClassName('autocomplete-list')[0];
      if (element && element.getAttribute('data-hover') === 'false') {
        deleteAutocompleteList();
      }
    });
  });
});