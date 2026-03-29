import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [currentChildren, setCurrentChildren] = useState(children);

  useEffect(() => {
    setIsLoading(true);
    setShowContent(false);

    const timer = setTimeout(() => {
      setCurrentChildren(children);
      setIsLoading(false);
      setShowContent(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoading) {
      setCurrentChildren(children);
    }
  }, [children, isLoading]);

  return (
    <div className="relative min-h-screen">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-accent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            </div>
            <div className="cs-shimmer-bar w-24 h-1 rounded-full overflow-hidden">
              <div className="h-full w-full cs-gradient-primary rounded-full animate-shimmer" />
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <div className={`transition-all duration-300 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {currentChildren}
      </div>
    </div>
  );
};

export default PageTransition;
