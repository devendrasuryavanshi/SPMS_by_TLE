import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background dark:bg-background-dark transition-colors duration-300">
      <main className="flex-grow w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
