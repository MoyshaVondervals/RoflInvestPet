// PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function PrivateRoute({ element }) {
    const jwtToken = useSelector((state) => state.auth.token);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <>Loading...</>;
    }
    return jwtToken ? element : <Navigate to="/" replace />;
}

export default PrivateRoute;
