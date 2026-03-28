import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import TenantDashboard from '../pages/TenantDashboard';
import DoctorDashboard from '../pages/DoctorDashboard';
import PathologyDashboard from '../pages/PathologyDashboard';
import PatientDashboard from '../pages/PatientDashboard';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            
            <Route 
              path="/tenant" 
              element={
                <ProtectedRoute allowedRoles={['HospitalAdmin', 'SuperAdmin']}>
                  <TenantDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/doctor" 
              element={
                <ProtectedRoute allowedRoles={['Doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pathology" 
              element={
                <ProtectedRoute allowedRoles={['Pathologist']}>
                  <PathologyDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/patient" 
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Login />} />
        </Routes>
    );
};

export default AppRoutes;
