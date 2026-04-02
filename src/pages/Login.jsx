import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineLockClosed, HiOutlineMail, HiOutlineArrowRight } from 'react-icons/hi';
import { useEmployees } from '../context/EmployeeContext';


export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useEmployees();
  const [errors, setErrors] = useState({});

  useEffect(() => {
  document.title = "Login | Employee Management";
}, []);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password.trim()) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = login(form.email, form.password);
      if (result.success) {
        toast.success('Welcome back! Successfully logged in.');
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <> 
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #e0f2fe 100%)',
      padding: '16px',
      position: 'relative'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-160px',
          right: '-160px',
          width: '320px',
          height: '320px',
          background: 'linear-gradient(135deg, #bfdbfe 0%, #a5f3fc 100%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          opacity: 0.3
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-160px',
          left: '-160px',
          width: '320px',
          height: '320px',
          background: 'linear-gradient(135deg, #c7d2fe 0%, #bfdbfe 100%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          opacity: 0.3
        }}></div>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '448px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Main Login Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden'
        }}>
          {/* Header Section */}
          <div style={{
            background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'white',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: '20px',
                  background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>EM</span>
              </div>
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px'
            }}>Welcome Back</h1>
            <p style={{
              fontSize: '14px',
              color: '#dbeafe'
            }}>Sign in to access your employee dashboard</p>
          </div>

          {/* Form Section */}
          <div style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Email Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <HiOutlineMail size={16} style={{ color: '#9ca3af' }} />
                  <span>Email Address</span>
                </label>
                <input 
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="Enter your email address"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'white',
                    border: errors.email ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#111827',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.email ? '#ef4444' : '#3b82f6';
                    e.target.style.boxShadow = errors.email ? 'none' : '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.email && (
                  <p style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    fontWeight: '500',
                    marginTop: '4px'
                  }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <HiOutlineLockClosed size={16} style={{ color: '#9ca3af' }} />
                  <span>Password</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '12px 48px 12px 16px',
                      background: 'white',
                      border: errors.password ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: '#111827',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = errors.password ? '#ef4444' : '#3b82f6';
                      e.target.style.boxShadow = errors.password ? 'none' : '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.password ? '#ef4444' : '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#6b7280'}
                    onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                  >
                    {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    fontWeight: '500',
                    marginTop: '4px'
                  }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Additional Options */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="checkbox" 
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      accentColor: '#3b82f6'
                    }} 
                  />
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>Remember me</span>
                </label>
                <a href="#" style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#3b82f6',
                  textDecoration: 'none'
                }}>
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading ? '#9ca3af' : 'linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <HiOutlineArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div style={{
              marginTop: '32px',
              padding: '16px',
              background: 'rgba(219, 234, 254, 0.5)',
              borderRadius: '12px',
              border: '1px solid #dbeafe'
            }}>
              <p style={{
                textAlign: 'center',
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '8px'
              }}>
                <span style={{ fontWeight: '600' }}>Demo Credentials:</span>
              </p>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Email: <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#3b82f6' }}>admin@example.com</span>
                </p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Password: <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#3b82f6' }}>admin123</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '14px',
          color: '#9ca3af'
        }}>
          <p>Secure login powered by advanced encryption</p>
        </div>
      </div>
    </div>
    </>
  );
}
