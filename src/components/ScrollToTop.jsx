import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Force manual scroll restoration to prevent browser interference
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. Scroll main window
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Immediate scroll
    });

    // 3. Scroll common layout containers just in case
    const scrollContainers = [
      document.documentElement,
      document.body,
      document.querySelector('main'),
      document.getElementById('root'),
      document.querySelector('.App')
    ];

    scrollContainers.forEach(container => {
      if (container) {
        container.scrollTop = 0;
      }
    });

    console.log('🚀 ScrollToTop: Scrolled to top for', pathname);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
