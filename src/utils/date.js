// src/utils/date.js
import { format } from 'date-fns';

// you can tweak here, e.g. parse different inputs
export function formatDate(dateInput) {
    const date = typeof dateInput === 'string'
        ? new Date(dateInput)
        : dateInput;
    return format(date, 'dd-MM-yyyy');
}
