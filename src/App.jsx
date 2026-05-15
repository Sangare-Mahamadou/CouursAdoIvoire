import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TeachersList from './pages/TeachersList';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardParent from './pages/DashboardParent';
import DashboardTeacher from './pages/DashboardTeacher';
import DashboardAdmin from './pages/DashboardAdmin';
import { Toaster } from 'react-hot-toast';
import './App.css';
import TeacherProfile from './pages/TeacherProfile';

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teachers" element={<TeachersList />} />
          <Route path="/teacher/:id" element={<TeacherProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/parent" element={<DashboardParent />} />
          <Route path="/dashboard/teacher" element={<DashboardTeacher />} />
          <Route path="/dashboard/admin" element={<DashboardAdmin />} />
        </Routes>
      </main>
      <Footer />
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
    </Router>
  );
}

export default App;
