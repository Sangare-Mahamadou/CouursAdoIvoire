import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TeachersList from './pages/TeachersList';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetCode from './pages/VerifyResetCode';
import DashboardParent from './pages/DashboardParent';
import DashboardTeacher from './pages/DashboardTeacher';
import DashboardAdmin from './pages/DashboardAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import './App.css';
import TeacherProfile from './pages/TeacherProfile';

function AppLayout() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminArea && <Navbar />}
      <main style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teachers" element={<TeachersList />} />
          <Route path="/teacher/:id" element={<TeacherProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-code" element={<VerifyResetCode />} />
          <Route path="/dashboard/parent" element={<ProtectedRoute allowedRoles={['parent']}><DashboardParent /></ProtectedRoute>} />
          <Route path="/dashboard/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><DashboardTeacher /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardAdmin /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
      {!isAdminArea && <Footer />}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
