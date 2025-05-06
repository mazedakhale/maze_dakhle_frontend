export function isValidName(name) {
  if (typeof name !== "string") return false;
  const re = /^[A-Za-z\s]+$/;
  return re.test(name.trim());
}

export function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function isValidPhone(phone, digits = 10) {
  if (typeof phone !== "string" && typeof phone !== "number") return false;
  const str = String(phone).trim();
  return new RegExp(`^[0-9]{${digits}}$`).test(str);
}

export function isValidPassword(pw) {
  if (typeof pw !== "string") return false;
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return re.test(pw);
}

export function validateRegistration(data) {
  const errors = {};

  if (!isValidName(data.name)) {
    errors.name = "Name must contain only letters and spaces.";
  }

  if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!isValidPassword(data.password)) {
    errors.password =
      "Password must include uppercase, lowercase, number, symbol (min 8 chars).";
  }

  if (!isValidPhone(data.phone)) {
    errors.phone = "Phone number must be exactly 10 digits.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}
