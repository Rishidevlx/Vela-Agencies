import React, { useState } from 'react';
import { FiMail, FiLock, FiKey, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [view, setView] = useState('LOGIN'); // LOGIN, FORGOT_EMAIL, ENTER_OTP, RESET_PASSWORD
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        toast.success('Welcome back, Admin!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('Unable to connect to server. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('OTP sent to your email!');
        setView('ENTER_OTP');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error('Server error. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('OTP Verified!');
        setView('RESET_PASSWORD');
      } else {
        toast.error(data.message || 'Invalid or expired OTP');
      }
    } catch (err) {
      toast.error('Server error. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if(newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Password reset successfully! Please login.');
        setPassword('');
        setOtp('');
        setNewPassword('');
        setView('LOGIN');
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (err) {
      toast.error('Server error. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden font-body">
      
      <style>
        {`
          @keyframes smoothFloat {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          .animate-smooth-float {
            animation: smoothFloat 6s ease-in-out infinite;
          }
        `}
      </style>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-red-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 relative z-10">
        
        {/* LEFT SECTION: Content */}
        <div className="w-full lg:w-1/3 flex flex-col text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold leading-[1.1] tracking-tight mb-6">
            <span className="text-slate-800">Sign In to</span> <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Admin Panel</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
            Manage your products, update offers, track orders and control entire website settings seamlessly.
          </p>
        </div>

        {/* CENTER SECTION: Avatar Image */}
        <div className="w-full lg:w-1/3 flex justify-center py-10 lg:py-0">
          <img 
            src="/Businessman falling down.png" 
            alt="Admin Login Avatar" 
            className="w-full max-w-[320px] lg:max-w-[450px] h-auto object-contain animate-smooth-float drop-shadow-2xl"
          />
        </div>

        {/* RIGHT SECTION: Forms */}
        <div className="w-full lg:w-1/3 flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            
            {/* LOGIN VIEW */}
            {view === 'LOGIN' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
                {/* Email Input */}
                <div className="flex items-center bg-[#F1F5F9] rounded-xl px-5 py-4 w-full border border-transparent focus-within:border-red-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                  <FiMail className="text-[#94A3B8] text-xl mr-3 flex-shrink-0" />
                  <input 
                    type="email" 
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent border-none outline-none text-[#334155] placeholder-[#94A3B8] font-medium text-[15px]"
                  />
                </div>

                {/* Password Input */}
                <div className="flex items-center bg-[#F1F5F9] rounded-xl px-5 py-4 w-full border border-transparent focus-within:border-red-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                  <FiLock className="text-[#94A3B8] text-xl mr-3 flex-shrink-0" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-transparent border-none outline-none text-[#334155] placeholder-[#94A3B8] tracking-widest font-medium text-[15px]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#94A3B8] hover:text-[#64748B] transition-colors ml-2"
                  >
                    {showPassword ? <FiEyeOff className="text-lg"/> : <FiEye className="text-lg" />}
                  </button>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end mt-1 mb-2">
                  <button 
                    type="button" 
                    onClick={() => setView('FORGOT_EMAIL')}
                    className="text-sm font-semibold text-[#94A3B8] hover:text-red-600 transition-colors"
                  >
                    Recover Password ?
                  </button>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoading ? 'SIGNING IN...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD: EMAIL VIEW */}
            {view === 'FORGOT_EMAIL' && (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-5 w-full">
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                  <p className="text-sm text-gray-500 mt-2">Enter your registered email address to receive an OTP.</p>
                </div>
                
                <div className="flex items-center bg-[#F1F5F9] rounded-xl px-5 py-4 w-full border border-transparent focus-within:border-red-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                  <FiMail className="text-[#94A3B8] text-xl mr-3 flex-shrink-0" />
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent border-none outline-none text-[#334155] placeholder-[#94A3B8] font-medium text-[15px]"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {isLoading ? 'SENDING...' : 'SEND OTP'}
                </button>

                <button 
                  type="button" 
                  onClick={() => setView('LOGIN')}
                  className="flex items-center justify-center gap-2 mt-4 text-sm font-semibold text-[#94A3B8] hover:text-red-600 transition-colors"
                >
                  <FiArrowLeft /> Back to Sign In
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD: OTP VIEW */}
            {view === 'ENTER_OTP' && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5 w-full">
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">Enter OTP</h2>
                  <p className="text-sm text-gray-500 mt-2">Enter the 6-digit OTP sent to <strong>{email}</strong></p>
                </div>
                
                <div className="flex items-center bg-[#F1F5F9] rounded-xl px-5 py-4 w-full border border-transparent focus-within:border-red-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                  <FiKey className="text-[#94A3B8] text-xl mr-3 flex-shrink-0" />
                  <input 
                    type="text" 
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full bg-transparent border-none outline-none text-[#334155] placeholder-[#94A3B8] font-bold text-[18px] tracking-[0.5em] text-center"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || otp.length < 6}
                  className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {isLoading ? 'VERIFYING...' : 'VERIFY OTP'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setView('FORGOT_EMAIL')}
                  className="flex items-center justify-center gap-2 mt-4 text-sm font-semibold text-[#94A3B8] hover:text-red-600 transition-colors"
                >
                  <FiArrowLeft /> Back
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD: RESET PASSWORD VIEW */}
            {view === 'RESET_PASSWORD' && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5 w-full">
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">New Password</h2>
                  <p className="text-sm text-gray-500 mt-2">Enter your new secure password.</p>
                </div>
                
                <div className="flex items-center bg-[#F1F5F9] rounded-xl px-5 py-4 w-full border border-transparent focus-within:border-red-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                  <FiLock className="text-[#94A3B8] text-xl mr-3 flex-shrink-0" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-transparent border-none outline-none text-[#334155] placeholder-[#94A3B8] font-medium text-[15px]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#94A3B8] hover:text-[#64748B] transition-colors ml-2"
                  >
                    {showPassword ? <FiEyeOff className="text-lg"/> : <FiEye className="text-lg" />}
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || newPassword.length < 6}
                  className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {isLoading ? 'SAVING...' : 'SAVE PASSWORD'}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
