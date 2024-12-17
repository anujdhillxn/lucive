import { useCallback } from 'react';
import { useConfirmModal } from '../contexts/ConfirmModalContext';

export const useConfirm = (callback: () => void, message: string = "Are you sure you want to perform this action?", hideNoButton?: boolean, yesButtonText?: string) => {
    const { showModal } = useConfirmModal();

    const confirm = useCallback(() => {
        showModal(message, callback, hideNoButton, yesButtonText);
    }, [showModal, message, callback, hideNoButton, yesButtonText]);

    return {
        confirm,
    };
};