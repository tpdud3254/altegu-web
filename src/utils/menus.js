export const MAIN_MENUS = [
    { name: "Home", route: "/" },
    { name: "회원관리", route: "/member" },
    { name: "작업관리", route: "/order" },
    { name: "스케줄관리", route: "/scehdule" },
    { name: "포인트관리", route: "/points" },
    { name: "매출/정산", route: "/sales" },
    { name: "문의/알림", route: "/noti" },
    { name: "기타관리", route: "/etc" },
];

export const MENU = {
    HOME: "HOME",
    MEMBER: "MEMBER",
    ORDER: "ORDER",
    SCHEDULE: "SCHEDULE",
    SALES: "SALES",
    NOTI: "NOTI",
    ETC: "ETC",
};

export const MENUINFO = {
    HOME: {
        ID: 0,
        TITLE: "대시보드",
        SUB_MENUS: [],
    },
    MEMBER: {
        ID: 1,
        TITLE: "회원관리",
        SUB_MENUS: [
            {
                ID: 0,
                TITLE: "회원정보 검색",
            },
            {
                ID: 1,
                TITLE: "탈퇴회원 관리",
            },
        ],
    },
};
