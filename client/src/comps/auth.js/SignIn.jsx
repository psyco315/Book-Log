import React, { useState, useEffect } from 'react';
import './signin.css';
import { WarpBackground } from "@/components/magicui/warp-background";
import { AnimatePresence, motion } from "framer-motion";
import { publicApi } from '../api';
import { useAuth } from '@/context/auth';

const SignIn = ({ isOpen, onClose, onSwitchToSignUp, apiUrl }) => {
    const { loggedIn, setLoggedIn, setCurrUser } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Lock/unlock background scroll and reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                email: '',
                password: ''
            });
            setErrors({});
            setShowPassword(false);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
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
            const payload = {
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            };

            const endpoint = apiUrl || '/api/auth/signin';
            const response = await publicApi.post(endpoint, payload);

            const { token, user } = response.data || {};
            // console.log(user)

            if (token) {
                localStorage.setItem('authToken', token);
            }
            if (user) {
                setCurrUser(user)
                localStorage.setItem('user', JSON.stringify(user));
            }

            // Reset form and close modal on success
            setFormData({ email: '', password: '' });
            setLoggedIn(true)
            onClose();

            // Optional: refresh app state
            // window.location.reload();

        } catch (err) {
            console.error('Signin error:', err);
            const status = err.response?.status;
            const serverMsg = err.response?.data?.message || err.message || 'Error signing in';

            if (status === 401) {
                setErrors({ general: 'Invalid email or password.' });
            } else {
                setErrors({ general: serverMsg });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <motion.div className="modal-backdrop1"
                onClick={handleBackdropClick}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: .8 }}
            >
                <WarpBackground gridColor='rgba(255, 255, 255, 0.20)'>
                    <motion.div
                        className="modal-container1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ delay: .2, duration: .2 }}
                    >
                        {/* modal highlight and close button */}
                        <div className="modal-highlight1">
                            <div className="highlight-top1" />
                            <div className="highlight-bottom1" />
                        </div>
                        <button onClick={onClose} className="close-button1" disabled={isLoading}>✕</button>

                        {/* header */}
                        <div className="modal-header1">
                            <h2 className="header-title1">Welcome Back</h2>
                            <p className="header-subtitle1">Sign in to continue your reading journey</p>
                        </div>

                        {/* form */}
                        <form onSubmit={handleSubmit} className="form-container1">
                            {errors.general && (
                                <div className="error-message1"><p>{errors.general}</p></div>
                            )}
                            {/* email input */}
                            <div className="form-field1">
                                <label htmlFor="email" className="field-label1">Email Address</label>
                                <div className="input-container1">
                                    <div className="input-icon1">
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
                                        className={`form-input1 ${errors.email ? 'error' : ''}`}
                                        placeholder="Enter your email"
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.email && <p className="error-message1">{errors.email}</p>}
                            </div>
                            {/* password input */}
                            <div className="form-field1">
                                <label htmlFor="password" className="field-label1">Password</label>
                                <div className="input-container1">
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
                                        className={`form-input1 ${errors.password ? 'error' : ''}`}
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="showPswrd-button1"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {errors.password && <p className="error-message1">{errors.password}</p>}
                            </div>

                            <button type="submit" disabled={isLoading} className="submit-button1">
                                {isLoading ? (
                                    <div className="loading-spinner1"><div className="spinner1"></div>Signing In...</div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>

                            <div className="signup-text1">
                                <p>
                                    Don’t have an account?{' '}
                                    <button type="button" onClick={onSwitchToSignUp} className="signup-link1" disabled={isLoading}>
                                        Sign up here
                                    </button>
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </WarpBackground>
            </motion.div>
        </AnimatePresence>
    );
};

export default SignIn;
