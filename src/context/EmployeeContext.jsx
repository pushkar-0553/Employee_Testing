import React, { createContext, useState, useEffect, useContext } from 'react';

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
    try {
      const saved = localStorage.getItem('employees');
      return saved ? JSON.parse(saved) : INITIAL_DATA;
    } catch (e) {
      console.error('Error parsing employees from localStorage', e);
      return INITIAL_DATA;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
      return null;
    }
  });

  // Store credentials in state + localStorage (same pattern as employees)
  const [credentials, setCredentials] = useState(() => {
    try {
      const savedCreds = localStorage.getItem('admin_credentials');
      return savedCreds ? JSON.parse(savedCreds) : DEFAULT_CREDENTIALS;
    } catch (e) {
      console.error('Error parsing credentials from localStorage', e);
      return DEFAULT_CREDENTIALS;
    }
  });

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  // Persist credentials to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('admin_credentials', JSON.stringify(credentials));
  }, [credentials]);

  const login = (email, password) => {
    // Check against the stored credentials (not hardcoded)
    if (email === credentials.email && password === credentials.password) {
      const mockUser = { id: 'admin', email, name: credentials.name };
      setUser(mockUser);
      localStorage.setItem('token', 'mock-jwt-token');
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

  const addEmployee = (employee) => {
    // Generate an EMP ID if it doesn't already have one (from the form)
    // Actually our form doesn't take emp_id, so we generate it here
    const lastEmp = employees.length > 0 ? employees[employees.length - 1] : null;
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
    setEmployees(prev => [...prev, newEmployee]);
    return newEmployee;
  };

  const updateEmployee = (id, updatedData) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, ...updatedData } : emp
    ));
  };

  const deleteEmployee = (id, exitData) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, status: 0, ...exitData } : emp
    ));
  };

  const restoreEmployee = (id) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, status: 1, exit_date: undefined, reason: undefined } : emp
    ));
  };

  return (
    <EmployeeContext.Provider value={{
      employees,
      user,
      credentials,
      login,
      logout,
      changePassword,
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
