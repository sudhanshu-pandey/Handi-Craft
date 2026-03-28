// Test file for OTP integration
// Run this in browser console or use it as reference for testing

// Test 1: Send OTP
const testSendOTP = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '9999999999'
      })
    })
    const data = await response.json()
    console.log('Send OTP Response:', data)
    return data
  } catch (error) {
    console.error('Send OTP Error:', error)
  }
}

// Test 2: Verify OTP (use OTP shown in server console)
const testVerifyOTP = async (otp?: string) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '9999999999',
        otp: otp || '000000' // Replace with actual OTP from server
      })
    })
    const data = await response.json()
    console.log('Verify OTP Response:', data)
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken)
      console.log('Token saved to localStorage')
    }
    return data
  } catch (error) {
    console.error('Verify OTP Error:', error)
  }
}

// Test 3: Get Cart (requires token)
const testGetCart = async () => {
  try {
    const token = localStorage.getItem('accessToken')
    const response = await fetch('http://localhost:5000/api/cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await response.json()
    console.log('Get Cart Response:', data)
    return data
  } catch (error) {
    console.error('Get Cart Error:', error)
  }
}

// Usage:
// 1. Call: testSendOTP()
// 2. Check server console for OTP (format: OTP: 123456)
// 3. Call: testVerifyOTP('123456')
// 4. Call: testGetCart() to verify token works

console.log('OTP Integration Tests Ready!')
console.log('Available functions:')
console.log('- testSendOTP()')
console.log('- testVerifyOTP(otp)')
console.log('- testGetCart()')
