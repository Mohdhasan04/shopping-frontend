// ✅ MOBILE DETECTION UTILITY
export const isMobile = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768;
  }
  return false;
};

export const isTablet = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  }
  return false;
};

export const isDesktop = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 1024;
  }
  return false;
};

export const getScreenSize = () => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width < 375) return 'xs';
    if (width < 640) return 'sm';
    if (width < 768) return 'md';
    if (width < 1024) return 'lg';
    if (width < 1280) return 'xl';
    return '2xl';
  }
  return 'xl';
};

// ✅ MOBILE EVENT LISTENER
export const addResizeListener = (callback) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
  }
};

// ✅ MOBILE ORIENTATION
export const getOrientation = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }
  return 'portrait';
};