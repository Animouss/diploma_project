import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

import Dashboard from '../pages/Dashboard';
import Tests from '../pages/Tests';
import Results from '../pages/Results';
import AdminPanel from '../pages/AdminPanel';
import TestRunner from '../pages/TestRunner';
import ProtectedRoute from './ProtectedRoute';

const Layout = () => {
    return (
        <div className="app">
            <Sidebar />

            <div className="main">
                <Header />

                <div className="content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/tests" element={<Tests />} />
                        <Route path="/tests/:id" element={<TestRunner />} />
                        <Route path="/results" element={<Results />} />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute roles={['admin']}>
                                    <AdminPanel />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Layout;
