import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAddresses } from '../store/slices/addressSlice';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to sync addresses from backend to Redux when user logs in
 * Ensures addresses are available on Checkout page and other components
 * 
 * Key Points:
 * - Fetches addresses immediately when user logs in
 * - Uses a ref to track login state changes (not just addresses.length)
 * - Prevents multiple fetches for the same login session
 * - Resets when user logs out
 */
export const useSyncAddresses = () => {
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAuth();
  const { addresses, loading } = useAppSelector((state: any) => state.address);
  const prevLoginStatusRef = useRef(isLoggedIn);

  useEffect(() => {
    // Detect login state change from false to true
    const loginStateChanged = !prevLoginStatusRef.current && isLoggedIn;
    
    if (loginStateChanged) {
      // User just logged in - fetch addresses
      dispatch(fetchAddresses as any);
    }

    // Update the ref for next comparison
    prevLoginStatusRef.current = isLoggedIn;
  }, [isLoggedIn, dispatch]);

  // Fallback: If user is logged in but addresses are empty and not loading,
  // try fetching again (handles network errors or skipped requests)
  useEffect(() => {
    if (isLoggedIn && addresses.length === 0 && !loading) {
      // Check if enough time has passed since last attempt
      // This prevents hammering the API on every render
      const lastFetchTime = sessionStorage.getItem('lastAddressFetchTime');
      const now = Date.now();
      
      if (!lastFetchTime || now - parseInt(lastFetchTime) > 5000) {
        sessionStorage.setItem('lastAddressFetchTime', now.toString());
        dispatch(fetchAddresses as any);
      }
    }
  }, [isLoggedIn, addresses.length, loading, dispatch]);
};

export default useSyncAddresses;
