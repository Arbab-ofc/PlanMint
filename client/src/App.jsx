
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "./contexts/AuthContext.jsx";

import Header from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import About from "./pages/About.jsx";
import ErrorPage from "./pages/Error.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
import Messages from "./pages/Messages.jsx";
import ProjectTasks from "./pages/ProjectTasks.jsx";
import TaskDetail from "./pages/TaskDetail.jsx";
import Profile from "./pages/Profile.jsx";
import AdminPortal from "./pages/AdminPortal.jsx";

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useUser();
  const loc = useLocation();

  if (loading) return <div className="pt-24 text-center">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: loc }} />;

  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useUser();
  const loc = useLocation();

  if (loading) return <div className="pt-24 text-center">Loading…</div>;
  if (isAuthenticated) return <Navigate to={loc.state?.from?.pathname || "/dashboard"} replace />;

  return children;
}


function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="pt-0 max-w-100% mx-auto px-0 pb-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public */}
        <Route index element={<Home />} />
        <Route
          path="login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="signup"
          element={
            <PublicOnly>
              <Signup />
            </PublicOnly>
          }
        />

        <Route path="/verify-email" element = {
            <PublicOnly>
              <VerifyEmail />
            </PublicOnly>
          } />

        <Route path="/forgot" element={<PublicOnly>
              <ForgotPassword />
            </PublicOnly> } />


        <Route path="about" element={<About />} />

        
        <Route
          path="dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <RequireAuth>
              <ProjectDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <Messages />
            </RequireAuth>
          }
        />

        <Route
          path="/projects/:projectId/tasks"
          element={
            <RequireAuth>
              <ProjectTasks />
            </RequireAuth>
          }
        />

        <Route
          path="/tasks/:taskId"
          element={
            <RequireAuth>
              <TaskDetail />
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminPortal />
            </RequireAuth>
          }
        />

        
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
  );
}
