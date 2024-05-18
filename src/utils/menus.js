export const MENU = {
    HOME: "HOME",
    MEMBER: "MEMBER",
    ORDER: "ORDER",
    SCHEDULE: "SCHEDULE",
    SALES: "SALES",
    NOTI: "NOTI",
    ETC: "ETC",
};

export const MENUS = {
    USER: { name: "회원관리", route: "/user" },
    ORDER: { name: "작업관리", route: "/order" },
    POINT: { name: "포인트관리", route: "/point" },
    PRICE: { name: "금액관리", route: "/price" },
    IMAGE: { name: "이미지관리", route: "/image" },
};

export const SUB_MENUS = {
    USER: [
        { name: "회원정보 검색", route: "/search" },
        { name: "정회원 관리", route: "/management" },
        { name: "구구팩 신청 목록", route: "/gugupack" },
    ],
    ORDER: [
        { name: "작업정보 검색", route: "/search" },
        { name: "후불작업 검색", route: "/postpaid" },
        { name: "작업 등록", route: "/regist" },
    ],
    POINT: [
        { name: "출금 신청 목록", route: "/withdraw" },
        { name: "포인트 내역 조회", route: "/breakdown" },
    ],
    PRICE: [
        { name: "요금표 관리", route: "/order" },
        { name: "구구팩 금액 관리", route: "/gugupack" },
        { name: "정회원 금액 관리", route: "/membership" },
    ],
    IMAGE: [
        { name: "배너 관리", route: "/banner" },
        { name: "팝업 관리", route: "/popup" },
    ],
};
