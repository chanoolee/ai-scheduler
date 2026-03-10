import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashBoard';

const shellStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2.5rem 1.5rem',
};

const cardShellStyle = {
  width: '100%'
};

function App() {
  return (
    <BrowserRouter>
      <div style={shellStyle}>
        <div style={cardShellStyle}>
          <Routes>
            {/* 로그인 페이지 (첫 화면) */}
            <Route path="/" element={<Login />} />

            {/* 스케줄 페이지 */}
            <Route path="/dashboard" element={<UserDashboard />} />

            {/* 관리자 페이지 */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;