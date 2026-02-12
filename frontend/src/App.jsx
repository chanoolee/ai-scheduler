import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Schedule from './pages/Schedule';

const shellStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2.5rem 1.5rem',
};

const cardShellStyle = {
  width: '100%',
  maxWidth: 1100,
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
            <Route path="/schedule" element={<Schedule />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;