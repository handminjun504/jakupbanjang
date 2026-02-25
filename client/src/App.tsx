import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GlobalStyles from './styles/GlobalStyles';
import PrivateRoute from './components/PrivateRoute';

// 공통 페이지 (즉시 로드)
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';

// 로딩 컴포넌트
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    로딩 중...
  </div>
);

// 관리자 페이지 (Lazy Loading)
const ManagerLayout = lazy(() => import('./layouts/ManagerLayout'));
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));
const SiteManagementPage = lazy(() => import('./pages/manager/SiteManagementPage'));
const AllWorkLogsPage = lazy(() => import('./pages/manager/AllWorkLogsPage'));
const AllWorkersListPage = lazy(() => import('./pages/manager/AllWorkersListPage'));
const ExpenseManagementPage = lazy(() => import('./pages/manager/ExpenseManagementPage'));
const AggregationPage = lazy(() => import('./pages/manager/AggregationPage'));

// 작업반장 페이지 (Lazy Loading)
const ExpenseEntryPage = lazy(() => import('./pages/ExpenseEntryPage'));
const SiteSelectionPage = lazy(() => import('./pages/foreman/SiteSelectionPage'));
const AddWorkerPage = lazy(() => import('./pages/foreman/AddWorkerPage'));
const EditWorkerPage = lazy(() => import('./pages/foreman/EditWorkerPage'));
const WorkerListPage = lazy(() => import('./pages/foreman/WorkerListPage'));
const WorkLogListPage = lazy(() => import('./pages/foreman/WorkLogListPage'));
const AddWorkLogPage = lazy(() => import('./pages/foreman/AddWorkLogPage'));

function App() {
  return (
    <>
      <GlobalStyles />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
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
            path="/foreman/expense"
            element={
              <PrivateRoute requiredRole="foreman">
                <ExpenseEntryPage />
              </PrivateRoute>
            }
          />

          {/* 404 - 홈으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
