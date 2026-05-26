import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import emailjs from 'emailjs-com';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [email, setEmail] = useState('');

  // Step 2
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [timer, setTimer] = useState(600);
  const inputRefs = useRef([]);

  // Step 3
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Common
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Countdown timer
  useEffect(() => {
    if (step !== 2) return;
    if (timer <= 0) {
      setError('OTP expired. Please request a new code.');
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // STEP 1 — Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    const rawServiceId = (import.meta.env.VITE_EMAILJS_SERVICE_ID || '').trim();
    const rawTemplateId = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '').trim();
    const rawPublicKey = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '').trim();

    // Fallback to the real credentials if Vite has cached placeholders
    const serviceId = (!rawServiceId || rawServiceId === 'service_xxxxxx') ? 'service_l8vetyo' : rawServiceId;
    const templateId = (!rawTemplateId || rawTemplateId === 'template_xxxxxx') ? 'template_h6y5d64' : rawTemplateId;
    const publicKey = (!rawPublicKey || rawPublicKey === 'your_public_key') ? 'HMzamMEnOv9MpIe9f' : rawPublicKey;

    console.log('Sanitized EmailJS Config:', { serviceId, templateId, publicKey });

    try {
      const code = generateOTP();
      setGeneratedOTP(code);
      setOtpExpiry(Date.now() + 600000);
      setTimer(600);

      // Explicitly initialize EmailJS
      emailjs.init(publicKey);

      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: email,
          to_name: email.split('@')[0],
          otp_code: code,
        },
        publicKey
      );

      setStep(2);
      setMessage(`6-digit code sent to ${email}`);
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(`Failed to send code: ${err.text || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // OTP box handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  // STEP 2 — Verify OTP
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setError('');

    const enteredOTP = otp.join('');

    if (enteredOTP.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    if (Date.now() > otpExpiry) {
      setError('OTP has expired. Please request a new code.');
      return;
    }
    if (enteredOTP !== generatedOTP) {
      setError('Incorrect code. Please try again.');
      return;
    }

    setMessage('');
    setError('');
    setStep(3);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    setMessage('');
    setLoading(true);

    const rawServiceId = (import.meta.env.VITE_EMAILJS_SERVICE_ID || '').trim();
    const rawTemplateId = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '').trim();
    const rawPublicKey = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '').trim();

    const serviceId = (!rawServiceId || rawServiceId === 'service_xxxxxx') ? 'service_l8vetyo' : rawServiceId;
    const templateId = (!rawTemplateId || rawTemplateId === 'template_xxxxxx') ? 'template_h6y5d64' : rawTemplateId;
    const publicKey = (!rawPublicKey || rawPublicKey === 'your_public_key') ? 'HMzamMEnOv9MpIe9f' : rawPublicKey;

    try {
      const code = generateOTP();
      setGeneratedOTP(code);
      setOtpExpiry(Date.now() + 600000);
      setTimer(600);

      // Explicitly initialize EmailJS
      emailjs.init(publicKey);

      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: email,
          to_name: email.split('@')[0],
          otp_code: code,
        },
        publicKey
      );

      setMessage('New code sent! Check your inbox.');
    } catch (err) {
      setError('Failed to resend: ' + (err.text || err.message));
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 — Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');

      setMessage('✅ Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Reset error:', err);
      setError('Failed to reset password: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const cardStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
  };

  const boxStyle = {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    marginBottom: '16px',
    boxSizing: 'border-box',
  };

  const btnStyle = (disabled) => ({
    width: '100%',
    padding: '13px',
    background: disabled ? '#aaa' : 'linear-gradient(to right, #00c6ff, #0072ff)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    marginTop: '4px',
  });

  const alertStyle = (type) => ({
    background: type === 'error' ? '#f8d7da' : '#d4edda',
    color: type === 'error' ? '#721c24' : '#155724',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    textAlign: 'center',
    fontSize: '14px',
  });

  return (
    <div style={cardStyle}>
      <div style={boxStyle}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 4px', color: '#111' }}>SparkleWash</h2>
          <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
            {step === 1 && 'Enter your email to receive a reset code'}
            {step === 2 && 'Enter the 6-digit code sent to your email'}
            {step === 3 && 'Set your new password'}
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          {[1, 2, 3].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: step >= s ? 'linear-gradient(to right, #00c6ff, #0072ff)' : '#e0e0e0',
                color: step >= s ? 'white' : '#999',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '14px',
                transition: 'all 0.3s',
              }}>
                {step > s ? '✓' : s}
              </div>
              {i < 2 && (
                <div style={{
                  width: '40px', height: '2px',
                  background: step > s ? '#0072ff' : '#e0e0e0',
                  transition: 'all 0.3s',
                }} />
              )}
            </div>
          ))}
        </div>

        {error && <div style={alertStyle('error')}>{error}</div>}
        {message && <div style={alertStyle('success')}>{message}</div>}

        {/* STEP 1 — Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? 'Sending Code...' : 'Send Code'}
            </button>
          </form>
        )}

        {/* STEP 2 — OTP Boxes */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <p style={{ textAlign: 'center', color: '#444', fontSize: '14px', marginBottom: '24px' }}>
              Code sent to <strong>{email}</strong>
            </p>

            <div
              style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  style={{
                    width: '48px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: '700',
                    border: digit ? '2px solid #0072ff' : '2px solid #ddd',
                    borderRadius: '10px',
                    outline: 'none',
                    background: digit ? '#f0f7ff' : 'white',
                    transition: 'all 0.2s',
                    caretColor: '#0072ff',
                  }}
                />
              ))}
            </div>

            {/* Countdown */}
            <p style={{ textAlign: 'center', color: timer < 60 ? '#dc3545' : '#666', fontSize: '13px', marginBottom: '16px' }}>
              Code expires in <strong>{formatTimer(timer)}</strong>
            </p>

            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            {/* Resend — only active when timer hits 0 */}
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#666' }}>
              Didn't receive it?{' '}
              <span
                onClick={timer === 0 && !loading ? handleResendOTP : undefined}
                style={{
                  color: timer === 0 ? '#0072ff' : '#bbb',
                  cursor: timer === 0 ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  textDecoration: timer === 0 ? 'underline' : 'none',
                }}
              >
                Resend Code {timer > 0 && `(${formatTimer(timer)})`}
              </span>
            </p>
          </form>
        )}

        {/* STEP 3 — New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>

            {/* New Password */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input
                type={showNewPass ? 'text' : 'password'}
                placeholder="New password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ ...inputStyle, marginBottom: 0, paddingRight: '48px' }}
              />
              <span
                onClick={() => setShowNewPass(!showNewPass)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '18px' }}
              >
                {showNewPass ? '🙈' : '👁️'}
              </span>
            </div>

            {/* Password strength */}
            {newPassword && (
              <p style={{ fontSize: '12px', color: newPassword.length >= 8 ? 'green' : 'orange', marginBottom: '12px', marginTop: '-8px' }}>
                {newPassword.length >= 8 ? '✅ Strong password' : '⚠️ Use at least 8 characters'}
              </p>
            )}

            {/* Confirm Password */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input
                type={showConfirmPass ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ ...inputStyle, marginBottom: 0, paddingRight: '48px' }}
              />
              <span
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '18px' }}
              >
                {showConfirmPass ? '🙈' : '👁️'}
              </span>
            </div>

            {/* Match indicator */}
            {confirmPassword && (
              <p style={{ fontSize: '12px', color: newPassword === confirmPassword ? 'green' : 'red', marginBottom: '12px', marginTop: '-8px' }}>
                {newPassword === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
              </p>
            )}

            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Back to login */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/login" style={{ color: '#0072ff', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
