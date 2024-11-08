import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Colors from '../styles/colors';
interface ConfirmModalContextProps {
    showModal: (message: string, onConfirm: () => void) => void;
    hideModal: () => void;
}

const ConfirmModalContext = createContext<ConfirmModalContextProps | undefined>(undefined);

export const ConfirmModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [onConfirm, setOnConfirm] = useState<() => void>(() => { });

    const showModal = (message: string, onConfirm: () => void) => {
        setMessage(message);
        setOnConfirm(() => onConfirm);
        setModalVisible(true);
    };

    const hideModal = () => {
        setModalVisible(false);
    };

    const handleConfirm = () => {
        hideModal();
        onConfirm();
    };

    return (
        <ConfirmModalContext.Provider value={{ showModal, hideModal }}>
            {children}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={hideModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>{message}</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                                <Text style={styles.buttonText}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={hideModal}>
                                <Text style={styles.buttonText}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ConfirmModalContext.Provider>
    );
};

export const useConfirmModal = () => {
    const context = useContext(ConfirmModalContext);
    if (!context) {
        throw new Error('useConfirmModal must be used within a ConfirmModalProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: 300,
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        backgroundColor: Colors.Accent1,
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 10,
        flex: 1,
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.Text1,
        fontSize: 16,
    },
});