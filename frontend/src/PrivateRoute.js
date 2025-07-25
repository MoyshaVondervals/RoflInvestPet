// PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function PrivateRoute({ element, requiredRole }) {
    const jwtToken = useSelector((state) => state.auth.token);
    const userRole = useSelector((state) => state.auth.role);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    if (isLoading) return <>Loading...</>;

    // Если нет токена, отправляем на главную
    if (!jwtToken) return <Navigate to="/" replace />;

    // Если указана requiredRole и роль пользователя не совпадает
    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/" replace />; // Страница "Нет доступа"
    }

    return element;
}

export default PrivateRoute;
