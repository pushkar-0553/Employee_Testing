import React, { createContext, useState, useEffect, useContext } from 'react';
import { storage, STORAGE_KEYS, validateEmployeeData } from '../utils/storageUtils';

const EmployeeContext = createContext();

// Default admin credentials
const DEFAULT_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123',
  name: 'Admin User'
};

const INITIAL_DATA = [
  {
    id: 1,
    emp_id: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    role: 'Senior Developer',
    date_of_joining: '2023-01-15',
    status: 1,
    blood_group: 'O+',
    contact_no: '9876543210',
    profile_picture: null,
  },
  {
    id: 2,
    emp_id: 'EMP002',
    first_name: 'Jane',
    last_name: 'Smith',
    role: 'UI/UX Designer',
    date_of_joining: '2023-03-10',
    status: 1,
    blood_group: 'A+',
    contact_no: '8765432109',
    profile_picture: null,
  },
  {
    id: 3,
    emp_id: 'EMP003',
    first_name: 'Robert',
    last_name: 'Wilson',
    role: 'Project Manager',
    date_of_joining: '2022-11-20',
    status: 0,
    exit_date: '2024-01-05',
    blood_group: 'B+',
    contact_no: '7654321098',
    profile_picture: null,
  }
];

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState(() => {
    return storage.get(STORAGE_KEYS.EMPLOYEES, INITIAL_DATA);
  });

  const [user, setUser] = useState(() => {
    return storage.get(STORAGE_KEYS.USER, null);
  });

  // Store credentials in state + localStorage (same pattern as employees)
  const [credentials, setCredentials] = useState(() => {
    return storage.get(STORAGE_KEYS.ADMIN_CREDENTIALS, DEFAULT_CREDENTIALS);
  });

  useEffect(() => {
    storage.set(STORAGE_KEYS.EMPLOYEES, employees);
  }, [employees]);

  useEffect(() => {
    if (user) {
      storage.set(STORAGE_KEYS.USER, user);
    } else {
      storage.remove(STORAGE_KEYS.USER);
      storage.remove(STORAGE_KEYS.TOKEN);
    }
  }, [user]);

  // Persist credentials to localStorage whenever they change
  useEffect(() => {
    storage.set(STORAGE_KEYS.ADMIN_CREDENTIALS, credentials);
  }, [credentials]);

  const login = (email, password) => {
    // Check against the stored credentials (not hardcoded)
    if (email === credentials.email && password === credentials.password) {
      const mockUser = { id: 'admin', email, name: credentials.name };
      setUser(mockUser);
      storage.set(STORAGE_KEYS.TOKEN, 'mock-jwt-token');
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
  };

  const changePassword = (currentPassword, newPassword) => {
    // Validate current password against stored credentials
    if (currentPassword !== credentials.password) {
      return { success: false, message: 'Current password is incorrect' };
    }
    // Update the credentials in state (triggers localStorage save via useEffect)
    setCredentials(prev => ({ ...prev, password: newPassword }));
    // Log the user out so they re-authenticate with the new password
    setUser(null);
    return { success: true };
  };

  const resetPassword = () => {
    setCredentials(prev => ({ ...prev, password: 'admin123' }));
    return { success: true };
  };

  const addEmployee = (employee) => {
    return new Promise((resolve, reject) => {
      // Validate employee data before processing
      const validation = validateEmployeeData(employee);
      if (!validation.isValid) {
        reject(new Error(validation.errors.join(', ')));
        return;
      }

      setEmployees(prev => {
        // Generate an EMP ID if it doesn't already have one (from the form)
        const lastEmp = prev.length > 0 ? prev[prev.length - 1] : null;
        let nextIdNumber = 1;
        if (lastEmp && lastEmp.emp_id) {
          const match = lastEmp.emp_id.match(/EMP(\d+)/);
          if (match) nextIdNumber = parseInt(match[1]) + 1;
        }
        const emp_id = `EMP${String(nextIdNumber).padStart(3, '0')}`;

        const newEmployee = {
          ...employee,
          id: Date.now(),
          emp_id: employee.emp_id || emp_id,
          status: 1, // Default to Active
        };
        
        const updated = [...prev, newEmployee];
        // Ensure localStorage is updated synchronously using storage utility
        storage.set(STORAGE_KEYS.EMPLOYEES, updated);
        
        resolve(newEmployee);
        return updated;
      });
    });
  };

  const updateEmployee = (id, updatedData) => {
    return new Promise((resolve) => {
      setEmployees(prev => {
        const updated = prev.map(emp => 
          emp.id === id ? { ...emp, ...updatedData, updated_at: new Date().toISOString() } : emp
        );
        // Ensure localStorage is updated synchronously using storage utility
        storage.set(STORAGE_KEYS.EMPLOYEES, updated);
        resolve(updated.find(emp => emp.id === id));
        return updated;
      });
    });
  };

  const deleteEmployee = (id, exitData) => {
    return new Promise((resolve) => {
      setEmployees(prev => {
        const updated = prev.map(emp => 
          emp.id === id ? { ...emp, status: 0, exit_date: new Date().toISOString().split('T')[0], ...exitData, updated_at: new Date().toISOString() } : emp
        );
        // Ensure localStorage is updated synchronously using storage utility
        storage.set(STORAGE_KEYS.EMPLOYEES, updated);
        resolve(updated.find(emp => emp.id === id));
        return updated;
      });
    });
  };

  const restoreEmployee = (id) => {
    return new Promise((resolve) => {
      setEmployees(prev => {
        const updated = prev.map(emp => 
          emp.id === id ? { ...emp, status: 1, exit_date: undefined, reason: undefined, updated_at: new Date().toISOString() } : emp
        );
        // Ensure localStorage is updated synchronously using storage utility
        storage.set(STORAGE_KEYS.EMPLOYEES, updated);
        resolve(updated.find(emp => emp.id === id));
        return updated;
      });
    });
  };

  return (
    <EmployeeContext.Provider value={{
      employees,
      user,
      credentials,
      login,
      logout,
      changePassword,
      resetPassword,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      restoreEmployee
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};
