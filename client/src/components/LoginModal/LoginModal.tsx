import { ChangeEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import styles from './LoginModal.module.css'

type LoginModalProps = {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: (mobile: string) => void
}

const OTP_LENGTH = 6
const RESEND_SECONDS = 30

const LoginModal = ({ isOpen, onClose, onLoginSuccess }: LoginModalProps) => {
  const [mobile, setMobile] = useState('')
  const [mobileError, setMobileError] = useState('')
  const [step, setStep] = useState<'mobile' | 'otp' | 'success'>('mobile')
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS)
  const [otpError, setOtpError] = useState('')

  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const resetState = () => {
    setStep('mobile')
    setMobile('')
    setMobileError('')
    setOtpDigits(Array(OTP_LENGTH).fill(''))
    setOtpError('')
    setResendTimer(RESEND_SECONDS)
  }

  const maskedMobile = useMemo(() => {
    if (mobile.length < 4) {
      return mobile
    }
    return `${mobile.slice(0, 2)}******${mobile.slice(-2)}`
  }, [mobile])

  useEffect(() => {
    if (!isOpen) {
      resetState()
      return
    }

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || step !== 'otp') {
      return
    }

    if (resendTimer <= 0) {
      return
    }

    const interval = window.setInterval(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [isOpen, step, resendTimer])

  useEffect(() => {
    if (step === 'otp' && isOpen) {
      otpRefs.current[0]?.focus()
    }
  }, [step, isOpen])

  if (!isOpen) {
    return null
  }

  const closeAndReset = () => {
    onClose()
    setTimeout(() => {
      resetState()
    }, 180)
  }

  const handleMobileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 10)
    setMobile(value)
    if (mobileError) {
      setMobileError('')
    }
  }

  const handleSendOtp = () => {
    if (!/^\d{10}$/.test(mobile)) {
      setMobileError('Please enter a valid 10-digit mobile number')
      return
    }

    setStep('otp')
    setOtpDigits(Array(OTP_LENGTH).fill(''))
    setOtpError('')
    setResendTimer(RESEND_SECONDS)
  }

  const handleOtpChange = (index: number, value: string) => {
    const normalized = value.replace(/\D/g, '').slice(-1)

    setOtpDigits((prev) => {
      const next = [...prev]
      next[index] = normalized
      return next
    })

    if (otpError) {
      setOtpError('')
    }

    if (normalized && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = () => {
    const otpValue = otpDigits.join('')
    if (otpValue.length !== OTP_LENGTH) {
      setOtpError('Please enter the complete OTP code')
      return
    }

    setStep('success')
    onLoginSuccess?.(mobile)
  }

  const handleResend = () => {
    if (resendTimer > 0) {
      return
    }
    setOtpDigits(Array(OTP_LENGTH).fill(''))
    setResendTimer(RESEND_SECONDS)
    setOtpError('')
    otpRefs.current[0]?.focus()
  }

  return (
    <div className={styles.overlay} onClick={closeAndReset} role="presentation">
      <section className={styles.modal} onClick={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-label="Login with mobile">
        <button type="button" className={styles.closeButton} onClick={closeAndReset} aria-label="Close login modal">
          ×
        </button>

        <div className={styles.modalHeader}>
          <p className={styles.pill}>Secure Access</p>
          <h2>Login</h2>
          <p>Use your mobile number to quickly verify and continue.</p>
        </div>

        {step === 'mobile' ? (
          <div className={styles.section}>
            <label htmlFor="mobile" className={styles.label}>Mobile Number</label>
            <div className={styles.mobileInputWrap}>
              <span>+91</span>
              <input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={handleMobileChange}
                placeholder="Enter 10-digit number"
                maxLength={10}
                autoFocus
              />
            </div>
            {mobileError ? <p className={styles.error}>{mobileError}</p> : null}

            <button type="button" className={styles.primaryButton} onClick={handleSendOtp}>
              Send OTP
            </button>
            <p className={styles.helper}>By continuing, you agree to our terms and privacy policy.</p>
          </div>
        ) : null}

        {step === 'otp' ? (
          <div className={styles.section}>
            <p className={styles.infoText}>Enter the 6-digit OTP sent to +91 {maskedMobile}</p>

            <div className={styles.otpGrid}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    otpRefs.current[index] = node
                  }}
                  value={digit}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            {otpError ? <p className={styles.error}>{otpError}</p> : null}

            <button type="button" className={styles.primaryButton} onClick={handleVerifyOtp}>
              Verify OTP
            </button>

            <div className={styles.inlineActions}>
              <button type="button" className={styles.textButton} onClick={() => setStep('mobile')}>
                Change Number
              </button>
              <button type="button" className={styles.textButton} onClick={handleResend} disabled={resendTimer > 0}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        ) : null}

        {step === 'success' ? (
          <div className={styles.successSection}>
            <div className={styles.successIcon}>✓</div>
            <h3>Login Successful</h3>
            <p>Your account is verified. Welcome back to MLS Handicrafts.</p>
            <button type="button" className={styles.primaryButton} onClick={closeAndReset}>
              Continue Shopping
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default LoginModal
