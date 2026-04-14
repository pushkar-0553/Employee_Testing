import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEmployees } from '../context/EmployeeContext';
import ReviewModal from '../components/ReviewModal';
import {
  HiOutlinePhotograph, HiOutlineIdentification,
  HiOutlineCalendar, HiOutlineMap, HiOutlineArrowLeft,
  HiOutlineCheckCircle, HiOutlinePhone
} from 'react-icons/hi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useMediaQuery } from '../hooks/useMediaQuery';

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

const initialForm = {
  first_name: '', middle_name: '', last_name: '', role: '',
  dob: '', date_of_joining: '', nick_name: '', current_address: '',
  permanent_address: '', blood_group: '', phone_number: ''
};

// Memoized Section Component
const SectionCard = memo(({ icon: Icon, title, children }) => (
  <div className="card" style={{ padding: '22px 24px' }}>
    <div className="section-header">
      <div className="section-header-icon"><Icon size={17} /></div>
      <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-header)' }}>{title}</h2>
    </div>
    {children}
  </div>
));

// Memoized Input Field
const Field = memo(({ label, name, value, onChange, error, type = 'text', required, isTextarea, placeholder, disabled, maxLength, minDate, maxDate, isMobile }) => {

  const isDate = type === 'date';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={name} style={{ 
        fontSize: isMobile ? '14px' : '12.5px', 
        fontWeight: 600, 
        color: 'var(--text-main)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <span>{label}{required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}</span>
        {error && <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>}
      </label>
      {isTextarea ? (
        <textarea
          id={name}
          data-testid={name}
          name={name} value={value} onChange={onChange}
          rows={3} placeholder={placeholder}
          disabled={disabled}
          className={`input-base${error ? ' input-error' : ''}`}
          style={{ 
            resize: 'none', 
            opacity: disabled ? 0.5 : 1,
            fontSize: isMobile ? '16px' : '14px',
            padding: isMobile ? '12px 16px' : '10px 14px',
            minHeight: isMobile ? '48px' : 'auto'
          }}
        />
      ) : isDate ? (
        <div className="datepicker-container" data-testid={`datepicker-${name}`}>
          <DatePicker
            id={name}
            selected={value ? new Date(value) : null}
            minDate={minDate}
            maxDate={maxDate}
            onChange={(date) => {
              const formattedDate = date ? date.toISOString().split('T')[0] : '';
              onChange({ target: { name, value: formattedDate } });
            }}
            placeholderText={placeholder || 'Select date'}
            className={`input-base${error ? ' input-error' : ''}`}
            autoComplete="off"
            dateFormat="yyyy-MM-dd"
            peekNextMonth
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            disabled={disabled}
            customInput={<input 
              style={{ 
                fontSize: isMobile ? '16px' : '14px',
                padding: isMobile ? '12px 16px' : '10px 14px',
                height: isMobile ? '48px' : 'auto'
              }} 
            />}
          />
        </div>
      ) : (
        <input
          id={name}
          data-testid={name}
          type={type} name={name} value={value}
          onChange={onChange} placeholder={placeholder}
          maxLength={maxLength}
          className={`input-base${error ? ' input-error' : ''}`}
          disabled={disabled}
          style={{
            fontSize: isMobile ? '16px' : '14px',
            padding: isMobile ? '12px 16px' : '10px 14px',
            height: isMobile ? '48px' : 'auto'
          }}
        />
      )}
    </div>
  );
});

export default function AddEmployee() {
  const navigate = useNavigate();
  const { addEmployee } = useEmployees();
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  useEffect(() => {
    document.title = "Add Employee | Employee Management";
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // Real-time restriction: Only letters for names and max 50 chars
    if (['first_name', 'last_name', 'middle_name', 'nick_name'].includes(name)) {
      if (value !== '' && !/^[a-zA-Z\s]*$/.test(value)) return;
      if (value.length > 50) return;
    }

    // Real-time restriction: Only numbers for phone
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

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation: Only images allowed
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files (JPEG, PNG, etc.) are allowed');
      e.target.value = ''; // Reset the input
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error('Image must be less than 1MB');
      e.target.value = ''; // Reset the input
      return;
    }

    setImage(file);
    setImageName(file.name);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const toggleSameAddress = useCallback(() => {
    setSameAddress(prev => !prev);
    if (!sameAddress) {
      setForm(p => ({ ...p, permanent_address: p.current_address }));
    }
  }, [sameAddress]);

  const validate = () => {
    const errs = {};
    const required = ['first_name', 'last_name', 'role', 'dob', 'date_of_joining', 'current_address', 'permanent_address', 'blood_group', 'phone_number'];

    required.forEach(f => {
      if (!form[f] || String(form[f]).trim() === '') errs[f] = 'Required';
    });

    if (form.phone_number && form.phone_number.length !== 10) {
      errs.phone_number = 'Exact 10 digits';
    }

    if (!image) {
      errs.profile_image = 'Profile photo is required';
      toast.error('Please upload a profile photo');
    }

    if (form.dob && form.date_of_joining) {
      const dob = new Date(form.dob);
      const join = new Date(form.date_of_joining);
      const today = new Date();

      // Age calculation
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

      const present = new Date();
      present.setDate(present.getDate() + 1);
      if (present.setDate(present.getDate()) < 18) errs.dob = 'Must be 18+ yrs';
      if (join <= dob) errs.date_of_joining = 'Must be after DOB';

      // 👉 NEW CONDITION: DOJ should not be more than 2 months from today
      const twoMonthsLater = new Date();
      twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);

      if (join > twoMonthsLater) {
        errs.date_of_joining = 'Joining date cannot be more than 2 months ahead';
      }
    }

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
      let profile_picture = null;
      if (image) {
        profile_picture = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(image);
        });
      }

      const employeeData = {
        ...form,
        profile_picture,
        profile_picture_name: imageName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addEmployee(employeeData);
      toast.success('Employee created successfully');
      navigate('/employees');
    } catch (err) {
      toast.error('Failed to add employee');
    } finally {
      setLoading(false);
      setShowReview(false);
    }
  }, [form, image, imageName, addEmployee, navigate]);

  return (
    <div className="page-enter" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '16px' : '18px', 
      paddingBottom: '32px', 
      marginLeft: isMobile ? '0' : '50px', 
      marginTop: isMobile ? '0' : '60px',
      padding: isMobile ? '16px' : '0'
    }}>

      <div style={{ 
        display: 'flex', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        gap: '14px', 
        marginTop: isMobile ? '0' : '20px',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        <button onClick={() => navigate(-1)} style={{
          width: isMobile ? '40px' : '36px', 
          height: isMobile ? '40px' : '36px', 
          borderRadius: '9px',
          background: 'white', border: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <HiOutlineArrowLeft size={isMobile ? 20 : 17} />
        </button>
        <div>
          <h1 style={{ 
            fontSize: isMobile ? '24px' : '20px', 
            fontWeight: 800, 
            color: 'var(--text-header)', 
            letterSpacing: '-0.02em',
            marginBottom: isMobile ? '8px' : '3px'
          }}>Add New Employee</h1>
          <p style={{ 
            fontSize: isMobile ? '14px' : '13px', 
            color: 'var(--text-muted)', 
            marginTop: '3px',
            lineHeight: isMobile ? 1.4 : 1.2
          }}>Enforcing strict validation for all fields.</p>
        </div>
      </div>

      <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        <SectionCard icon={HiOutlineIdentification} title="Personal Information">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'), 
            gap: isMobile ? '12px' : '16px' 
          }}>
            <Field label="First Name" name="first_name" required placeholder="Max 50 characters" maxLength={50} value={form.first_name} onChange={handleChange} error={errors.first_name} isMobile={isMobile} />
            <Field label="Middle Name" name="middle_name" placeholder="Max 50 characters" maxLength={50} value={form.middle_name} onChange={handleChange} error={errors.middle_name} isMobile={isMobile} />
            <Field label="Last Name" name="last_name" required placeholder="Max 50 characters" maxLength={50} value={form.last_name} onChange={handleChange} error={errors.last_name} isMobile={isMobile} />

            <Field label="Phone Number" name="phone_number" required placeholder="10 digits only" value={form.phone_number} onChange={handleChange} error={errors.phone_number} isMobile={isMobile} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label htmlFor="blood_group" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Blood Group<span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span></span>
                {errors.blood_group && <span style={{ fontSize: '11px', color: 'var(--danger)' }}>{errors.blood_group}</span>}
              </label>
              <select
                id="blood_group"
                data-testid="blood_group"
                name="blood_group" value={form.blood_group} onChange={handleChange}
                className={`input-base${errors.blood_group ? ' input-error' : ''}`}
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <Field label="Nickname" name="nick_name" placeholder="Max 50 characters" maxLength={50} value={form.nick_name} onChange={handleChange} error={errors.nick_name} />
            <div style={{ gridColumn: 'span 1' }}></div>

          </div>
        </SectionCard>

        <SectionCard icon={HiOutlineCalendar} title="Employment & Identity">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'), 
            gap: isMobile ? '12px' : '16px' 
          }}>
            <div style={{ gridColumn: isMobile ? '1' : (isTablet ? 'span 2' : 'span 2') }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Professional Role<span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>
                </label>

                <select
                  id="role"
                  data-testid="role"
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

           

            <div className="date-field-wrapper" style={{ gridColumn: isMobile ? '1' : (isTablet ? 'span 2' : 'span 2') }}>

              <Field
                label="Date of Birth"
                name="dob"
                type="date"
                required
                value={form.dob}
                onChange={handleChange}
                error={errors.dob}
                maxDate={new Date()}   // 🔥 no future DOB
              />
            </div>

            <div className="date-field-wrapper" style={{ gridColumn: isMobile ? '1' : (isTablet ? 'span 2' : 'span 2') }}>

              <Field
                label="Joining Date"
                name="date_of_joining"
                type="date"
                required
                value={form.date_of_joining}
                onChange={handleChange}
                error={errors.date_of_joining}
                minDate={form.dob ? new Date(form.dob) : null}  // 🔥 after DOB
                maxDate={(() => {
                  const d = new Date();
                  d.setMonth(d.getMonth() + 2);
                  return d;
                })()}  // 🔥 within 2 months
              />
            </div>
          </div>
        </SectionCard>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', 
          gap: isMobile ? '16px' : '18px' 
        }}>
          <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', border: errors.profile_image ? '1.5px solid var(--danger)' : '1px solid var(--border)' }}>
            <div className="section-header">
              <div className="section-header-icon"><HiOutlinePhotograph size={17} /></div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-header)', flex: 1 }}>Profile Photo<span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span></h2>
              {errors.profile_image && <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 500 }}>{errors.profile_image}</span>}
            </div>
            <div
              onClick={() => document.getElementById('profile-upload').click()}
              style={{
                flex: 1, minHeight: '180px',
                border: `2px dashed ${imagePreview ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: '10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', transition: 'all 0.18s',
                background: imagePreview ? 'transparent' : '#fafafa',
              }}
            >
              {imagePreview ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <img src={imagePreview} style={{ flex: 1, width: '100%', height: '180px', objectFit: 'cover' }} alt="Preview" />
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
                </div>
              )}
            </div>
            <input id="profile-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>

          <div className="card" style={{ padding: '22px 24px' }}>
            <div className="section-header" style={{ alignItems: 'center' }}>
              <div className="section-header-icon"><HiOutlineMap size={17} /></div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-header)', flex: 1 }}>Location Information</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
                <input type="checkbox" checked={sameAddress} onChange={toggleSameAddress} style={{ width: '15px', height: '15px', accentColor: '#2563eb' }} />
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Same as current</span>
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Current Address" name="current_address" isTextarea required value={form.current_address} onChange={handleChange} error={errors.current_address} />
              <Field label="Permanent Address" name="permanent_address" isTextarea required disabled={sameAddress} value={form.permanent_address} onChange={handleChange} error={errors.permanent_address} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Review & Save</button>
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
        .datepicker-container {
          width: 100%;
        }
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container input {
          width: 100%;
        }
        .react-datepicker {
           border: 1px solid var(--border);
           border-radius: 12px;
           box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
           font-family: inherit;
        }
        .react-datepicker__header {
           background: #f8fafc;
           border-bottom: 1px solid var(--border);
           padding: 12px 0;
           border-radius: 11px 11px 0 0;
        }
        .react-datepicker__day--selected {
           background-color: #2563eb !important;
           border-radius: 8px;
        }
        .react-datepicker__day:hover {
           border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
