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
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teachers" element={<TeachersList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/parent" element={<DashboardParent />} />
          <Route path="/dashboard/teacher" element={<DashboardTeacher />} />
          <Route path="/dashboard/admin" element={<DashboardAdmin />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
