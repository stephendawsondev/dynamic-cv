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
 * Finds the CSRF token in an element
 * @param {String} elementId The ID of the element
 * @returns {String} The CSRF token, or an error if none is found
 */
function findCsrfToken(elementId) {
  let csrfToken = '';
  let formElements = document.getElementById(elementId).getElementsByTagName('input');
  for (let element of formElements) {
    if (element.name === 'csrfmiddlewaretoken') {
      csrfToken = element.value;
    }
  }
  if (csrfToken === '') {
    throw new Error("No CSRF token found");
  }
  return csrfToken;
}


/**
 * Processes the POST response for adding bullet points
 * @param {String} bulletType The type of bullet point being evaluated
 */
function processRequest(bulletType) {
  let formElement = document.querySelector(`#${bulletType}-form`);
  let bulletDataEl = formElement.querySelector(`#${bulletType}-data`);
  let bulletData = bulletDataEl.innerText;
  bulletDataEl.innerText = '';

  if (bulletData === 'Fail') {
    let bulletTextInput = formElement.querySelector('input[name="val"]');
    bulletTextInput.setCustomValidity('Cannot enter the same value more than once');
    formElement.querySelector(`#submit-${bulletType}`).click();
  }
  else {
    addBulletPoint(bulletType, bulletData);
  }
}


function addBulletPoint(bulletType, bulletId, bulletVal=null) {
  let formElement = document.querySelector(`#${bulletType}-form`);
  let bulletList = document.getElementById(bulletType + '-list');
  const bulletTextInput = formElement.querySelector('input[name="val"]');
  if (!bulletVal) {
    bulletVal = bulletTextInput.value;
  }
  bulletTextInput.value = "";
  let bulletItemHtml = `
  <li id="${bulletType}-${bulletId}" class="${bulletType}-item list-disc">
    <span class="flex flex justify-between">
      <span>${bulletVal}</span>
      <button type="button" class="delete-${bulletType}" data-${bulletType}="${bulletId}"><span
          class="text-2xl">&times;</span></button>
    </span>
  `;
  // If the bullet point is a skill, append it to the skill autocomplete list
  if (bulletType === 'skill') {
    let skillItem = document.createElement('div');
    skillItem.innerText = bulletVal;
    document.getElementById('autocomplete-list-skill').appendChild(skillItem);
  }
  // Interpret the above HTML as DOM objects
  let bulletItem = new DOMParser().parseFromString(bulletItemHtml, 'text/html').getElementsByClassName(bulletType + '-item')[0];
  bulletList.appendChild(bulletItem);
  // Wait until the appending of the element has been processed before adding functionality to the delete button
  setTimeout(addBulletDeleteEvent, 1, bulletItem, bulletType);
}


/**
 * Adds the event listener to the object's close button
 * @param {Element} bulletItem The element of the bullet list item
 */
function addBulletDeleteEvent(bulletItem, bulletType) {
  bulletItem.getElementsByClassName('delete-' + bulletType)[0].addEventListener('click', function() {
    deleteBulletItem(this.getAttribute('data-' + bulletType), bulletType);
  });
}


/**
 * Removes a bullet item from the database
 * @param {String} bulletItem The bullet item to be removed
 * @param {String} bulletType The type of bullet to be deleted
 */
function deleteBulletItem(bulletId, bulletType) {
  let csrfToken = findCsrfToken(bulletType + '-list-form');
  // Sends the AJAX to add the skill to the server
  fetch(`/profile/remove-${bulletType}/${bulletId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({})
  })
    .then((response) => response.text())
    .then((response) => {
      if (response === 'Success') {
        let bulletElement = document.getElementById(`${bulletType}-${bulletId}`);
        // If the bullet is a skill, remove the skill from the autocomplete list
        if (bulletType === 'skill') {
          let skillName = bulletElement.children[0].children[0].innerText;
          let autocompleteItems = document.getElementById('autocomplete-list-skill').children;
          for (let child of autocompleteItems) {
            if (child.innerText === skillName) {
              child.remove();
              break;
            }
          }
          // Removing the skill from any experience that contains that item
          const experienceDisplays = [...document.getElementsByClassName('work-collapse-body'), ...document.getElementsByClassName('education-collapse-body')];
          for (let displayItem of experienceDisplays) {
            let skillListName = '';
            if (displayItem.id.includes('work')) {
              skillListName = 'work';
            }
            else if (displayItem.id.includes('education')) {
              skillListName = 'education';
            }
            skillListName += '-skill-list';
            const skillList = displayItem.getElementsByClassName(skillListName)[0];
            if (skillList) {
              let skillItems = skillList.children;
              for (let item of skillItems) {
                if (item.innerText === skillName) {
                  item.remove();
                  break;
                }
              }
              // Removing the row if there are no skills left
              if (skillList.children.length === 0) {
                deleteItemListRow(skillList);
              }
            }
          }
        }
        bulletElement.remove();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}


window.addEventListener('DOMContentLoaded', () => {
  let bulletForms = ['skill', 'hobby', 'extra-info'];

  for (let bullet of bulletForms) {
    let formElement = document.getElementById(bullet + '-form');
    if (formElement) {
    
      let bulletSet = document.getElementsByClassName(bullet + '-item');
      for (let item of bulletSet) {
        addBulletDeleteEvent(item, bullet);
      }
    }
  }
});