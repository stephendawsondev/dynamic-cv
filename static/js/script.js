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