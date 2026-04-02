import { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEmployees } from '../context/EmployeeContext';
import ReviewModal from '../components/ReviewModal';
import {
  HiOutlinePhotograph, HiOutlineIdentification,
  HiOutlineCalendar, HiOutlineMap, HiOutlineArrowLeft,
  HiOutlineCheckCircle, HiOutlineLogout, HiOutlineRefresh
} from 'react-icons/hi';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ROLES = [
  'Trainer',
  'Team Lead',
  'Senior Developer',
  'Junior Developer',
  'Analyst',
  'Testing Lead',
  'Tester'
];

const SectionCard = memo(({ icon: Icon, title, children }) => (
  <div className="card" style={{ padding: '22px 24px' }}>
    <div className="section-header">
      <div className="section-header-icon"><Icon size={17} /></div>
      <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-header)' }}>{title}</h2>
    </div>
    {children}
  </div>
));

const Field = memo(({ label, name, value, onChange, error, type = 'text', required, isTextarea, placeholder, disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>{label}{required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}</span>
      {error && <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>}
    </label>
    {isTextarea ? (
      <textarea
        name={name} value={value} onChange={onChange}
        rows={3} placeholder={placeholder}
        disabled={disabled}
        className={`input-base${error ? ' input-error' : ''}`}
        style={{ resize: 'none', opacity: disabled ? 0.7 : 1, background: disabled ? '#f8fafc' : '#fff' }}
      />
    ) : (
      <input
        type={type} name={name} value={value}
        onChange={onChange} placeholder={placeholder}
        disabled={disabled}
        className={`input-base${error ? ' input-error' : ''}`}
        style={{ opacity: disabled ? 0.7 : 1, background: disabled ? '#f8fafc' : '#fff', colorScheme: 'light' }}
      />
    )}
  </div>
));

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees, updateEmployee, restoreEmployee } = useEmployees();
  const [form, setForm] = useState({
    first_name: '', middle_name: '', last_name: '', role: '',
    dob: '', date_of_joining: '', nick_name: '', current_address: '',
    permanent_address: '', blood_group: '', phone_number: '',
    status: 1, exit_date: '', exit_reason: ''
  });
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sameAddress, setSameAddress] = useState(false);

  const isExited = form.status === 0;

  useEffect(() => {
    document.title = "Edit Employee | Employee Management";
  }, []);

  useEffect(() => {
    const data = employees.find(emp => String(emp.id) === String(id));
    if (data) {
      setForm({
        first_name: data.first_name || '',
        middle_name: data.middle_name || '',
        last_name: data.last_name || '',
        role: data.role || '',
        dob: data.dob ? data.dob.split('T')[0] : '',
        date_of_joining: data.date_of_joining ? data.date_of_joining.split('T')[0] : '',
        nick_name: data.nick_name || '',
        current_address: data.current_address || '',
        permanent_address: data.permanent_address || '',
        blood_group: data.blood_group || '',
        phone_number: data.phone_number || '',
        status: data.status,
        exit_date: data.exit_date ? data.exit_date.split('T')[0] : '',
        exit_reason: data.exit_reason || ''
      });
      if (data.profile_picture) {
        setImagePreview(data.profile_picture);
        setImageName(data.profile_picture_name || '');
      }
      if (data.current_address && data.permanent_address && 
          data.current_address.trim() === data.permanent_address.trim()) {
        setSameAddress(true);
      }
      setFetching(false);
    } else {
      toast.error('Employee not found');
      navigate('/employees');
    }
  }, [id, navigate, employees]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (['first_name', 'last_name', 'middle_name', 'nick_name'].includes(name)) {
        if (value !== '' && !/^[a-zA-Z\s]*$/.test(value)) return;
    }

    if (name === 'phone_number') {
        if (value !== '' && !/^\d*$/.test(value)) return;
        if (value.length > 10) return;
    }

    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'current_address' && sameAddress) updated.permanent_address = value;
      return updated;
    });
    setErrors(prev => {
      if (prev[name]) {
        const n = { ...prev };
        delete n[name];
        return n;
      }
      return prev;
    });
  }, [sameAddress]);

  const handleRestore = useCallback(() => {
    if (!window.confirm('Restore this employee to ACTIVE status?')) return;
    setLoading(true);
    try {
      restoreEmployee(Number(id));
      toast.success('Employee restored successfully');
      navigate('/employees');
    } catch {
      toast.error('Failed to restore');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, restoreEmployee]);

  const validate = () => {
    const errs = {};
    const required = ['first_name', 'last_name', 'role', 'dob', 'date_of_joining', 'current_address', 'permanent_address', 'blood_group', 'phone_number'];
    
    required.forEach(f => {
      if (!form[f] || String(form[f]).trim() === '') errs[f] = 'Required';
    });

    if (form.phone_number && form.phone_number.length !== 10) {
      errs.phone_number = 'Exact 10 digits';
    }

    if (form.dob && form.date_of_joining) {
      const dobDate = new Date(form.dob);
      const joinDate = new Date(form.date_of_joining);
      const today = new Date();
      
      let age = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;
      
      if (age < 18) errs.dob = 'Must be 18+ yrs';
      if (joinDate <= dobDate) errs.date_of_joining = 'Must be after DOB';
    }

    if (isExited && !form.exit_date) errs.exit_date = 'Required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (validate()) setShowReview(true);
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      let profile_picture = imagePreview;
      if (image) {
        profile_picture = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(image);
        });
      }

      const updatedData = {
        ...form,
        profile_picture,
        updated_at: new Date().toISOString(),
      };

      updateEmployee(Number(id), updatedData);
      toast.success('Record updated successfully');
      navigate('/employees');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
      setShowReview(false);
    }
  }, [form, id, image, imagePreview, updateEmployee, navigate]);

  const toggleSameAddress = useCallback(() => {
    setSameAddress(prev => {
      const next = !prev;
      if (next) setForm(p => ({ ...p, permanent_address: p.current_address }));
      return next;
    });
  }, []);

  if (fetching) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '160px 0' }}>
        <div className="spinner spinner-dark" />
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '32px', marginLeft: '50px',marginTop:"80px" }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '20px' }}>
        <button onClick={() => navigate(-1)} style={{
          width: '36px', height: '36px', borderRadius: '9px',
          background: 'white', border: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <HiOutlineArrowLeft size={17} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-header)', letterSpacing: '-0.02em' }}>
              {isExited ? 'Employee Details (Inactive)' : 'Edit Employee'}
            </h1>
            <span style={{
              fontSize: '11px', fontWeight: 700, 
              color: isExited ? '#ea580c' : '#2563eb', 
              background: isExited ? '#ffedd5' : '#eff6ff',
              padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.05em',
              border: `1px solid ${isExited ? '#fed7aa' : '#dbeafe'}`
            }}>
              {isExited ? 'INACTIVE' : 'ACTIVE'} RECORD
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {isExited ? 'View mode. Re-enroll from the history tab or restore below.' : 'Modify employee details with enforced data validation.'}
          </p>
        </div>
        
        {isExited && (
          <button onClick={handleRestore} disabled={loading} className="btn-secondary" style={{ color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }}>
            <HiOutlineRefresh size={16} /> Restore to ACTIVE
          </button>
        )}
      </div>

      <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {isExited && (
          <SectionCard icon={HiOutlineLogout} title="Exit Logs">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <Field 
                label="Exit Date" name="exit_date" type="date" required 
                value={form.exit_date} onChange={handleChange} error={errors.exit_date} 
              />
              <div style={{ gridColumn: 'span 3' }}>
                <Field 
                  label="Exit Reason" name="exit_reason" isTextarea 
                  placeholder="Reason for leaving" 
                  value={form.exit_reason} onChange={handleChange} error={errors.exit_reason} 
                />
              </div>
            </div>
          </SectionCard>
        )}

        <SectionCard icon={HiOutlineIdentification} title="Personal Details">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <Field disabled={isExited} label="First Name" name="first_name" required value={form.first_name} onChange={handleChange} error={errors.first_name} />
            <Field disabled={isExited} label="Middle Name" name="middle_name" value={form.middle_name} onChange={handleChange} error={errors.middle_name} />
            <Field disabled={isExited} label="Last Name" name="last_name" required value={form.last_name} onChange={handleChange} error={errors.last_name} />
            
            <Field disabled={isExited} label="Phone Number" name="phone_number" required value={form.phone_number} onChange={handleChange} error={errors.phone_number} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Blood Group<span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span></span>
                {errors.blood_group && <span style={{ fontSize: '11px', color: 'var(--danger)' }}>{errors.blood_group}</span>}
              </label>
              <select
                disabled={isExited}
                name="blood_group" value={form.blood_group} onChange={handleChange}
                className={`input-base${errors.blood_group ? ' input-error' : ''}`}
                style={{ opacity: isExited ? 0.7 : 1, background: isExited ? '#f8fafc' : '#fff' }}
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={HiOutlineCalendar} title="Employment History">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ gridColumn: 'span 2' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)' }}>
    Professional Role<span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>
  </label>

  <select
    name="role"
    value={form.role}
    onChange={handleChange}
    className={`input-base${errors.role ? ' input-error' : ''}`}
  >
    <option value="">Select role</option>
    {ROLES.map(role => (
      <option key={role} value={role}>{role}</option>
    ))}
  </select>

  {errors.role && (
    <span style={{ fontSize: '11px', color: 'var(--danger)' }}>
      {errors.role}
    </span>
  )}
