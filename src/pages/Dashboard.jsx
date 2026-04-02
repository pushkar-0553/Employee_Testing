import { useEffect, useState } from 'react';
import { useEmployees } from '../context/EmployeeContext';
import {
  HiOutlineUserGroup, HiOutlineUserAdd, HiOutlineBriefcase,
  HiOutlineTrendingUp, HiOutlinePlus, HiOutlineArrowRight,
  HiOutlinePencilAlt, HiOutlineTrash, HiOutlineUsers,
  HiOutlineLogout
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, icon: Icon, iconClass, trend, desc }) => (
  <div className="card page-enter" style={{ padding: '20px 24px', transition: 'box-shadow 0.2s, transform 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{label}</p>
        <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-header)', lineHeight: 1, marginBottom: '10px' }}>{value}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)' }}>{trend}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</span>
        </div>
      </div>
      <div className={`stat-icon-${iconClass}`} style={{
        width: '46px', height: '46px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { employees, deleteEmployee } = useEmployees();
  const [loading, setLoading] = useState(false); // No longer strictly needed but kept for UI consistency

  useEffect(() => {
    document.title = "Dashboard | Employee Management";
  }, []);

  const activeEmployees = (employees || []).filter(emp => emp?.status === 1);
  const totalActive = activeEmployees.length;
  const uniqueDepartments = [...new Set(activeEmployees.map(emp => emp?.role).filter(role => role))].length;

  const recentEmployees = [...activeEmployees].sort((a, b) => {
    const dateA = new Date(a?.updated_at || a?.created_at || a?.date_of_joining || 0);
    const dateB = new Date(b?.updated_at || b?.created_at || b?.date_of_joining || 0);
    return dateB - dateA;
  }).slice(0, 1);

  const handleMarkAsExited = (id) => {
    if (window.confirm('Mark this employee as INACTIVE (Exited)?')) {
      deleteEmployee(id, {
        exit_date: new Date().toISOString().split('T')[0],
        exit_reason: 'Manual Exit from Dashboard'
      });
    }
  };

  const statsData = [
    { label: 'Active Employees', value: totalActive, icon: HiOutlineUserGroup, iconClass: 'blue', trend: '+12', desc: 'this month' },
    { label: 'Departments', value: uniqueDepartments, icon: HiOutlineBriefcase, iconClass: 'orange', trend: '+2', desc: 'active teams' },
  ];

  return (
    
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '32px',marginLeft:"50px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: '4px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-header)', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Welcome back! Here's what's happening with your team.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {statsData.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '16px' }}>⚡</span>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-header)' }}>Quick Actions</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { to: '/add-employee', icon: HiOutlineUserAdd, label: 'Add New Employee', desc: 'Onboard a new team member', color: '#eff6ff', iconColor: '#2563eb' },
            { to: '/employees', icon: HiOutlineUsers, label: 'View All Employees', desc: 'Browse the full directory', color: '#ecfdf5', iconColor: '#059669' },
          ].map(({ to, icon: Icon, label, desc, color, iconColor }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 16px', borderRadius: '12px',
              background: '#fafafa', border: '1.5px solid var(--border)',
              textDecoration: 'none', transition: 'all 0.18s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#f0f6ff'; e.currentTarget.style.transform = 'translateX(2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>
                <Icon size={19} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-header)' }}>{label}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>
              </div>
              <HiOutlineArrowRight size={16} style={{ color: '#cbd5e1' }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Employees Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-header)' }}>Recent Employees</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Last added or updated employee</p>
          </div>
          <Link to="/employees" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
            View all <HiOutlineArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner spinner-dark" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '13px' }}>Loading employees...</p>
          </div>
        ) : recentEmployees.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Name', 'Role', 'Employee ID', 'Last Updated', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    padding: '11px 20px',
                    textAlign: i === 4 ? 'right' : 'left',
                    fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: '1px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentEmployees.map(emp => (
                <tr key={emp.id} className="table-row">
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '9px',
                        background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '12px', fontWeight: 700, flexShrink: 0,
                      }}>
                        {emp.profile_picture
                          ? <img src={emp.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '9px' }} alt="" />
                          : `${(emp.first_name || '?')[0]}${(emp.last_name || '?')[0]}`}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-header)' }}>{emp.first_name} {emp.last_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <span className="badge badge-blue">{emp.role}</span>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                      #{emp.emp_id}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {new Date(emp.updated_at || emp.created_at || emp.date_of_joining).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <Link to={`/edit-employee/${emp.id}`} style={{
                        width: '30px', height: '30px', borderRadius: '7px',
                        background: '#eff6ff', color: '#2563eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none', transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                        onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                      >
                        <HiOutlinePencilAlt size={14} />
                      </Link>
                      <button onClick={() => handleMarkAsExited(emp.id)} style={{
                        width: '30px', height: '30px', borderRadius: '7px',
                        background: '#fff7ed', color: '#ea580c',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#ffedd5'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff7ed'}
                        title="Mark as Exited"
                      >
                         <HiOutlineLogout size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px', background: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', color: '#cbd5e1',
            }}>
              <HiOutlineUsers size={28} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-header)', marginBottom: '6px' }}>No employees yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Get started by adding your first team member.</p>
            <Link to="/add-employee" className="btn-primary" style={{ textDecoration: 'none' }}>
              <HiOutlinePlus size={16} /> Add First Employee
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
