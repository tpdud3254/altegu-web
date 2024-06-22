import React, { createContext, useEffect, useState } from "react";
import { MENUS, SUB_MENUS } from "../utils/menus";
import axios from "axios";
import { SERVER, VALID } from "../constant";

export const LoginContext = createContext({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    adminInfo: null,
    setAdminInfo: () => {},
    permission: {},
});

const LoginProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminInfo, setAdminInfo] = useState(false);
    const [permission, setPermission] = useState({});

    useEffect(() => {
        const getAdminInfo = async () => {
            const token = localStorage.getItem("TOKEN");

            if (token && token.length > 0) {
                try {
                    const response = await axios.post(SERVER + "/admin/token", {
                        token,
                    });

                    console.log(response);

                    const {
                        data: {
                            result,
                            data: { admin },
                        },
                    } = response;

                    if (result === VALID) {
                        setAdminInfo(admin);
                        setIsLoggedIn(true);
                    } else {
                        setIsLoggedIn(false);
                        setAdminInfo(null);
                        setPermission({});
                        localStorage.removeItem("TOKEN");
                    }
                } catch (error) {}
            }
        };

        getAdminInfo();
    }, []);

    useEffect(() => {
        if (adminInfo) {
            savePermission(adminInfo);
        } else {
            setPermission({});
        }
    }, [adminInfo]);

    const savePermission = (admin) => {
        if (admin.id === 1) {
            const adminPermission = {
                menuPermissions: [],
                submenuPermissions: [],
                funtionPermissions: [],
            };

            Object.keys(MENUS).map((menu) => {
                adminPermission.menuPermissions.push(MENUS[menu].id);
                SUB_MENUS[menu].map((submenu) => {
                    adminPermission.submenuPermissions.push(submenu.id);
                    if (submenu.func && submenu.func.length > 0) {
                        submenu.func.map((func) => {
                            adminPermission.funtionPermissions.push(func.id);
                        });
                    }
                });
            });

            setPermission(adminPermission);
        } else {
            if (admin?.permission || admin?.permission?.length > 0)
                setPermission(JSON.parse(admin.permission));
            else
                setPermission({
                    menuPermissions: [],
                    submenuPermissions: [],
                    funtionPermissions: [],
                });
        }
    };

    const value = {
        isLoggedIn,
        setIsLoggedIn,
        adminInfo,
        setAdminInfo,
        permission,
    };

    return (
        <LoginContext.Provider value={value}>{children}</LoginContext.Provider>
    );
};

const LoginConsumer = LoginContext.Consumer;

export { LoginProvider, LoginConsumer };
export default LoginContext;
