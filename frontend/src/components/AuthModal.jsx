"use client";

import { useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

const AuthModal = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const openLoginModal = () => {
        setIsLoginModalOpen(true);
        setIsRegisterModalOpen(false);
    };

    const openRegisterModal = () => {
        setIsRegisterModalOpen(true);
        setIsLoginModalOpen(false);
    };

    const closeModals = () => {
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);
    };

    return (
        <div>
            <button
                onClick={openLoginModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
                Open Login Modal
            </button>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={closeModals}
                onSwitchToRegister={openRegisterModal}
            />

            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={closeModals}
                onSwitchToLogin={openLoginModal}
            />
        </div>
    );
};

export default <AuthModal></AuthModal>;