// Adds the skill
document.getElementById('skill-form').addEventListener('submit', function (event) {
  event.preventDefault();
  let submitButton = document.getElementById('submit-skill');
  let skillInput = document.getElementById('new-skill-text');
  let skillText = skillInput.value;
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
  fetch(`/profile/add-skill/${skillText.replace(' ', '-')}`, {
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