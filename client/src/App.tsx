import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/global/Navbar';
import Footer from './components/global/Footer';
import Home from './pages/Home';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFound from './pages/NotFound';
import Login from './components/auth/Signin';
import Students from './pages/Students';
import AdminSettings from './pages/AdminSettings';
import StudentProfile from './pages/StudentProfile';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/5 via-background to-tertiary/5 dark:from-primary-dark/5 dark:via-background-dark dark:to-tertiary-dark/5 transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/students" element={<Students />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/student/:studentId" element={<StudentProfile />} />
              </Route>

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
