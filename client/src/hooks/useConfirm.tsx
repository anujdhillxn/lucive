import { useCallback } from 'react';
import { useConfirmModal } from '../contexts/ConfirmModalContext';

export const useConfirm = (callback: () => void, message: string = "Are you sure you want to perform this action?") => {
    const { showModal } = useConfirmModal();

    const confirm = useCallback(() => {
        showModal(message, callback);
    }, [showModal, message, callback]);

    return {
        confirm,
    };
};