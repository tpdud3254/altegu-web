import axios from "axios";
import { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Member from "./pages/Member/Member";
import ROUTES from "./routes";

import { GlobalStyles } from "./styles/styles";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    return (
        <div>
            <HelmetProvider>
                <GlobalStyles />
                <Routes>
                    <Route
                        path={ROUTES.HOME}
                        element={isLoggedIn ? <Home /> : <Login />}
                    />
                    <Route
                        path={`${ROUTES.MEMBER}/:submenuIndex`}
                        element={<Member />}
                    />
                </Routes>
            </HelmetProvider>
        </div>
    );
}

export default App;
