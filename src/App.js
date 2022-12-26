import { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import routes from "./routes";
import { GlobalStyles } from "./styles/styles";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    return (
        <div>
            <HelmetProvider>
                <GlobalStyles />
                <Routes>
                    <Route
                        path={routes.home}
                        element={isLoggedIn ? null : <Login />}
                    />
                </Routes>
            </HelmetProvider>
        </div>
    );
}

export default App;
