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

  // Removed useEffect-based localStorage sync to prevent timing issues
  // localStorage is now updated synchronously within state updates

  // Removed useEffect-based localStorage sync to prevent timing issues
  // User data is now handled synchronously within login/logout functions

  // Removed useEffect-based localStorage sync to prevent timing issues
  // Credentials are now handled synchronously within changePassword function

  const login = (email, password) => {
    // Check against the stored credentials (not hardcoded)
    if (email === credentials.email && password === credentials.password) {
      const mockUser = { id: 'admin', email, name: credentials.name };
      
      // Update localStorage synchronously before state update
      storage.set(STORAGE_KEYS.USER, mockUser);
      storage.set(STORAGE_KEYS.TOKEN, 'mock-jwt-token');
      
      // Then update state
      setUser(mockUser);
      
      console.log('Login: User data saved to localStorage:', storage.get(STORAGE_KEYS.USER));
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    // Clear localStorage synchronously before state update
    storage.remove(STORAGE_KEYS.USER);
    storage.remove(STORAGE_KEYS.TOKEN);
    
    // Then update state
    setUser(null);
    
    console.log('Logout: User data cleared from localStorage');
  };

  const changePassword = (currentPassword, newPassword) => {
    // Validate current password against stored credentials
    if (currentPassword !== credentials.password) {
      return { success: false, message: 'Current password is incorrect' };
    }
    
    // Update localStorage synchronously
    const updatedCredentials = { ...credentials, password: newPassword };
    storage.set(STORAGE_KEYS.ADMIN_CREDENTIALS, updatedCredentials);
    
    // Then update state
    setCredentials(updatedCredentials);
    
    // Clear user session
    storage.remove(STORAGE_KEYS.USER);
    storage.remove(STORAGE_KEYS.TOKEN);
    setUser(null);
    
    console.log('Password updated and user logged out');
    return { success: true };
  };

  const resetPassword = () => {
    // Update localStorage synchronously
    const updatedCredentials = { ...credentials, password: 'admin123' };
    storage.set(STORAGE_KEYS.ADMIN_CREDENTIALS, updatedCredentials);
    
    // Then update state
    setCredentials(updatedCredentials);
    
    console.log('Password reset to default');
    return { success: true };
  };

  const addEmployee = (employee) => {
    return new Promise((resolve, reject) => {
      console.log('addEmployee called with:', employee);
      
      // Validate employee data before processing
      const validation = validateEmployeeData(employee);
      if (!validation.isValid) {
        console.error('Employee validation failed:', validation.errors);
        reject(new Error(validation.errors.join(', ')));
        return;
      }

      setEmployees(prev => {
        console.log('Current employees in state:', prev.length);
        
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
        console.log('Updated employees array:', updated.length);
        
        // Ensure localStorage is updated synchronously using storage utility
        const storageResult = storage.set(STORAGE_KEYS.EMPLOYEES, updated);
        console.log('localStorage write result:', storageResult);
        
        // Verify localStorage was actually updated
        const storedData = storage.get(STORAGE_KEYS.EMPLOYEES);
        console.log('Verification - employees in localStorage:', storedData?.length);
        
        if (storedData && storedData.length === updated.length) {
          console.log('✅ localStorage successfully updated with new employee');
          resolve(newEmployee);
        } else {
          console.error('❌ localStorage verification failed');
          reject(new Error('Failed to save employee to localStorage'));
        }
        
        return updated;
      });
    });
  };

  const updateEmployee = (id, updatedData) => {
    return new Promise((resolve, reject) => {
      console.log('updateEmployee called for ID:', id, 'with data:', updatedData);
      
      setEmployees(prev => {
        const updated = prev.map(emp => 
          emp.id === id ? { ...emp, ...updatedData, updated_at: new Date().toISOString() } : emp
        );
        
        console.log('Updated employee count:', updated.filter(emp => emp.id === id).length);
        
        // Ensure localStorage is updated synchronously using storage utility
        const storageResult = storage.set(STORAGE_KEYS.EMPLOYEES, updated);
        console.log('localStorage write result:', storageResult);
        
        // Verify localStorage was actually updated
        const storedData = storage.get(STORAGE_KEYS.EMPLOYEES);
        const updatedEmployee = storedData?.find(emp => emp.id === id);
        
        if (updatedEmployee) {
          console.log('✅ Employee successfully updated in localStorage');
          resolve(updatedEmployee);
        } else {
          console.error('❌ Failed to update employee in localStorage');
          reject(new Error('Failed to update employee'));
        }
        
        return updated;
      });
    });
  };

  const deleteEmployee = (id, exitData) => {
    return new Promise((resolve, reject) => {
      console.log('deleteEmployee called for ID:', id, 'with exit data:', exitData);
      
      setEmployees(prev => {
        const updated = prev.map(emp => 
          emp.id === id ? { ...emp, status: 0, exit_date: new Date().toISOString().split('T')[0], ...exitData, updated_at: new Date().toISOString() } : emp
        );
        
        console.log('Employee marked as deleted');
        
        // Ensure localStorage is updated synchronously using storage utility
        const storageResult = storage.set(STORAGE_KEYS.EMPLOYEES, updated);
        console.log('localStorage write result:', storageResult);
        
        // Verify localStorage was actually updated
        const storedData = storage.get(STORAGE_KEYS.EMPLOYEES);
        const deletedEmployee = storedData?.find(emp => emp.id === id && emp.status === 0);
        
        if (deletedEmployee) {
          console.log('✅ Employee successfully marked as deleted in localStorage');
          resolve(deletedEmployee);
        } else {
          console.error('❌ Failed to mark employee as deleted in localStorage');
          reject(new Error('Failed to delete employee'));
        }
        
        return updated;
      });
    });
  };

  const restoreEmployee = (id) => {
    return new Promise((resolve, reject) => {
      console.log('restoreEmployee called for ID:', id);
      
      setEmployees(prev => {
        const updated = prev.map(emp => 
          emp.id === id ? { ...emp, status: 1, exit_date: undefined, reason: undefined, updated_at: new Date().toISOString() } : emp
        );
        
        console.log('Employee marked as restored');
        
        // Ensure localStorage is updated synchronously using storage utility
        const storageResult = storage.set(STORAGE_KEYS.EMPLOYEES, updated);
        console.log('localStorage write result:', storageResult);
        
        // Verify localStorage was actually updated
        const storedData = storage.get(STORAGE_KEYS.EMPLOYEES);
        const restoredEmployee = storedData?.find(emp => emp.id === id && emp.status === 1);
        
        if (restoredEmployee) {
          console.log('✅ Employee successfully restored in localStorage');
          resolve(restoredEmployee);
        } else {
          console.error('❌ Failed to restore employee in localStorage');
          reject(new Error('Failed to restore employee'));
        }
        
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