</div>
            </div>
            <Field disabled={isExited} label="Nickname" name="nick_name" value={form.nick_name} onChange={handleChange} error={errors.nick_name} />
            
            <div style={{ gridColumn: 'span 1' }}></div>

            <div className="date-field-wrapper" style={{ gridColumn: 'span 2' }}>
                <Field disabled={isExited} label="Date of Birth" name="dob" type="date" required value={form.dob} onChange={handleChange} error={errors.dob} />
            </div>
            <div className="date-field-wrapper" style={{ gridColumn: 'span 2' }}>
                 <Field disabled={isExited} label="Joining Date" name="date_of_joining" type="date" required value={form.date_of_joining} onChange={handleChange} error={errors.date_of_joining} />
            </div>
          </div>
        </SectionCard>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '18px' }}>
          <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', opacity: isExited ? 0.8 : 1 }}>
            <div className="section-header">
              <div className="section-header-icon"><HiOutlinePhotograph size={17} /></div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-header)' }}>Profile Photo</h2>
            </div>
            <div
              title="No access to edit the profile"
              style={{
                flex: 1, minHeight: '180px',
                border: `2px dashed #e2e8f0`,
                borderRadius: '10px', cursor: 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', transition: 'all 0.18s',
                background: imagePreview ? 'transparent' : '#fafafa',
                position: 'relative'
              }}
            >
              {imagePreview ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <img src={imagePreview} style={{ flex: 1, width: '100%', height: '180px', objectFit: 'cover', opacity: 0.8 }} alt="Profile" />
                  <div style={{ 
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(239, 68, 68, 0.9)', color: 'white',
                    padding: '3px 8px', borderRadius: '6px', fontSize: '10px',
                    fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    LOCKED
                  </div>
                  {imageName && (
                    <div style={{ padding: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '11px', textAlign: 'center', fontWeight: 600 }}>
                      {imageName}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#2563eb' }}>
                    <HiOutlinePhotograph size={22} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-header)' }}>Upload your profile</p>
                  <p style={{ fontSize: '10.5px', color: 'var(--danger)', marginTop: '4px', fontWeight: 500 }}>No access to edit the profile</p>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: '22px 24px' }}>
            <div className="section-header" style={{ alignItems: 'center' }}>
              <div className="section-header-icon"><HiOutlineMap size={17} /></div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-header)', flex: 1 }}>Location Information</h2>
              {!isExited && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={sameAddress} onChange={toggleSameAddress} style={{ width: '15px', height: '15px', accentColor: '#2563eb' }} />
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Same as current</span>
                </label>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field disabled={isExited} label="Current Address" name="current_address" isTextarea required value={form.current_address} onChange={handleChange} error={errors.current_address} />
              <Field label="Permanent Address" name="permanent_address" isTextarea required disabled={sameAddress || isExited} value={form.permanent_address} onChange={handleChange} error={errors.permanent_address} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" style={{ background: '#2563eb', borderColor: '#2563eb' }}>Save Changes</button>
        </div>
      </form>

      {showReview && (
        <ReviewModal 
          data={form} 
          imagePreview={imagePreview} 
          onConfirm={handleSubmit} 
          onCancel={() => setShowReview(false)} 
          isLoading={loading} 
        />
      )}

      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
        .date-field-wrapper {
          position: relative;
        }
        .date-field-wrapper ::after {
          content: '📅';
          position: absolute;
          right: 12px;
          top: 35px;
          pointer-events: none;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
