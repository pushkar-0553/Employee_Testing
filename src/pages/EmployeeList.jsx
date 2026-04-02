import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEmployees } from '../context/EmployeeContext';
import MarkExitedModal from '../components/MarkExitedModal';
import EmployeeDetailsModal from '../components/EmployeeDetailsModal';
import {
  HiOutlineSearch, HiOutlinePencilAlt, HiOutlineChevronLeft,
  HiOutlineChevronRight, HiOutlinePlus, HiOutlineUsers,
  HiOutlineCalendar, HiOutlineClipboardList, HiOutlineRefresh,
  HiOutlineLogout, HiOutlineEye
} from 'react-icons/hi';

// Helper Outside component to avoid re-creation
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ITEMS_PER_PAGE = 8;

const headerStyle = {
  padding: '14px 20px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  borderBottom: '1px solid #e2e8f0',
  background: '#f8fafc'
};

// Memoized Row Component
const EmployeeRow = memo(({ emp, activeTab, onSelect, onEdit, onExit, onRestore }) => (
  <tr className="table-row">
    <td style={{ padding: '14px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          onClick={() => onSelect(emp)}
          style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '13px', fontWeight: 800, flexShrink: 0,
            cursor: 'pointer', boxShadow: '0 4px 10px -2px rgba(37, 99, 235, 0.3)'
          }}
        >
          {emp?.profile_picture
            ? <img src={emp.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} alt="" />
            : `${(emp?.first_name || '?')[0]}${(emp?.last_name || '?')[0]}`
          }
        </div>
        <div>
          <p
            onClick={() => onSelect(emp)}
            style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', marginBottom: '2px', cursor: 'pointer' }}
          >
            {emp.first_name} {emp.last_name}
          </p>
          <p
            onClick={() => onSelect(emp)}
            style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', cursor: 'pointer' }}
          >
            #{emp.emp_id} • {emp.blood_group}
          </p>
        </div>
      </div>
    </td>
    <td style={{ padding: '14px 20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>{emp?.role}</span>
        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Department Dept.</span>
      </div>
    </td>
    <td style={{ padding: '14px 20px' }}>
      {activeTab === 'ACTIVE' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
          <HiOutlineCalendar size={16} style={{ color: '#94a3b8' }} />
          <span style={{ fontSize: '13px', fontWeight: 500 }}>
            {formatDate(emp?.date_of_joining)}
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{
            color: emp?.status === 1 ? '#059669' : '#dc2626',
            background: emp?.status === 1 ? '#ecfdf5' : '#fef2f2',
            fontSize: '10.5px', fontWeight: 700, padding: '2px 10px',
            borderRadius: '20px', width: 'fit-content', border: `1px solid ${emp?.status === 1 ? '#d1fae5' : '#fee2e2'}`
          }}>
            {emp?.status === 1 ? 'ACTIVE' : 'INACTIVE'}
          </span>
          {emp?.status === 0 && (
            <p style={{ fontSize: '11.5px', color: '#94a3b8' }}>Exited: {formatDate(emp.exit_date)}</p>
          )}
        </div>
      )}
    </td>
    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          onClick={() => onSelect(emp)}
          style={{ background: '#f8fafc', color: '#64748b' }}
          className="action-btn"
          title="View Profile Details"
        >
          <HiOutlineEye size={17} />
        </button>

        {activeTab === 'ACTIVE' && (
          <>
            <Link to={`/edit-employee/${emp?.id}`} className="action-btn" title="Edit Employee">
              <HiOutlinePencilAlt size={17} />
            </Link>
            <button onClick={() => onExit(emp)} className="action-btn-danger" title="Mark as Inactive">
              <HiOutlineLogout size={17} />
            </button>
          </>
        )}

        {activeTab === 'HISTORY' && emp?.status === 0 && (
          <button onClick={() => onRestore(emp?.id)} className="action-btn-success" title="Restore to Active">
            <HiOutlineRefresh size={17} />
          </button>
        )}
      </div>
    </td>
  </tr>
));

