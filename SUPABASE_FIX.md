# URGENT: Fix Supabase Redirect URLs

## The Problem
Your app is redirecting to homepage after OAuth login because Supabase's redirect URLs are misconfigured.

## Steps to Fix NOW:

1. **Go to Supabase Dashboard**
   - https://app.supabase.com/project/cbopynuvhcymbumjnvay/auth/url-configuration

2. **Update Redirect URLs**
   Add these EXACT URLs:
   ```
   https://marketdata.repspheres.com/market-data
   http://localhost:5173/market-data
   http://localhost:3000/market-data
   ```

3. **Remove or Update any URLs pointing to:**
   - `/` (homepage)
   - `/auth/callback`
   - Any URL without `/market-data`

4. **Save Changes**

5. **Clear Browser Data**
   - Clear cookies for marketdata.repspheres.com
   - Clear localStorage
   - Try in incognito/private mode

## Why This Happens
Supabase OAuth flow:
1. User clicks login → Goes to Google/Facebook
2. After auth → Redirects back to your app
3. Supabase checks if the redirect URL is in allowed list
4. If `/market-data` is NOT in the list, it defaults to `/`

## Verify Fix
After updating Supabase:
1. Open browser console
2. Go to https://marketdata.repspheres.com/market-data
3. Click login
4. Should stay on /market-data after auth completes