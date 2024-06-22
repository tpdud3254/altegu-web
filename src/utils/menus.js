import ManageAdmin from "../pages/Admin/ManageAdmin/ManageAdmin";
import ManageBanner from "../pages/Image/ManageBanner";
import ManagePopup from "../pages/Image/ManagePopup";
import RegistOrder from "../pages/Order/RegistOrder/RegistOrder";
import SearchOrder from "../pages/Order/SearchOrder/SearchOrder";
import SearchPostpaidOrder from "../pages/Order/SearchPostpaidOrder/SearchPostpaidOrder";
import BreakdownList from "../pages/Point/WithdrawalList/BreakdownList";
import WithdrawalList from "../pages/Point/WithdrawalList/WithdrawalList";
import Commission from "../pages/Price/Commission";
import Gugupack from "../pages/Price/Gugupack";
import MembershipPrice from "../pages/Price/MembershipPrice";
import OrderPrice from "../pages/Price/OrderPrice";
import ManageMembership from "../pages/User/ManageMembership/ManageMembership";
import SearchUser from "../pages/User/SearchUser/SearchUser";
import SubscribeGugupack from "../pages/User/SubscribeGugupack/SubscribeGugupack";

export const MENUS = {
    USER: { id: "user", name: "회원관리", route: "/user" },
    ORDER: { id: "order", name: "작업관리", route: "/order" },
    POINT: { id: "point", name: "포인트관리", route: "/point" },
    PRICE: { id: "price", name: "금액관리", route: "/price" },
    IMAGE: { id: "image", name: "이미지관리", route: "/image" },
    MANAGE: { id: "manage", name: "관리자관리", route: "/manage" },
};

export const SUB_MENUS = {
    USER: [
        {
            id: "user_search",
            name: "회원정보 검색",
            route: "/search",
            element: <SearchUser />,
            func: [
                {
                    id: "modify_point",
                    name: "포인트 수정",
                },
                {
                    id: "modify_recommend",
                    name: "추천인 수정",
                },
            ],
        },
        {
            id: "user_management",
            name: "정회원 관리",
            route: "/management",
            element: <ManageMembership />,
        },
        {
            id: "user_gugupack",
            name: "구구팩 신청 목록",
            route: "/gugupack",
            element: <SubscribeGugupack />,
        },
    ],
    ORDER: [
        {
            id: "order_search",
            name: "작업정보 검색",
            route: "/search",
            element: <SearchOrder />,
        },
        {
            id: "order_postpaid",
            name: "후불작업 검색",
            route: "/postpaid",
            element: <SearchPostpaidOrder />,
        },
        {
            id: "order_regist",
            name: "작업 등록",
            route: "/regist",
            element: <RegistOrder />,
            func: [
                {
                    id: "modify_price",
                    name: "작업 금액 수정",
                },
                {
                    id: "modify_push",
                    name: "푸시알림",
                },
            ],
        },
    ],
    POINT: [
        {
            id: "point_withdraw",
            name: "출금 신청 목록",
            route: "/withdraw",
            element: <WithdrawalList />,
        },
        {
            id: "point_breakdown",
            name: "포인트 내역 조회",
            route: "/breakdown",
            element: <BreakdownList />,
        },
    ],
    PRICE: [
        {
            id: "price_order",
            name: "요금표 관리",
            route: "/order",
            element: <OrderPrice />,
        },
        {
            id: "price_gugupack",
            name: "구구팩 금액 관리",
            route: "/gugupack",
            element: <Gugupack />,
        },
        {
            id: "price_membership",
            name: "정회원 금액 관리",
            route: "/membership",
            element: <MembershipPrice />,
        },
        {
            id: "price_commission",
            name: "수수료 관리",
            route: "/commission",
            element: <Commission />,
        },
    ],
    IMAGE: [
        {
            id: "image_banner",
            name: "배너 관리",
            route: "/banner",
            element: <ManageBanner />,
        },
        {
            id: "image_popup",
            name: "팝업 관리",
            route: "/popup",
            element: <ManagePopup />,
        },
    ],
    MANAGE: [
        {
            id: "manage_manager",
            name: " 관리자 관리",
            route: "/manager",
            element: <ManageAdmin />,
        },
    ],
};
