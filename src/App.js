import axios from "axios";
import { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Member from "./pages/Member/Member";
import ROUTES from "./routes";
// import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import { GlobalStyles } from "./styles/styles";

Amplify.configure(awsExports);

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
            {/* <AmplifySignOut /> */}
        </div>
    );
}

export default App;
