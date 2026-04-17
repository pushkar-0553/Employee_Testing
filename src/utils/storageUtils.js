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
      console.log(`📖 localStorage.get called for key: ${key}`);
      const item = localStorage.getItem(key);
      
      if (item === null) {
        console.log(`⚠️ localStorage.get: ${key} not found, returning defaultValue`);
        return defaultValue;
      }
      
      console.log(`📦 localStorage.get: ${key} found, length: ${item.length} characters`);
      
      // Parse JSON if it looks like JSON
      if (item.startsWith('{') || item.startsWith('[')) {
        const parsed = JSON.parse(item);
        console.log(`✅ localStorage.get: ${key} parsed as ${Array.isArray(parsed) ? 'array' : 'object'} with ${parsed.length || Object.keys(parsed).length} items`);
        return parsed;
      }
      
      console.log(`✅ localStorage.get: ${key} returned as string`);
      return item;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  // Set data to localStorage with validation
  set: (key, value) => {
    try {
      console.log(`💾 localStorage.set called for key: ${key}`);
      console.log(`📝 Data being saved:`, typeof value === 'object' ? `${value.length} items` : value);
      
      if (typeof value === 'object') {
        const jsonString = JSON.stringify(value);
        console.log(`📦 JSON string length: ${jsonString.length} characters`);
        localStorage.setItem(key, jsonString);
      } else {
        localStorage.setItem(key, String(value));
      }
      
      // Verify it was actually saved
      const saved = localStorage.getItem(key);
      if (saved) {
        console.log(`✅ localStorage.set successful for ${key}`);
      } else {
        console.error(`❌ localStorage.set failed for ${key}`);
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

// Check localStorage integrity and prevent data reset
export const checkLocalStorageIntegrity = (key) => {
  console.log(`🔍 Checking localStorage integrity for key: ${key}`);
  
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      console.log(`⚠️ No data found for key: ${key}`);
      return { exists: false, isValid: false, data: null };
    }
    
    // Try to parse if it's JSON
    if (data.startsWith('{') || data.startsWith('[')) {
      const parsed = JSON.parse(data);
      console.log(`✅ Data integrity check passed for ${key}:`, {
        type: Array.isArray(parsed) ? 'array' : 'object',
        itemCount: parsed.length || Object.keys(parsed).length,
        size: data.length
      });
      return { exists: true, isValid: true, data: parsed };
    }
    
    console.log(`✅ String data integrity check passed for ${key}:`, {
      size: data.length
    });
    return { exists: true, isValid: true, data };
  } catch (error) {
    console.error(`❌ Data integrity check failed for ${key}:`, error);
    return { exists: true, isValid: false, data: null, error };
  }
};

// Prevent localStorage reset during automation
export const preventLocalStorageReset = (key) => {
  console.log(`🛡️ Setting up protection for ${key} during automation`);
  
  // Store original data before any potential reset
  const originalData = localStorage.getItem(key);
  
  // Override localStorage.setItem to prevent unwanted resets
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(k, value) {
    if (k === key && value === '[]') {
      console.warn(`🚫 Blocked attempt to reset ${key} to empty array`);
      return;
    }
    return originalSetItem.call(this, k, value);
  };
  
  return () => {
    // Restore original function
    localStorage.setItem = originalSetItem;
  };
};
