import React, { useState } from 'react';
import { signUpStyles } from '../assets/dummyStyles';
import { toast, ToastContainer } from 'react-toastify';
import { ArrowLeft, Calendar, Clapperboard, Eye, EyeOff, Film, Lock, Mail, Phone, Ticket, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    birthDate: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goBack = () => {
    window.history.back();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the form errors.');
      return;
    }
    setIsLoading(true);
    try {
      await registerUser({
        name: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        role: 'USER', // Standard security: Public registration always creates customer accounts
      });
      toast.success('Account created successfully! Redirecting to Login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={signUpStyles.container}>
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />

      <div className={signUpStyles.mainContent}>
        <button onClick={goBack} className={signUpStyles.backButton}>
          <ArrowLeft size={20} className={signUpStyles.backIcon} />
          <span className={signUpStyles.backText}>BACK</span>
        </button>

        <div className={signUpStyles.card}>
          <div className={signUpStyles.cardHeader}></div>
          <div className={signUpStyles.cardContent}>
            <div className={signUpStyles.header}>
              <div className={signUpStyles.headerFlex}>
                <Ticket className={signUpStyles.headerIcon} size={32} />
                <h2 className={signUpStyles.headerTitle}>JOIN OUR CINEMA</h2>
              </div>
              <p className={signUpStyles.headerSubtitle}>Create your account and start your cinematic journey.</p>
            </div>

            <form onSubmit={handleSubmit} className={signUpStyles.form}>
              <div className={signUpStyles.formGrid}>
                <div>
                  <label htmlFor="fullName" className={signUpStyles.field}>
                    FULL NAME
                  </label>
                  <div className={signUpStyles.inputContainer}>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`${signUpStyles.input.base} ${
                        errors.fullName ? signUpStyles.input.error : signUpStyles.input.normal
                      } ${signUpStyles.inputWithIcon}`}
                      placeholder="Enter your Full Name"
                    />
                    <div className={signUpStyles.inputIcon}>
                      <User size={18} />
                    </div>
                  </div>
                  {errors.fullName && <p className={signUpStyles.errorText}>{errors.fullName}</p>}
                </div>

                <div>
                  <label htmlFor="username" className={signUpStyles.field}>
                    USERNAME
                  </label>
                  <div className={signUpStyles.inputContainer}>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className={`${signUpStyles.input.base} ${
                        errors.username ? signUpStyles.input.error : signUpStyles.input.normal
                      } ${signUpStyles.inputWithIcon}`}
                      placeholder="Choose your username"
                    />
                    <div className={signUpStyles.inputIcon}>
                      <Clapperboard size={18} />
                    </div>
                  </div>
                  {errors.username && <p className={signUpStyles.errorText}>{errors.username}</p>}
                </div>
              </div>

              <div className={signUpStyles.formGrid}>
                <div>
                  <label htmlFor="email" className={signUpStyles.field}>
                    EMAIL ADDRESS
                  </label>
                  <div className={signUpStyles.inputContainer}>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`${signUpStyles.input.base} ${
                        errors.email ? signUpStyles.input.error : signUpStyles.input.normal
                      } ${signUpStyles.inputWithIcon}`}
                      placeholder="your@example.com"
                    />
                    <div className={signUpStyles.inputIcon}>
                      <Mail size={18} />
                    </div>
                  </div>
                  {errors.email && <p className={signUpStyles.errorText}>{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className={signUpStyles.field}>
                    PHONE NUMBER
                  </label>
                  <div className={signUpStyles.inputContainer}>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`${signUpStyles.input.base} ${
                        errors.phone ? signUpStyles.input.error : signUpStyles.input.normal
                      } ${signUpStyles.inputWithIcon}`}
                      placeholder="+91 9876543210"
                    />
                    <div className={signUpStyles.inputIcon}>
                      <Phone size={18} />
                    </div>
                  </div>
                  {errors.phone && <p className={signUpStyles.errorText}>{errors.phone}</p>}
                </div>
              </div>

              <div className={signUpStyles.formGrid}>
                <div>
                  <label htmlFor="birthDate" className={signUpStyles.field}>
                    DATE OF BIRTH
                  </label>
                  <div className={signUpStyles.inputContainer}>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className={`${signUpStyles.input.base} ${signUpStyles.inputWithIcon}`}
                    />
                    <div className={signUpStyles.inputIcon}>
                      <Calendar size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className={signUpStyles.field}>
                    PASSWORD
                  </label>
                  <div className={signUpStyles.inputContainer}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`${signUpStyles.input.base} ${
                        errors.password ? signUpStyles.input.error : signUpStyles.input.normal
                      } ${signUpStyles.inputWithToggle}`}
                      placeholder="Create a strong password"
                    />
                    <div className={signUpStyles.inputIcon}>
                      <Lock size={18} />
                    </div>
                    <button
                      type="button"
                      className={signUpStyles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={18} className={signUpStyles.toggleIcon} />
                      ) : (
                        <Eye size={18} className={signUpStyles.toggleIcon} />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className={signUpStyles.errorText}>{errors.password}</p>}
                </div>
              </div>

              <div className={signUpStyles.submitContainer}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${signUpStyles.submitButton.base} ${
                    isLoading ? signUpStyles.submitButton.loading : ''
                  }`}
                >
                  {isLoading ? (
                    <div className={signUpStyles.submitContainer}>
                      <div className={signUpStyles.loadingSpinner}></div>
                      CREATING ACCOUNT...
                    </div>
                  ) : (
                    <div className={signUpStyles.submitContent}>
                      <Film className={signUpStyles.submitIcon} size={20} />
                      <span>CREATE CINEMA ACCOUNT</span>
                    </div>
                  )}
                </button>
              </div>
            </form>

            <div className={signUpStyles.loginContainer}>
              <p className={signUpStyles.loginText}>
                Already have an account?{' '}
                <a href="/login" className={signUpStyles.loginLink}>
                  Sign in to your account
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;