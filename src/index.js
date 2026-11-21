import "./styles.css";

const form = document.querySelector("#signup-form");
const message = document.querySelector("#form-message");
const highFive = document.querySelector("#high-five");

const unavailableUsernames = new Set([
  "admin",
  "administrator",
  "support",
  "root",
  "guest",
  "signup",
]);

const getErrorElement = (field) => document.querySelector(`#${field.id}-error`);

const setFieldError = (field, text) => {
  field.classList.toggle("is-invalid", Boolean(text));
  const error = getErrorElement(field);
  if (error) {
    error.textContent = text;
  }
};

const isNameValid = (field) =>
  /^[^0-9!@#$%^&*()+={}\[\]|\\;:'",<>?/~`]+$/u.test(field.value.trim()) &&
  field.value.trim().length >= 2;

const isPasswordValid = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[^A-Za-z0-9\s]/.test(password);

const validateField = (field) => {
  if (!field) return true;

  let error = "";
  const value = field.value.trim();

  if (field.required && !value) {
    error = "This field is required.";
  } else if (field.id === "first-name" || field.id === "last-name") {
    if (!isNameValid(field)) {
      error = "Use at least 2 letters; numbers and symbols are not allowed.";
    }
  } else if (field.id === "city") {
    if (
      value.length < 2 ||
      /\d|[!@#$%^&*()+={}\[\]|\\;:'",<>?/~`]/u.test(value)
    ) {
      error = "Enter a city name with at least 2 letters.";
    }
  } else if (field.id === "zip-code") {
    if (!/^[-A-Za-z0-9 ]{3,10}$/.test(value)) {
      error = "Enter a valid zip or postal code.";
    }
  } else if (field.type === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      error = "Enter a valid email address.";
    }
  } else if (field.id === "phone") {
    if (!/^\+?[0-9][0-9 ()-]{5,19}$/.test(value)) {
      error =
        "Enter a phone number with its country code, for example 0041 79 123 45 67.";
    }
  } else if (field.id === "username") {
    if (!/^[A-Za-z0-9._-]{3,}$/.test(value)) {
      error = "Use at least 3 letters, numbers, dots, hyphens or underscores.";
    } else if (unavailableUsernames.has(value.toLowerCase())) {
      error = "This username is not available.";
    }
  } else if (field.id === "password") {
    if (!isPasswordValid(value)) {
      error =
        "Use 8+ characters, one capital letter and one special character.";
    }
  } else if (field.id === "confirm-password") {
    const password = form.elements.password.value;
    if (value !== password) {
      error = "Passwords do not match.";
    }
  }

  setFieldError(field, error);
  return !error;
};

form.querySelectorAll("input, select").forEach((field) => {
  field.addEventListener("blur", () => validateField(field));

  field.addEventListener("input", () => {
    if (field.classList.contains("is-invalid")) {
      validateField(field);
    }

    if (field.id === "password") {
      validateField(form.elements.confirmPassword);
    }

    if (field.id === "username") {
      const status = document.querySelector("#username-status");
      const username = field.value.trim().toLowerCase();

      if (username.length >= 3) {
        const available = !unavailableUsernames.has(username);
        status.textContent = available
          ? "✓ Username is available"
          : "× Username is already taken";
        status.className = `field-status ${available ? "available" : "taken"}`;
      } else {
        status.textContent = "";
        status.className = "field-status";
      }
    }
  });

  field.addEventListener("change", () => validateField(field));
});

form.addEventListener("submit", (event) => {
  event.preventEvent?.();
  event.preventDefault();

  highFive.classList.remove("show");
  highFive.setAttribute("aria-hidden", "true");

  const fields = [...form.querySelectorAll("input, select")];
  const invalidFields = fields.filter((field) => !validateField(field));

  if (invalidFields.length > 0) {
    message.textContent = `Please correct ${invalidFields.length} field${invalidFields.length === 1 ? "" : "s"} before sending the form.`;
    message.className = "error";
    invalidFields[0].focus();
    return;
  }

  const data = new FormData(form);
  message.textContent = `Thanks, ${data.get("firstName")}! Your account is ready.`;
  message.className = "success";
  highFive.classList.add("show");
  highFive.setAttribute("aria-hidden", "false");
  form.reset();

  fields.forEach((field) => {
    field.classList.remove("is-invalid");
  });

  document.querySelector("#username-status").textContent = "";
  document.querySelector("#username-status").className = "field-status";
});
