import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import SendPayment from "./pages/SendPayment";
import ReceivePayment from "./pages/ReceivePayment";
import History from "./pages/History";
import Profile from "./pages/Profile";

import DashboardLayout from "./layouts/DashboardLayout";
import { useAuth } from "./context/AuthContext";

import Blockchain from "./pages/Blockchain";
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-white">
          Loading SecurePay...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


function App() {
  return (
    <Routes>

      {/* Public pages */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* Protected dashboard */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/send"
          element={<SendPayment />}
        />

        <Route
          path="/receive"
          element={<ReceivePayment />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/blockchain"
          element={<Blockchain />}
/>
      </Route>


      {/* Default route */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;