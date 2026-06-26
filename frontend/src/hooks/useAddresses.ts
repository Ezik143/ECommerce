import { useState, useCallback } from 'react';
import { addressApi } from '../services/addressApi';
import type { AddressResponse, CreateAddressRequest, UpdateAddressRequest } from '../types/api';
import { useToast } from '../components/ui/Toast';

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await addressApi.getAddresses();
      setAddresses(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load addresses';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAddress = useCallback(async (data: CreateAddressRequest) => {
    try {
      setLoading(true);
      const address = await addressApi.createAddress(data);
      success('Address added');
      await fetchAddresses();
      return address;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add address';
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAddresses, success, showError]);

  const updateAddress = useCallback(async (id: number, data: UpdateAddressRequest) => {
    try {
      setLoading(true);
      const address = await addressApi.updateAddress(id, data);
      success('Address updated');
      await fetchAddresses();
      return address;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update address';
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAddresses, success, showError]);

  const deleteAddress = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await addressApi.deleteAddress(id);
      success('Address deleted');
      await fetchAddresses();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete address';
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAddresses, success, showError]);

  const setDefaultAddress = useCallback(async (id: number) => {
    await updateAddress(id, { isDefault: true });
  }, [updateAddress]);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    defaultAddress: addresses.find((a) => a.isDefault) || addresses[0] || null,
  };
};