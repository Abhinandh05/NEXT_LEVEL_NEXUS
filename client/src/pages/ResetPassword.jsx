import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { toast } from 'sonner';

const ResetPassword = () => {
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailsent, setIsEmailsent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSumbited, setIsOtpSumbited] = useState(false);
  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e, index) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);

    digits.split('').forEach((digit, i) => {
      const inputIndex = index + i;
      if (inputRefs.current[inputIndex]) {
        inputRefs.current[inputIndex].value = digit;
      }
    });

    const nextIndex = index + digits.length;
    if (nextIndex < inputRefs.current.length) {
      inputRefs.current[nextIndex].focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`https://next-level-nexus.onrender.com/api/v1/user/send-reset-otp`, { email });
      if (data.success) {
        toast.success(data.message);
        setIsEmailsent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong!');
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((input) => input.value);
    setOtp(otpArray.join(''));
    setIsOtpSumbited(true);
  };

  const onSubmitNewPasswords = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`https://next-level-nexus.onrender.com/api/v1/user/reset-password`, {
        email,
        newPassword,
        otp,
      });
      if (data.success) {
        toast.success(data.message);
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      {!isEmailsent && (
        <form onSubmit={handleOtpSubmit} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password</h1>
          <p className="text-center mb-6 text-indigo-300">Enter Your registered email address to reset your password</p>

          <div className="mb-4 flex items-center gap-4 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <input
              type="email"
              placeholder="Email"
              className="bg-transparent border-none outline-none flex-1 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="w-full py-2.5 rounded-full bg-indigo-500 hover:bg-indigo-900 transition-all duration-200 text-white font-medium">
            Submit
          </button>
        </form>
      )}

      {/* OTP input form */}
      {!isOtpSumbited && isEmailsent && (
        <form onSubmit={onSubmitOtp} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password OTP</h1>
          <p className="text-center mb-6 text-indigo-300">Enter the 6-digit OTP sent to your email</p>

          <div className="flex justify-between mb-8">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="w-10 h-10 bg-[#333A5C] text-white text-center text-xl rounded-md"
                  required
                  ref={(el) => (inputRefs.current[index] = el)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={(e) => handlePaste(e, index)}
                />
              ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-md hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            Submit
          </button>
        </form>
      )}

      {/* Enter new password */}
      {isOtpSumbited && isEmailsent && (
        <form onSubmit={onSubmitNewPasswords} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">New Password</h1>
          <p className="text-center mb-6 text-indigo-300">Enter new password below</p>

          <div className="mb-4 flex items-center gap-4 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent border-none outline-none flex-1 text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full py-2.5 rounded-full bg-indigo-500 hover:bg-indigo-900 transition-all duration-200 text-white font-medium">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
