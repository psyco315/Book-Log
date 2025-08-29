import React, { useState, useEffect } from 'react';
import './signin.css'
import { WarpBackground } from "@/components/magicui/warp-background";
import { AnimatePresence, motion } from "framer-motion";

const SignIn = ({ isOpen, onClose, onSwitchToSignUp }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Lock/unlock background scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        // cleanup on unmount
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Here you would make your actual API call
            console.log('Signing in with:', formData);

            // Reset form and close modal on success
            setFormData({ email: '', password: '' });
            onClose();

        } catch (error) {
            setErrors({ general: 'Invalid email or password. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div className="modal-backdrop"
                    onClick={handleBackdropClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: .8 }}
                >
                    <WarpBackground gridColor='rgba(255, 255, 255, 0.20)'>
                        <motion.div
                            className="modal-container"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ delay: .2, duration: .2 }}
                        >
                            <div className="modal-highlight">
                                <div className="highlight-top" />
                                <div className="highlight-bottom" />
                            </div>

                            <button
                                onClick={onClose}
                                className="close-button"
                                disabled={isLoading}
                            >
                                ✕
                            </button>

                            <div className="modal-header">
                                <h2 className="header-title">Welcome Back</h2>
                                <p className="header-subtitle">Sign in to continue your reading journey</p>
                            </div>

                            <form onSubmit={handleSubmit} className="form-container">
                                {errors.general && (
                                    <div className="error-message">
                                        <p>{errors.general}</p>
                                    </div>
                                )}

                                <div className="form-field">
                                    <label htmlFor="email" className="field-label">
                                        Email Address
                                    </label>
                                    <div className="input-container">
                                        <div className="input-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`form-input ${errors.email ? 'error' : ''}`}
                                            placeholder="Enter your email"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="error-message">{errors.email}</p>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label htmlFor="password" className="field-label">
                                        Password
                                    </label>
                                    <div className="input-container">
                                        <div className="input-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`form-input ${errors.password ? 'error' : ''}`}
                                            placeholder="Enter your password"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            className="showPswrd-button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isLoading}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="error-message">{errors.password}</p>
                                    )}
                                </div>

                                <div className="flex justify-end mb-6">
                                    <button
                                        type="button"
                                        className="forgot-password"
                                        disabled={isLoading}
                                    >
                                        Forgot your password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="submit-button"
                                >
                                    {isLoading ? (
                                        <div className="loading-spinner">
                                            <div className="spinner"></div>
                                            Signing In...
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                <div className="divider">
                                    <div className="divider-line"></div>
                                    <span className="divider-text">or</span>
                                    <div className="divider-line"></div>
                                </div>

                                <button
                                    type="button"
                                    className="social-button"
                                    disabled={isLoading}
                                >
                                    <div className="social-button-content">
                                        <svg className="social-icon" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Continue with Google
                                    </div>
                                </button>

                                <div className="signup-text">
                                    <p>
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={onSwitchToSignUp}
                                            className="signup-link"
                                            disabled={isLoading}
                                        >
                                            Sign up here
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    </WarpBackground>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SignIn;