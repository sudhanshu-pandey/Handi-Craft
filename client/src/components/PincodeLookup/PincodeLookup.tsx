import React, { useState, useEffect } from 'react'
import usePincode from '../../hooks/usePincode'
import styles from './PincodeLookup.module.css'

interface PincodeLookupProps {
  onPincodeChange?: (pincodeData: any) => void
  placeholder?: string
  showDeliveryEstimate?: boolean
  autoLookup?: boolean
}

const PincodeLookup: React.FC<PincodeLookupProps> = ({
  onPincodeChange,
  placeholder = 'Enter your pincode',
  showDeliveryEstimate = true,
  autoLookup = true,
}) => {
  const [inputValue, setInputValue] = useState('')
  const { data, loading, error, lookupPincode, clearError } = usePincode()
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-lookup with debounce
  useEffect(() => {
    if (!autoLookup) return

    clearError()

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (inputValue && inputValue.length === 6) {
      debounceTimer.current = setTimeout(() => {
        lookupPincode(inputValue)
      }, 500)
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [inputValue, autoLookup, lookupPincode, clearError])

  // Notify parent component of changes
  useEffect(() => {
    if (onPincodeChange && data) {
      onPincodeChange(data)
    }
  }, [data, onPincodeChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setInputValue(value)
  }

  const handleManualLookup = () => {
    if (inputValue) {
      lookupPincode(inputValue)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          maxLength={6}
          className={`${styles.input} ${error ? styles.inputError : ''} ${data ? styles.inputSuccess : ''}`}
          disabled={loading}
        />
        {!autoLookup && (
          <button
            onClick={handleManualLookup}
            disabled={loading || inputValue.length !== 6}
            className={styles.searchBtn}
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingMessage}>
          <span className={styles.spinner}></span>
          Fetching location details...
        </div>
      )}

      {/* Success State */}
      {data && !loading && (
        <div className={styles.resultCard}>
          {/* City & State Info */}
          <div className={styles.locationInfo}>
            <div className={styles.cityBlock}>
              <span className={styles.label}>City</span>
              <span className={styles.value}>{data.city}</span>
            </div>
            <div className={styles.stateBlock}>
              <span className={styles.label}>State</span>
              <span className={styles.value}>{data.state}</span>
            </div>
            <div className={styles.regionBlock}>
              <span className={styles.label}>Region</span>
              <span className={styles.value}>{data.region}</span>
            </div>
          </div>

          {/* Delivery Estimate */}
          {showDeliveryEstimate && data.deliveryEstimate && (
            <div className={styles.deliverySection}>
              <h4 className={styles.deliveryTitle}>Delivery Details</h4>
              <div className={styles.deliveryGrid}>
                {/* Delivery Time */}
                <div className={styles.deliveryItem}>
                  <span className={styles.icon}>⏱️</span>
                  <div>
                    <span className={styles.label}>Estimated Delivery</span>
                    <span className={styles.value}>
                      {data.deliveryEstimate.estimatedDelivery}
                    </span>
                  </div>
                </div>

                {/* Delivery Charge */}
                <div className={styles.deliveryItem}>
                  <span className={styles.icon}>🚚</span>
                  <div>
                    <span className={styles.label}>Delivery Charge</span>
                    <div className={styles.chargeBlock}>
                      <span className={`${styles.value} ${styles[`charge_${data.deliveryEstimate.deliveryCharge.status.toLowerCase()}`]}`}>
                        {data.deliveryEstimate.deliveryCharge.amount === 0
                          ? 'FREE'
                          : `₹${data.deliveryEstimate.deliveryCharge.amount}`}
                      </span>
                      <span className={styles.status}>
                        {data.deliveryEstimate.deliveryCharge.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post Offices */}
          {data.postOffices && data.postOffices.length > 0 && (
            <div className={styles.postOfficesSection}>
              <h4 className={styles.postOfficesTitle}>Post Offices</h4>
              <ul className={styles.postOfficesList}>
                {data.postOffices.map((office, index) => (
                  <li key={index} className={styles.postOfficeItem}>
                    <span className={styles.officeName}>{office.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PincodeLookup
