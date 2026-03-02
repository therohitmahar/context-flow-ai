export const getRedirectURL = () => {
  const url = window.location.origin;
  const redirectURL = url.endsWith('/') ? url : `${url}/`;
  
  console.log('[Auth] Generated Redirect URL:', redirectURL);
  return redirectURL;
};
