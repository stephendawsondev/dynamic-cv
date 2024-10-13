function addSkill(skill) {
  let skillList = document.getElementById('skill-list');
  let skillItemHtml = `
  <li id="skill-${skill}" class="skill-item list-disc">
    <span class="flex flex justify-between">
      <span>${skill.replace('-', ' ')}</span>
      <button type="button" class="delete-skill" data-skill="${skill}"><span
          class="text-2xl">&times;</span></button>
    </span>
  `;
  // Interpret the above HTML as DOM objects
  let skillItem = new DOMParser().parseFromString(skillItemHtml, 'text/html').getElementsByClassName('skill-item')[0];
  skillList.appendChild(skillItem);
  setTimeout(addSkillDeleteEvent, 1, skillItem);
}


/**
 * Adds the event listener to the object's close button
 * @param {Element} skillItem The element of the skill list item
 */
function addSkillDeleteEvent(skillItem) {
  skillItem.getElementsByClassName('delete-skill')[0].addEventListener('click', function() {
    deleteSkill(this.getAttribute('data-skill'));
  });
}


/**
 * Removes a skill from the database
 * @param {String} skill The skill to be removed
 */
function deleteSkill(skill) {
  let csrfToken = findCsrfToken('skill-list-form');
  // Sends the AJAX to add the skill to the server
  fetch(`/profile/remove-skill/${skill}`, {
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
        document.getElementById(`skill-${skill}`).remove();
      }
      else {
        console.log(response);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}


window.onload = () => {
  // Adds the skill
  document.getElementById('skill-form').addEventListener('submit', function (event) {
    event.preventDefault();
    let submitButton = document.getElementById('submit-skill');
    let skillInput = document.getElementById('new-skill-text');
    let skillText = skillInput.value;
    let skillTextSlug = skillText.replace(' ', '-');
    submitButton.disabled = true;
    skillInput.disabled = true;

    // Finds the csrf token
    let csrfToken = '';
    let formElements = this.getElementsByTagName('input');
    for (let element of formElements) {
      if (element.name === 'csrfmiddlewaretoken') {
        csrfToken = element.value;
      }
    }

    // Sends the AJAX to add the skill to the server
    fetch(`/profile/add-skill/${skillTextSlug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify({})
    })
      .then((response) => {
        // Enabling the buttons when the server gives a response
        submitButton.disabled = false;
        skillInput.disabled = false;
        return response.text();
      })
      .then((response) => {
        if (response === 'Success') {
          skillInput.value = "";
          // Create the new skill on the front end
          addSkill(skillTextSlug);
        }
        else {
          // Showing the validation message in the form of the input validation feedback
          skillInput.setCustomValidity('Cannot enter the same skill more than once');
          setTimeout(() => { submitButton.click(); }, 1);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });

  // Form validation for the skill input
  document.getElementById('new-skill-text').addEventListener('input', function () {
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


  let skillSet = document.getElementsByClassName('skill-item');
  for (let skill of skillSet) {
    addSkillDeleteEvent(skill);
  }
};