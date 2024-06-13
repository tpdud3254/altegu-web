import React, { createContext, useEffect, useState } from "react";

export const LoginContext = createContext({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    userInfo: null,
    setUserInfo: () => {},
});

const LoginProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("TOKEN")) setIsLoggedIn(true);
    }, []);

    const value = { isLoggedIn, setIsLoggedIn, userInfo, setUserInfo };

    return (
        <LoginContext.Provider value={value}>{children}</LoginContext.Provider>
    );
};

const LoginConsumer = LoginContext.Consumer;

export { LoginProvider, LoginConsumer };
export default LoginContext;
