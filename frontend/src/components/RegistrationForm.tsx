import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type CompleteProfileFormData } from '../schemas/profile';
import { FieldError } from './ui/FieldError';
import { profileApi } from '../services/profileApi';
import { handleApiError } from '../services/api';

interface RegistrationFormProps {
  onCompleted: () => void;
}

const RegistrationForm = ({ onCompleted }: RegistrationFormProps) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      phoneNumber: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  });

  useEffect(() => {
    if (!isDirty || isSubmitting) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, isSubmitting]);

  const onSubmit = async (data: CompleteProfileFormData) => {
    try {
      await profileApi.completeProfile(data);
      await onCompleted();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('root', { message: handleApiError(err) });
    }
  };

  return (
    <div className="auth-bg" style={{ padding: '3rem 0' }}>
      <div style={{ maxWidth: '36rem', width: '100%', margin: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Complete Your Profile
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-caption)' }}>
            Please fill in your details to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ padding: '2rem' }}>
          {errors.root && (
            <div style={{ padding: '0.75rem 1rem', background: 'var(--error-bg)', border: '1px solid rgba(197,90,90,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: 'var(--text-caption)', marginBottom: '1.5rem' }}>
              {errors.root.message}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="label" htmlFor="firstName">First Name *</label>
              <input id="firstName" type="text" className="input" {...register('firstName')} />
              <FieldError name="firstName" errors={errors} />
            </div>
            <div>
              <label className="label" htmlFor="middleName">Middle Name</label>
              <input id="middleName" type="text" className="input" {...register('middleName')} />
            </div>
            <div>
              <label className="label" htmlFor="lastName">Last Name *</label>
              <input id="lastName" type="text" className="input" {...register('lastName')} />
              <FieldError name="lastName" errors={errors} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" htmlFor="phoneNumber">Phone Number</label>
            <input id="phoneNumber" type="tel" className="input" {...register('phoneNumber')} />
            <FieldError name="phoneNumber" errors={errors} />
          </div>

          <fieldset className="form-section" style={{ marginBottom: '1.5rem' }}>
            <legend className="form-legend">Address</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label" htmlFor="street">Street Address</label>
                <input id="street" type="text" className="input" {...register('street')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label" htmlFor="city">City</label>
                  <input id="city" type="text" className="input" {...register('city')} />
                </div>
                <div>
                  <label className="label" htmlFor="state">State / Province</label>
                  <input id="state" type="text" className="input" {...register('state')} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label" htmlFor="postalCode">Postal Code</label>
                  <input id="postalCode" type="text" className="input" {...register('postalCode')} />
                </div>
                <div>
                  <label className="label" htmlFor="country">Country</label>
                  <input id="country" type="text" className="input" {...register('country')} />
                </div>
              </div>
            </div>
          </fieldset>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
