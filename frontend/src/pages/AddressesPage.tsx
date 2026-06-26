import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/20/solid';
import { useAddresses } from '../hooks/useAddresses';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { FieldError } from '../components/ui/FieldError';
import { addressSchema, type AddressFormData } from '../schemas/address';
import type { CreateAddressRequest, UpdateAddressRequest } from '../types/api';

const emptyForm: AddressFormData = { street: '', city: '', state: '', postalCode: '', country: '' };

export const AddressesPage = () => {
  const { addresses, loading, error, fetchAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues: emptyForm,
  });

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAdd = () => {
    setEditingId(null);
    reset(emptyForm);
    setShowModal(true);
  };

  const openEdit = (id: number) => {
    const addr = addresses.find((a) => a.addressId === id);
    if (!addr) return;
    setEditingId(id);
    reset({ street: addr.street, city: addr.city, state: addr.state, postalCode: addr.postalCode, country: addr.country });
    setShowModal(true);
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      if (editingId) {
        await updateAddress(editingId, data as UpdateAddressRequest);
      } else {
        await createAddress(data as CreateAddressRequest);
      }
      setShowModal(false);
      reset(emptyForm);
    } catch {
      // error handled by hook
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(id);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 className="page-title">My Addresses</h1>
        <LoadingSkeleton variant="table-row" />
        <LoadingSkeleton variant="table-row" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>
        <button type="button" onClick={fetchAddresses} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>My Addresses</h1>
        <button type="button" onClick={openAdd} className="btn btn-primary btn-sm">Add Address</button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState type="addresses" onAction={openAdd} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))', gap: '1rem' }}>
          {addresses.map((addr, i) => (
            <div key={addr.addressId} className={`card animate-fade-in-up stagger-${(i % 6) + 1}`}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{addr.street}</p>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)' }}>{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)' }}>{addr.country}</p>
                </div>
                {addr.isDefault && (
                  <StarIcon style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-amber)', flexShrink: 0 }} title="Default Address" />
                )}
              </div>
              <hr className="divider-light" style={{ margin: '1rem 0 0.75rem' }} />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!addr.isDefault && (
                  <button type="button" onClick={() => setDefaultAddress(addr.addressId)} style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Set as Default
                  </button>
                )}
                <button type="button" onClick={() => openEdit(addr.addressId)} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <PencilIcon style={{ width: '0.875rem', height: '0.875rem' }} /> Edit
                </button>
                <button type="button" onClick={() => handleDelete(addr.addressId)} style={{ fontSize: 'var(--text-xs)', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <TrashIcon style={{ width: '0.875rem', height: '0.875rem' }} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(emptyForm); }} title={editingId ? 'Edit Address' : 'Add Address'}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label" htmlFor="street">Street</label>
            <input id="street" type="text" className="input" {...register('street')} />
            <FieldError name="street" errors={errors} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label" htmlFor="city">City</label>
              <input id="city" type="text" className="input" {...register('city')} />
              <FieldError name="city" errors={errors} />
            </div>
            <div>
              <label className="label" htmlFor="state">State</label>
              <input id="state" type="text" className="input" {...register('state')} />
              <FieldError name="state" errors={errors} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label" htmlFor="postalCode">Postal Code</label>
              <input id="postalCode" type="text" className="input" {...register('postalCode')} />
              <FieldError name="postalCode" errors={errors} />
            </div>
            <div>
              <label className="label" htmlFor="country">Country</label>
              <input id="country" type="text" className="input" {...register('country')} />
              <FieldError name="country" errors={errors} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="button" onClick={() => { setShowModal(false); reset(emptyForm); }} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
