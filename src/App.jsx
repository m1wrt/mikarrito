import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CustomThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import NotificationManager from "./components/NotificationManager";

// Toast Notifications
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <CustomThemeProvider>
      <ToastContainer position="bottom-left" autoClose={3000} hideProgressBar={false} />
      <AuthProvider>
        <NotificationManager />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Feed />} />
              <Route path="profile/:userId" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
