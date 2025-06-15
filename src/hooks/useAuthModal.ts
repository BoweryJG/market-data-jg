import { useState, useCallback } from 'react';

export const useAuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);

  const openAuthModal = useCallback((successCallback?: () => void) => {
    setIsOpen(true);
    if (successCallback) {
      setOnSuccessCallback(() => successCallback);
    }
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    setOnSuccessCallback(null);
  }, []);

  const handleSuccess = useCallback(() => {
    if (onSuccessCallback) {
      onSuccessCallback();
    }
    closeAuthModal();
  }, [onSuccessCallback, closeAuthModal]);

  return {
    isAuthModalOpen: isOpen,
    openAuthModal,
    closeAuthModal,
    handleAuthSuccess: handleSuccess,
  };
};