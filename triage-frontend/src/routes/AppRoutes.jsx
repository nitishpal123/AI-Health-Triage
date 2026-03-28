import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import TenantDashboard from '../pages/TenantDashboard';
import DoctorDashboard from '../pages/DoctorDashboard';
import PathologyDashboard from '../pages/PathologyDashboard';
import PatientDashboard from '../pages/PatientDashboard';
import PatientOnboarding from '../pages/PatientOnboarding';
import ProtectedRoute, { PublicRoute } from './ProtectedRoute';

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />

        <Route path="/tenant" element={
            <ProtectedRoute allowedRoles={['HospitalAdmin', 'SuperAdmin']}>
                <TenantDashboard />
            </ProtectedRoute>
        } />

        <Route path="/onboarding" element={
            <ProtectedRoute allowedRoles={['HospitalAdmin', 'SuperAdmin']}>
                <PatientOnboarding />
            </ProtectedRoute>
        } />

        <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboard />
            </ProtectedRoute>
        } />

        <Route path="/pathology" element={
            <ProtectedRoute allowedRoles={['Pathologist']}>
                <PathologyDashboard />
            </ProtectedRoute>
        } />

        <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['Patient']}>
                <PatientDashboard />
            </ProtectedRoute>
        } />

        <Route path="*" element={<PublicRoute><Login /></PublicRoute>} />
    </Routes>
);

export default AppRoutes;
