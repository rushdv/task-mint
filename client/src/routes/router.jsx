import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import PrivateRoute from './PrivateRoute'
import RoleRoute from './RoleRoute'

// Public pages
import Home from '../pages/Home/Home'
import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'

// Dashboard - Worker
import WorkerHome from '../pages/Dashboard/Worker/WorkerHome'
import TaskList from '../pages/Dashboard/Worker/TaskList'
import TaskDetails from '../pages/Dashboard/Worker/TaskDetails'
import MySubmissions from '../pages/Dashboard/Worker/MySubmissions'
import Withdrawals from '../pages/Dashboard/Worker/Withdrawals'

// Dashboard - Buyer
import BuyerHome from '../pages/Dashboard/Buyer/BuyerHome'
import AddTask from '../pages/Dashboard/Buyer/AddTask'
import MyTasks from '../pages/Dashboard/Buyer/MyTasks'
import PurchaseCoin from '../pages/Dashboard/Buyer/PurchaseCoin'
import PaymentHistory from '../pages/Dashboard/Buyer/PaymentHistory'

// Dashboard - Admin
import AdminHome from '../pages/Dashboard/Admin/AdminHome'
import ManageUsers from '../pages/Dashboard/Admin/ManageUsers'
import ManageTasks from '../pages/Dashboard/Admin/ManageTasks'

import NotFound from '../pages/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  {
    path: '/dashboard',
    element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
    children: [
      // Worker routes
      { path: 'worker-home', element: <RoleRoute role="worker"><WorkerHome /></RoleRoute> },
      { path: 'task-list', element: <RoleRoute role="worker"><TaskList /></RoleRoute> },
      { path: 'task-details/:id', element: <RoleRoute role="worker"><TaskDetails /></RoleRoute> },
      { path: 'my-submissions', element: <RoleRoute role="worker"><MySubmissions /></RoleRoute> },
      { path: 'withdrawals', element: <RoleRoute role="worker"><Withdrawals /></RoleRoute> },
      // Buyer routes
      { path: 'buyer-home', element: <RoleRoute role="buyer"><BuyerHome /></RoleRoute> },
      { path: 'add-task', element: <RoleRoute role="buyer"><AddTask /></RoleRoute> },
      { path: 'my-tasks', element: <RoleRoute role="buyer"><MyTasks /></RoleRoute> },
      { path: 'purchase-coin', element: <RoleRoute role="buyer"><PurchaseCoin /></RoleRoute> },
      { path: 'payment-history', element: <RoleRoute role="buyer"><PaymentHistory /></RoleRoute> },
      // Admin routes
      { path: 'admin-home', element: <RoleRoute role="admin"><AdminHome /></RoleRoute> },
      { path: 'manage-users', element: <RoleRoute role="admin"><ManageUsers /></RoleRoute> },
      { path: 'manage-tasks', element: <RoleRoute role="admin"><ManageTasks /></RoleRoute> },
    ],
  },
  { path: '*', element: <NotFound /> },
])

export default router
