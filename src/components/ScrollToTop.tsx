import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the absolute top of the page on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // prevents weird smooth scrolling flashes on mobile
    });
  }, [pathname]);

  return null;
}
