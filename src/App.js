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
import SearchOrder from "./pages/Order/SearchOrder/SearchOrder";
import WithdrawalList from "./pages/Point/WithdrawalList/WithdrawalList";
import BreakdownList from "./pages/Point/WithdrawalList/BreakdownList";
import Gugupack from "./pages/Price/Gugupack";
import OrderPrice from "./pages/Price/OrderPrice";
import ManageBanner from "./pages/Image/ManageBanner";
import ManagePopup from "./pages/Image/ManagePopup";
import MembershipPrice from "./pages/Price/MembershipPrice";
import RegistOrder from "./pages/Order/RegistOrder/RegistOrder";
import SearchPostpaidOrder from "./pages/Order/SearchPostpaidOrder/SearchPostpaidOrder";
import SubscribeGugupack from "./pages/User/SubscribeGugupack/SubscribeGugupack";
import Commission from "./pages/Price/Commission";

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
                        path={`${MENUS.USER.route}${SUB_MENUS.USER[2].route}`}
                        element={<SubscribeGugupack />}
                    />
                    <Route
                        path={`${MENUS.ORDER.route}${SUB_MENUS.ORDER[0].route}`}
                        element={<SearchOrder />}
                    />
                    <Route
                        path={`${MENUS.ORDER.route}${SUB_MENUS.ORDER[1].route}`}
                        element={<SearchPostpaidOrder />}
                    />
                    <Route
                        path={`${MENUS.ORDER.route}${SUB_MENUS.ORDER[2].route}`}
                        element={<RegistOrder />}
                    />
                    <Route
                        path={`${MENUS.POINT.route}${SUB_MENUS.POINT[0].route}`}
                        element={<WithdrawalList />}
                    />
                    <Route
                        path={`${MENUS.POINT.route}${SUB_MENUS.POINT[1].route}`}
                        element={<BreakdownList />}
                    />
                    <Route
                        path={`${MENUS.PRICE.route}${SUB_MENUS.PRICE[0].route}`}
                        element={<OrderPrice />}
                    />
                    <Route
                        path={`${MENUS.PRICE.route}${SUB_MENUS.PRICE[1].route}`}
                        element={<Gugupack />}
                    />
                    <Route
                        path={`${MENUS.PRICE.route}${SUB_MENUS.PRICE[2].route}`}
                        element={<MembershipPrice />}
                    />
                    <Route
                        path={`${MENUS.PRICE.route}${SUB_MENUS.PRICE[3].route}`}
                        element={<Commission />}
                    />
                    <Route
                        path={`${MENUS.IMAGE.route}${SUB_MENUS.IMAGE[0].route}`}
                        element={<ManageBanner />}
                    />
                    <Route
                        path={`${MENUS.IMAGE.route}${SUB_MENUS.IMAGE[1].route}`}
                        element={<ManagePopup />}
                    />
                </Routes>
            </HelmetProvider>
            {/* <AmplifySignOut /> */}
        </div>
    );
}

export default App;
