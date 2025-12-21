import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";

function App() {
    return (
        <Routes>
            {/* Страница входа без сайдбара */}
            <Route path="/login" element={<Login />} />

            {/* Все основные страницы внутри Layout (с сайдбаром и хедером) */}
            <Route path="/*" element={<Layout />} />

            {/* На всякий случай: всё неизвестное отправляем на /login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
