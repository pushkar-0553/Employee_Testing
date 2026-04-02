import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import EmployeeList from './pages/EmployeeList';
import ChangePassword from './pages/ChangePassword';
import ProtectedRoute from './components/ProtectedRoute';

import MainLayout from './components/MainLayout';
import { EmployeeProvider } from './context/EmployeeContext';

function App() {
  return (
    <EmployeeProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes with MainLayout */}
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/add-employee" element={<ProtectedRoute><MainLayout><AddEmployee /></MainLayout></ProtectedRoute>} />
          <Route path="/edit-employee/:id" element={<ProtectedRoute><MainLayout><EditEmployee /></MainLayout></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><MainLayout><EmployeeList /></MainLayout></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><MainLayout><ChangePassword /></MainLayout></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </EmployeeProvider>
  );
}

export default App;
