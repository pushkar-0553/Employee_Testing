// Storage utility functions for consistent localStorage operations

export const STORAGE_KEYS = {
  EMPLOYEES: 'employees',
  USER: 'user',
  TOKEN: 'token',
  ADMIN_CREDENTIALS: 'admin_credentials'
};

// Safe localStorage operations with error handling
export const storage = {
  // Get data from localStorage with validation
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      
      // Parse JSON if it looks like JSON
      if (item.startsWith('{') || item.startsWith('[')) {
        return JSON.parse(item);
      }
      
      return item;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  // Set data to localStorage with validation
  set: (key, value) => {
    try {
      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, String(value));
      }
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  },

  // Remove item from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Debounce utility to prevent rapid successive calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Ensure data integrity before operations
export const validateEmployeeData = (employee) => {
  const required = ['first_name', 'last_name', 'phone_number', 'role'];
  const errors = [];

  required.forEach(field => {
    if (!employee[field] || String(employee[field]).trim() === '') {
      errors.push(`${field} is required`);
    }
  });

  if (employee.phone_number && !/^\d{10}$/.test(employee.phone_number)) {
    errors.push('Phone number must be exactly 10 digits');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
