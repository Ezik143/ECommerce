import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses: Record<string, string> = {
  sm: 'modal-panel-sm',
  md: '',
  lg: 'modal-panel-lg',
  xl: 'modal-panel-xl',
  full: 'modal-panel-full',
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  const modalContent = (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" style={{ position: 'relative', zIndex: 50 }} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="modal-overlay" />
        </Transition.Child>

        <div style={{ position: 'fixed', inset: 0, overflowY: 'auto' }}>
          <div style={{ display: 'flex', minHeight: '100%', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`modal-panel ${sizeClasses[size]}`}>
                <div className="modal-header">
                  <Dialog.Title as="h3" className="modal-title">
                    {title}
                  </Dialog.Title>
                  <button type="button" onClick={onClose} className="modal-close" aria-label="Close modal">
                    <XMarkIcon />
                  </button>
                </div>
                <div>{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );

  const portalRoot = document.getElementById('modal-portal');
  if (portalRoot) {
    return createPortal(modalContent, portalRoot);
  }
  return modalContent;
};