import { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
// import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import { GlobalStyles } from "./styles/styles";
import { MENUS, SUB_MENUS } from "./utils/menus";
import ManageUser from "./pages/User/ManageUser";
import SearchUser from "./pages/User/SearchUser/SearchUser";
import ManageMembership from "./pages/User/ManageMembership/ManageMembership";

Amplify.configure(awsExports);

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    return (
        <div>
            <HelmetProvider>
                <GlobalStyles />
                <Routes>
                    {/* <Route
                        path={ROUTES.HOME}
                        element={isLoggedIn ? <Home /> : <Login />}
                    />
                    <Route
                        path={`${ROUTES.MEMBER}/:submenuIndex`}
                        element={<Member />}
                    /> */}
                    <Route path="/" element={<SearchUser />} />
                    <Route
                        path={`${MENUS.USER.route}${SUB_MENUS.USER[0].route}`}
                        element={<SearchUser />}
                    />
                    <Route
                        path={`${MENUS.USER.route}${SUB_MENUS.USER[1].route}`}
                        element={<ManageMembership />}
                    />
                    <Route
                        path={`${MENUS.ORDER.route}${SUB_MENUS.ORDER[0].route}`}
                        element={<div>order</div>}
                    />
                </Routes>
            </HelmetProvider>
            {/* <AmplifySignOut /> */}
        </div>
    );
}

export default App;
