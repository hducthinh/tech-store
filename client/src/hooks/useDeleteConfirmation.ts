import { useState } from 'react';
import { useAsync } from './useAsync';

export function useDeleteConfirmation({ onConfirm }) {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState(null);

  const { execute, loading: isProcessing } = useAsync(onConfirm);

  const open = (selectedItem) => {
    setItem(selectedItem);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setItem(null);
  };

  const handleConfirm = async () => {
    if (!item) return;
    try {
      await execute(item);
      close();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return {
    isOpen,
    item,
    open,
    close,
    isProcessing,
    handleConfirm
  };
}
