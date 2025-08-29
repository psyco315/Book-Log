import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WarpBackground } from '@/components/magicui/warp-background';
import api from '../api';
import { useAuth } from '@/context/auth';
import './signup.css';

const SignUp = ({ isOpen, onClose, onSwitchToSignIn, apiUrl }) => {
    const { loggedIn, setLoggedIn } = useAuth();
    const initialFormState = {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Lock/unlock background scroll and reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormState);
            setErrors({});
            setShowPassword(false);
            setShowConfirmPassword(false);
            setIsLoading(false);
        }
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

        if (!formData.username) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters long';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    // --------- UPDATED: submit handler that sends request to backend ----------
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({}); // reset server errors

        try {
            // Build payload (backend will set displayName to username if omitted)
            const payload = {
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password
                // you can add displayName/avatar/bio/settings here if you extend the form
            };

            // Use optional apiUrl prop to override endpoint; otherwise default path
            const endpoint = apiUrl || '/api/auth/signup';

            // If apiUrl is a full URL, axios will use it; otherwise axios instance baseURL is used
            const response = await api.post(endpoint, payload);

            // On success, backend usually returns token + user
            const { token, user } = response.data || {};

            if (token) {
                localStorage.setItem('authToken', token);
            }

            // Optionally save user snapshot
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }

            // Close modal and clear form
            setIsLoading(false);
            setLoggedIn(true)
            onClose();

            // Optional: redirect or refresh to reflect signed-in state
            // window.location.reload(); // uncomment if you want a refresh

        } catch (err) {
            console.error('Signup error:', err);
            const status = err.response?.status;
            const serverMsg = err.response?.data?.message || err.message || 'Error creating account';

            // Friendly mapping
            if (status === 409) {
                // conflict (email/username already in use)
                setErrors(prev => ({ ...prev, general: serverMsg }));
            } else if (status === 400) {
                setErrors(prev => ({ ...prev, general: serverMsg }));
            } else {
                setErrors(prev => ({ ...prev, general: 'Something went wrong. Please try again.' }));
            }
            setIsLoading(false);
        }
    };
    // -------------------------------------------------------------------------

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
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
                            <h2 className="header-title">Create Account</h2>
                            <p className="header-subtitle">Join us to start your reading adventure</p>
                        </div>

                        <form onSubmit={handleSubmit} className="form-container">
                            {errors.general && (
                                <div className="error-message">
                                    <p>{errors.general}</p>
                                </div>
                            )}

                            <div className="form-field">
                                <label htmlFor="username" className="field-label">
                                    Username
                                </label>
                                <div className="input-container">
                                    <div className="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.username ? 'error' : ''}`}
                                        placeholder="Choose a username"
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="error-message">{errors.username}</p>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="email" className="field-label">
                                    Email Address
                                </label>
                                <div className="input-container">
                                    <div className="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <rect width="20" height="16" x="2" y="4" rx="2" />
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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
                                        placeholder="Create a password"
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

                            <div className="form-field">
                                <label htmlFor="confirmPassword" className="field-label">
                                    Confirm Password
                                </label>
                                <div className="input-container">
                                    <div className="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                        placeholder="Confirm your password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="showPswrd-button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="error-message">{errors.confirmPassword}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="submit-button"
                            >
                                {isLoading ? (
                                    <div className="loading-spinner">
                                        <div className="spinner"></div>
                                        Creating Account...
                                    </div>
                                ) : (
                                    'Sign Up'
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
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={onSwitchToSignIn}
                                        className="signup-link"
                                        disabled={isLoading}
                                    >
                                        Sign in here
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

export default SignUp;
