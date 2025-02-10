import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';


import axios from 'axios';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { useLogoutUserMutation } from '@/features/api/authApi';

const EmailVerify = () => {
  const { user } = useSelector((store) => store.auth);
  const  { data,isLoggedin } = useLogoutUserMutation();
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      e.preventDefault(); // Prevents unintended behavior
      inputRefs.current[index - 1].focus(); // Moves focus to the previous input
    }
  };

  const handlePaste = (e, index) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const digits = pastedText.replace(/\D/g, "").slice(0, 6); // Extract first 6 digits

    digits.split("").forEach((digit, i) => {
      const inputIndex = index + i;
      if (inputRefs.current[inputIndex]) {
        inputRefs.current[inputIndex].value = digit;
      }
    });

    // Move focus to the last filled input
    const nextIndex = index + digits.length;
    if (nextIndex < inputRefs.current.length) {
      inputRefs.current[nextIndex].focus();
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault(); // **Fixes error**
    try {
        const otpArray = inputRefs.current.map((input) => input.value);
        const otp = otpArray.join("");

        const { data } = await axios.post(`http://localhost:8080/api/v1/user/verify-account`, { otp });

        if (data.success) {
            toast.success(data.message);
         
            navigate("/");
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong!");
    }
};


  useEffect(() => {
   isLoggedin && data && data.isAccountVerified && navigate("/");
  }, [isLoggedin, data]);

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      

      <form onSubmit={onSubmitHandler} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-white text-2xl font-semibold text-center mb-4">Email Verify OTP</h1>
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
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
