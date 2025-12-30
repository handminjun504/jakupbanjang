import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';

// 관리자 페이지
import ManagerLayout from './layouts/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import SiteManagementPage from './pages/manager/SiteManagementPage';
import AllWorkLogsPage from './pages/manager/AllWorkLogsPage';
import AllWorkersListPage from './pages/manager/AllWorkersListPage';
import ExpenseManagementPage from './pages/manager/ExpenseManagementPage';
import AggregationPage from './pages/manager/AggregationPage';

// 작업반장 페이지
import WorkerDetailPage from './pages/WorkerDetailPage';
import ExpenseEntryPage from './pages/ExpenseEntryPage';
import SiteSelectionPage from './pages/foreman/SiteSelectionPage';
import AddWorkerPage from './pages/foreman/AddWorkerPage';
import EditWorkerPage from './pages/foreman/EditWorkerPage';
import WorkerListPage from './pages/foreman/WorkerListPage';
import WorkLogListPage from './pages/foreman/WorkLogListPage';
import AddWorkLogPage from './pages/foreman/AddWorkLogPage';

function App() {
  return (
    <>
      <GlobalStyles />
      <BrowserRouter>
        <Routes>
          {/* 공통 페이지 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* 관리자 전용 라우트 */}
          <Route
            path="/manager"
            element={
              <PrivateRoute requiredRole="manager">
                <ManagerLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="sites" element={<SiteManagementPage />} />
            <Route path="worklogs" element={<AllWorkLogsPage />} />
            <Route path="workers" element={<AllWorkersListPage />} />
            <Route path="expenses" element={<ExpenseManagementPage />} />
            <Route path="aggregation" element={<AggregationPage />} />
            {/* 기본 경로는 대시보드로 */}
            <Route index element={<Navigate to="/manager/dashboard" replace />} />
          </Route>

          {/* 작업반장 전용 라우트 */}
          <Route
            path="/foreman/select-site"
            element={
              <PrivateRoute requiredRole="foreman">
                <SiteSelectionPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/foreman/workers"
            element={
              <PrivateRoute requiredRole="foreman">
                <WorkerListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/foreman/add-worker"
            element={
              <PrivateRoute requiredRole="foreman">
                <AddWorkerPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/foreman/edit-worker/:workerId"
            element={
              <PrivateRoute requiredRole="foreman">
                <EditWorkerPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/foreman/worklogs"
            element={
              <PrivateRoute requiredRole="foreman">
                <WorkLogListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/foreman/add-worklog"
            element={
              <PrivateRoute requiredRole="foreman">
                <AddWorkLogPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/foreman/worker/:id"
            element={
              <PrivateRoute requiredRole="foreman">
                <WorkerDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/foreman/expense"
            element={
              <PrivateRoute requiredRole="foreman">
                <ExpenseEntryPage />
              </PrivateRoute>
            }
          />

          {/* 레거시 라우트 리다이렉트 */}
          <Route path="/tasks" element={<Navigate to="/foreman/worklogs" replace />} />
          <Route path="/foreman/tasks" element={<Navigate to="/foreman/worklogs" replace />} />
          <Route path="/worker/:id" element={<Navigate to="/foreman/worker/:id" replace />} />
          <Route path="/task-entry/:workerId" element={<Navigate to="/foreman/add-worklog" replace />} />
          <Route path="/foreman/task-entry/:workerId" element={<Navigate to="/foreman/add-worklog" replace />} />
          <Route path="/expense" element={<Navigate to="/foreman/expense" replace />} />
          <Route path="/dashboard" element={<Navigate to="/foreman/worklogs" replace />} />

          {/* 404 - 홈으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
