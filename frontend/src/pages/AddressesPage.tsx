import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/20/solid';
import { useAddresses } from '../hooks/useAddresses';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import type { CreateAddressRequest, UpdateAddressRequest } from '../types/api';

const emptyForm: CreateAddressRequest = { street: '', city: '', state: '', postalCode: '', country: '' };

export const AddressesPage = () => {
  const { addresses, loading, error, fetchAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateAddressRequest>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (id: number) => {
    const addr = addresses.find((a) => a.addressId === id);
    if (!addr) return;
    setEditingId(id);
    setForm({ street: addr.street, city: addr.city, state: addr.state, postalCode: addr.postalCode, country: addr.country });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingId) {
        await updateAddress(editingId, form as UpdateAddressRequest);
      } else {
        await createAddress(form);
      }
      setShowModal(false);
    } catch {
      // error handled by hook
    } finally {
      setSaving(false);
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
        <button onClick={fetchAddresses} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>My Addresses</h1>
        <button onClick={openAdd} className="btn btn-primary btn-sm">Add Address</button>
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
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{addr.country}</p>
                </div>
                {addr.isDefault && (
                  <StarIcon style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-amber)', flexShrink: 0 }} title="Default Address" />
                )}
              </div>
              <hr className="divider-light" style={{ margin: '1rem 0 0.75rem' }} />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!addr.isDefault && (
                  <button onClick={() => setDefaultAddress(addr.addressId)} style={{ fontSize: '0.8125rem', color: 'var(--accent-gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Set as Default
                  </button>
                )}
                <button onClick={() => openEdit(addr.addressId)} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <PencilIcon style={{ width: '0.875rem', height: '0.875rem' }} /> Edit
                </button>
                <button onClick={() => handleDelete(addr.addressId)} style={{ fontSize: '0.8125rem', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <TrashIcon style={{ width: '0.875rem', height: '0.875rem' }} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Address' : 'Add Address'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Street</label>
            <input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">City</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">State</label>
              <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Postal Code</label>
              <input type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Country</label>
              <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.street || !form.city || !form.state || !form.postalCode || !form.country} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};