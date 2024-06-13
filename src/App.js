import { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
// import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import { GlobalStyles } from "./styles/styles";
import { MENUS, SUB_MENUS } from "./utils/menus";

Amplify.configure(awsExports);

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [userId, setUserId] = useState(1); //TEST: 테스트 코드

    if (!isLoggedIn) return <div>login page</div>;

    //TODO: admin 계정일 경우 전부다 보이게 설정
    const menuPermissions = ["user", "order", "price", "manage"]; //TEST: 테스트 코드
    const submenuPermissions = [
        "user_search",
        "order_search",
        "price_order",
        "manage_manager",
    ]; //TEST: 테스트 코드

    const checkMenuPermission = (curMenu) =>
        menuPermissions.find((menu) => menu === curMenu);

    const checkSubmenuPermissions = (curSubmenu) =>
        submenuPermissions.find((submenu) => submenu === curSubmenu);

    return (
        <div>
            <HelmetProvider>
                <GlobalStyles />
                <Routes>
                    <Route path="/" element={SUB_MENUS.USER[0].element} />
                    {Object.keys(MENUS).map((menu) => {
                        if (userId !== 1)
                            if (!checkMenuPermission(MENUS[menu].id)) return;

                        return SUB_MENUS[menu].map((submenu) => {
                            if (userId !== 1)
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
            </HelmetProvider>
            {/* <AmplifySignOut /> */}
        </div>
    );
}

export default App;
