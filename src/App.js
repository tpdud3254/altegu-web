import { useContext, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
// import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import { GlobalStyles } from "./styles/styles";
import { MENUS, SUB_MENUS } from "./utils/menus";
import Login from "./pages/Login/Login";
import LoginContext from "./contexts/LoginContext";
import SignIn from "./pages/Login/SignIn";

Amplify.configure(awsExports);

function App() {
    const token = localStorage.getItem("TOKEN");
    const { isLoggedIn, permission } = useContext(LoginContext);

    const checkMenuPermission = (curMenu) =>
        permission?.menuPermissions?.find((menu) => menu === curMenu);

    const checkSubmenuPermissions = (curSubmenu) =>
        permission?.submenuPermissions?.find(
            (submenu) => submenu === curSubmenu
        );

    return (
        <div>
            <HelmetProvider>
                <GlobalStyles />
                {!isLoggedIn ? (
                    token ? null : (
                        <Routes>
                            <Route path="*" element={<Login />} />
                            <Route path="/signin" element={<SignIn />} />
                        </Routes>
                    )
                ) : (
                    <Routes>
                        <Route path="/" element={SUB_MENUS.USER[0].element} />
                        {Object.keys(MENUS).map((menu) => {
                            if (!checkMenuPermission(MENUS[menu].id)) return;

                            return SUB_MENUS[menu].map((submenu) => {
                                if (!checkSubmenuPermissions(submenu.id))
                                    return;

                                return (
                                    <Route
                                        path={`${MENUS[menu].route}${submenu.route}`}
                                        element={submenu.element}
                                    />
                                );
                            });
                        })}
                        <Route path="*" element={<div>존재하지 않음</div>} />
                    </Routes>
                )}
            </HelmetProvider>
            {/* <AmplifySignOut /> */}
        </div>
    );
}

export default App;
