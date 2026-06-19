import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadResource from './pages/UploadResource';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import MyResources from './pages/MyResources';
import Layout from './components/Layout'; // Use Layout
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student/upload" element={<UploadResource />} />
          <Route path="/student/my-uploads" element={<MyResources />} />
          <Route path="/student/dashboard" element={<Navigate to="/" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Layout>
  );
};

export default App;
