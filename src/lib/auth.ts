export const getRedirectURL = () => {
  let url =
    import.meta.env.VITE_SITE_URL ?? 
    import.meta.env.VITE_VERCEL_URL ?? // Manual VITE_ prefixed version of VERCEL_URL
    window.location.origin;

  // Ensure trailing slash
  url = url.endsWith('/') ? url : `${url}/`;
  
  // Ensure protocol
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  
  console.log('[Auth] Generated Redirect URL:', url);
  return url;
};
