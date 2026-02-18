import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Maintenance from './pages/Maintenance';
import TransactionCancelled from './pages/TransactionCancelled';
import TransactionSuccess from './pages/TransactionSuccess';
import LogOut from './pages/LogOut';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<LogOut />} />

          {/* Protected Routes - Accessible to All Users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="books" element={<Books />} />
              <Route path="members" element={<Members />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="reports" element={<Reports />} />
              <Route path="transaction-cancelled" element={<TransactionCancelled />} />
              <Route path="transaction-success" element={<TransactionSuccess />} />
            </Route>
          </Route>

          {/* Admin Only Routes - Maintenance */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/" element={<Layout />}>
              <Route path="users" element={<Users />} />
              <Route path="maintenance" element={<Maintenance />} />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
