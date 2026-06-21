import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../services/profileApi';
import { handleApiError } from '../services/api';

interface RegistrationFormProps {
  onCompleted: () => void;
}

const RegistrationForm = ({ onCompleted }: RegistrationFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await profileApi.completeProfile(formData);
      await onCompleted();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg" style={{ padding: '3rem 0' }}>
      <div style={{ maxWidth: '36rem', width: '100%', margin: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Complete Your Profile
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Please fill in your details to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ padding: '0.75rem 1rem', background: 'var(--error-bg)', border: '1px solid rgba(197,90,90,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="label" htmlFor="firstName">First Name *</label>
              <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label" htmlFor="middleName">Middle Name</label>
              <input id="middleName" name="middleName" type="text" value={formData.middleName} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="lastName">Last Name *</label>
              <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} className="input" required />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" htmlFor="phoneNumber">Phone Number</label>
            <input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} className="input" />
          </div>

          <fieldset className="form-section" style={{ marginBottom: '1.5rem' }}>
            <legend className="form-legend">Address</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label" htmlFor="street">Street Address</label>
                <input id="street" name="street" type="text" value={formData.street} onChange={handleChange} className="input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label" htmlFor="city">City</label>
                  <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="state">State / Province</label>
                  <input id="state" name="state" type="text" value={formData.state} onChange={handleChange} className="input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label" htmlFor="postalCode">Postal Code</label>
                  <input id="postalCode" name="postalCode" type="text" value={formData.postalCode} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="country">Country</label>
                  <input id="country" name="country" type="text" value={formData.country} onChange={handleChange} className="input" />
                </div>
              </div>
            </div>
          </fieldset>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;