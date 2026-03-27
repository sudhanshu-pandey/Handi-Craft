/**
 * Mock Indian pincode → { city, state } lookup.
 * In production replace lookupPincode() with a real API call
 * (e.g. https://api.postalpincode.in/pincode/{pincode}).
 */

export type PincodeResult =
  | { found: true; city: string; state: string }
  | { found: false; city: null; state: null }

const PINCODE_MAP: Record<string, { city: string; state: string }> = {
  // Delhi
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '110002': { city: 'New Delhi', state: 'Delhi' },
  '110011': { city: 'New Delhi', state: 'Delhi' },
  '110020': { city: 'New Delhi', state: 'Delhi' },
  // Mumbai
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '400002': { city: 'Mumbai', state: 'Maharashtra' },
  '400051': { city: 'Mumbai', state: 'Maharashtra' },
  '400076': { city: 'Mumbai', state: 'Maharashtra' },
  // Bangalore
  '560001': { city: 'Bengaluru', state: 'Karnataka' },
  '560002': { city: 'Bengaluru', state: 'Karnataka' },
  '560034': { city: 'Bengaluru', state: 'Karnataka' },
  '560068': { city: 'Bengaluru', state: 'Karnataka' },
  // Chennai
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '600002': { city: 'Chennai', state: 'Tamil Nadu' },
  '600020': { city: 'Chennai', state: 'Tamil Nadu' },
  // Hyderabad
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '500002': { city: 'Hyderabad', state: 'Telangana' },
  '500072': { city: 'Hyderabad', state: 'Telangana' },
  // Kolkata
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '700002': { city: 'Kolkata', state: 'West Bengal' },
  '700091': { city: 'Kolkata', state: 'West Bengal' },
  // Jaipur
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
  '302002': { city: 'Jaipur', state: 'Rajasthan' },
  '302020': { city: 'Jaipur', state: 'Rajasthan' },
  // Ahmedabad
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '380015': { city: 'Ahmedabad', state: 'Gujarat' },
  '380059': { city: 'Ahmedabad', state: 'Gujarat' },
  // Pune
  '411001': { city: 'Pune', state: 'Maharashtra' },
  '411002': { city: 'Pune', state: 'Maharashtra' },
  '411028': { city: 'Pune', state: 'Maharashtra' },
  // Lucknow
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '226010': { city: 'Lucknow', state: 'Uttar Pradesh' },
  // Chandigarh
  '160001': { city: 'Chandigarh', state: 'Chandigarh' },
  '160017': { city: 'Chandigarh', state: 'Chandigarh' },
  // Kochi
  '682001': { city: 'Kochi', state: 'Kerala' },
  '682011': { city: 'Kochi', state: 'Kerala' },
  // Indore
  '452001': { city: 'Indore', state: 'Madhya Pradesh' },
  '452010': { city: 'Indore', state: 'Madhya Pradesh' },
  // Surat
  '395001': { city: 'Surat', state: 'Gujarat' },
  '395007': { city: 'Surat', state: 'Gujarat' },
  // Noida
  '201301': { city: 'Noida', state: 'Uttar Pradesh' },
  '201309': { city: 'Noida', state: 'Uttar Pradesh' },
  // Gurgaon
  '122001': { city: 'Gurugram', state: 'Haryana' },
  '122002': { city: 'Gurugram', state: 'Haryana' },
  // Bhubaneswar
  '751001': { city: 'Bhubaneswar', state: 'Odisha' },
  '751010': { city: 'Bhubaneswar', state: 'Odisha' },
  // Patna
  '800001': { city: 'Patna', state: 'Bihar' },
  '800014': { city: 'Patna', state: 'Bihar' },
}

/**
 * Simulates an async API call with a short delay.
 * Returns city and state for known pincodes, found=false otherwise.
 */
export const lookupPincode = (pincode: string): Promise<PincodeResult> => {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const entry = PINCODE_MAP[pincode.trim()]
      if (entry) {
        resolve({ found: true, ...entry })
      } else {
        resolve({ found: false, city: null, state: null })
      }
    }, 500)
  })
}
