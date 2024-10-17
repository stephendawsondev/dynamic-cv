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


function addBulletPoint(bulletType, bulletId) {
  let formElement = document.querySelector(`#${bulletType}-form`);
  let bulletList = document.getElementById(bulletType + '-list');
  let bulletTextInput = formElement.querySelector('input[name="val"]');
  let bulletVal = bulletTextInput.value;
  bulletTextInput.value = "";
  let bulletItemHtml = `
  <li id="${bulletType}-${bulletId}" class="${bulletType}-item list-disc">
    <span class="flex flex justify-between">
      <span>${bulletVal}</span>
      <button type="button" class="delete-${bulletType}" data-${bulletType}="${bulletId}"><span
          class="text-2xl">&times;</span></button>
    </span>
  `;
  // Interpret the above HTML as DOM objects
  let bulletItem = new DOMParser().parseFromString(bulletItemHtml, 'text/html').getElementsByClassName(bulletType + '-item')[0];
  bulletList.appendChild(bulletItem);
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
        document.getElementById(`${bulletType}-${bulletId}`).remove();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}


window.addEventListener('DOMContentLoaded', () => {
  let skillForm = document.getElementById('skill-form');
  if (skillForm) {
  
    let skillSet = document.getElementsByClassName('skill-item');
    for (let skill of skillSet) {
      addBulletDeleteEvent(skill, 'skill');
    }
  }
});