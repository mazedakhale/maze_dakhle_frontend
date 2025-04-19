// src/utils/formValidators.js

// — Email must be non‑empty and match a basic email pattern
export function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
}

// — Phone must be exactly `digits` digits (default 10)
export function isValidPhone(phone, digits = 10) {
    if (typeof phone !== 'string' && typeof phone !== 'number') return false;
    const str = String(phone).trim();
    return new RegExp(`^[0-9]{${digits}}$`).test(str);
}

/**
 * Password must be at least 8 characters, include:
 *  - one lowercase letter
 *  - one uppercase letter
 *  - one digit
 *  - one special character
 */
export function isValidPassword(pw) {
    if (typeof pw !== 'string') return false;
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-[\]{};':"\\|,.<>/?~`]).{8,}$/;
    return re.test(pw);
}

/**
 * validateRegistration
 * @param {object} data   { email, password, phone, [other fields…] }
 * @returns {object}      { ok: boolean, errors: { fieldName: "error message" } }
 */
export function validateRegistration(data) {
    const errors = {};

    if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address.';
    }
    if (!isValidPassword(data.password)) {
        errors.password =
            'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.';
    }
    if (!isValidPhone(data.phone)) {
        errors.phone = 'Phone number must be exactly 10 digits.';
    }

    return {
        ok: Object.keys(errors).length === 0,
        errors,
    };
}