export default function EmployeeList() {
  const { employees, deleteEmployee, restoreEmployee } = useEmployees();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [exitTarget, setExitTarget] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Filter employees memoized
  const filteredEmployees = useMemo(() => {
    return (employees || []).filter(emp => {
      if (!emp) return false;
      const searchLower = search.toLowerCase();
      const matchesSearch =
        (emp.first_name || '').toLowerCase().includes(searchLower) ||
        (emp.last_name || '').toLowerCase().includes(searchLower) ||
        (emp.emp_id || '').toLowerCase().includes(searchLower) ||
        (emp.role || '').toLowerCase().includes(searchLower);

      return activeTab === 'ACTIVE' ? matchesSearch && emp.status === 1 : matchesSearch;
    });
  }, [employees, search, activeTab]);

  const totalPages = useMemo(() => Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE), [filteredEmployees]);

  const paginatedEmployees = useMemo(() => {
    return filteredEmployees.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  }, [filteredEmployees, page]);

  useEffect(() => {
    document.title = (activeTab === 'ACTIVE' ? 'Working Employees' : 'Employee History') + ' | Employee Management';
  }, [activeTab]);

  const handleMarkAsExited = useCallback((data) => {
    if (!exitTarget) return;
    deleteEmployee(exitTarget.id, data);
    toast.success('Employee moved to History');
    setExitTarget(null);
  }, [exitTarget, deleteEmployee]);

  const handleRestore = useCallback((id) => {
    if (!window.confirm('Restore this employee to ACTIVE status?')) return;
    restoreEmployee(id);
    toast.success('Employee restored successfully');
  }, [restoreEmployee]);

  const handleSelect = useCallback((emp) => setSelectedEmployee(emp), []);
  const handleExit = useCallback((emp) => setExitTarget(emp), []);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '32px', marginLeft: "50px", marginTop: '80px' }}>

      {/* Header with Search */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '4px' }}>Employee Directory</h1>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              {activeTab === 'ACTIVE' ? 'Currently active team members' : 'Full organizational history and logs'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
              <input
                type="text"
                placeholder="Search name, ID, or role..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-base"
                style={{ paddingLeft: '38px', width: '260px', height: '42px', fontSize: '13.5px' }}
              />
            </div>
            {activeTab === 'ACTIVE' && (
              <Link to="/add-employee" className="btn-primary" style={{ height: '42px', padding: '0 18px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlinePlus size={18} /> Add Employee
              </Link>
            )}
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          display: 'flex',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          width: 'fit-content',
          border: '1.5px solid #e2e8f0'
        }}>
          {[
            { id: 'ACTIVE', label: 'Working Employees', icon: HiOutlineUsers },
            { id: 'HISTORY', label: 'History (All Records)', icon: HiOutlineClipboardList }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setPage(1); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 20px', borderRadius: '9px',
                border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600,
                transition: 'all 0.2s ease',
                background: activeTab === id ? 'white' : 'transparent',
                color: activeTab === id ? '#2563eb' : '#64748b',
                boxShadow: activeTab === id ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headerStyle}>Employee Info</th>
              <th style={headerStyle}>Designation</th>
              <th style={headerStyle}>{activeTab === 'ACTIVE' ? 'Joined On' : 'Status & Logs'}</th>
              <th style={{ ...headerStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: '80px 0', textAlign: 'center' }}>
                  <div className="spinner spinner-dark" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Fetching records...</p>
                </td>
              </tr>
            ) : paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '80px 0', textAlign: 'center' }}>
                  <div style={{ color: '#cbd5e1', marginBottom: '12px' }}><HiOutlineSearch size={40} /></div>
                  <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '15px' }}>No records found</p>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Try adjusting your search or filters.</p>
                </td>
              </tr>
            ) : paginatedEmployees.map((emp) => (
              <EmployeeRow 
                key={emp.id} 
                emp={emp} 
                activeTab={activeTab} 
                onSelect={handleSelect}
                onRestore={handleRestore}
                onExit={handleExit}
              />
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', background: '#fafafa' }}>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Showing <b>{paginatedEmployees.length}</b> of <b>{filteredEmployees.length}</b> members</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary" style={{ padding: '7px 14px', borderRadius: '10px' }}>
                <HiOutlineChevronLeft size={16} /> Previous
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary" style={{ padding: '7px 14px', borderRadius: '10px' }}>
                Next <HiOutlineChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {exitTarget && (
        <MarkExitedModal
          employee={exitTarget}
          onConfirm={handleMarkAsExited}
          onCancel={() => setExitTarget(null)}
        />
      )}

      {selectedEmployee && (
        <EmployeeDetailsModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      <style>{`
        .action-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: #eff6ff; color: #2563eb;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; border: none; cursor: pointer; transition: all 0.2s;
        }
        .action-btn:hover { background: #2563eb; color: #fff; transform: translateY(-1px); }
        .action-btn-danger {
          width: 36px; height: 36px; border-radius: 10px;
          background: #fff1f2; color: #e11d48;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; transition: all 0.2s;
        }
        .action-btn-danger:hover { background: #e11d48; color: #fff; transform: translateY(-1px); }
        .action-btn-success {
          width: 36px; height: 36px; border-radius: 10px;
          background: #f0fdf4; color: #16a34a;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; transition: all 0.2s;
        }
        .action-btn-success:hover { background: #16a34a; color: #fff; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}