import React, { createContext, useEffect, useState } from "react";
import { MENUS, SUB_MENUS } from "../utils/menus";

export const LoginContext = createContext({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    userInfo: null,
    setUserInfo: () => {},
    // permission: {},
});

const LoginProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(false);
    // const [permission, setPermission] = useState({});

    useEffect(() => {
        if (localStorage.getItem("TOKEN")) setIsLoggedIn(true);
    }, []);

    // useEffect(() => {
    //     if (userInfo.id === 1) {
    //         const adminPermission = {
    //             menuPermissions: [],
    //             submenuPermissions: [],
    //             funtionPermissions: [],
    //         };

    //         Object.keys(MENUS).map((menu) => {
    //             adminPermission.menuPermissions.push(MENUS[menu].id);
    //             SUB_MENUS[menu].map((submenu) => {
    //                 adminPermission.submenuPermissions.push(submenu.id);
    //             });
    //         });

    //         setPermission(adminPermission);
    //     } else {
    //         if (userInfo?.permission || userInfo?.permission?.length > 0)
    //             setPermission(JSON.parse(userInfo.permission));
    //         else
    //             setPermission({
    //                 menuPermissions: [],
    //                 submenuPermissions: [],
    //                 funtionPermissions: [],
    //             });
    //     }
    // }, []);

    const value = {
        isLoggedIn,
        setIsLoggedIn,
        userInfo,
        setUserInfo,
    };

    return (
        <LoginContext.Provider value={value}>{children}</LoginContext.Provider>
    );
};

const LoginConsumer = LoginContext.Consumer;

export { LoginProvider, LoginConsumer };
export default LoginContext;
