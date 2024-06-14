export const SERVER = process.env.REACT_APP_SERVER;
// export const SERVER = "http://localhost:4000";
export const VALID = "VALID";

export const GENDER = { all: null, male: "남", female: "여" };
export const STATUS = {
    all: null,
    normal: "정상",
    block: "이용정지",
    withdrawal: "탈퇴",
};
export const USER_TYPE = {
    all: null,
    company: 3,
    normal: 1,
    driver: 2,
};

export const GUGUPACK_STATUS = {
    all: null,
    member: "회원",
    "non-member": "비회원",
};

export const USER_TYPE_TEXT = {
    normal: "개인",
    driver: "기사",
    company: "기업",
};

export const POINT_STATUS = {
    none: "선택",
    charge: "충전",
    withdrawal: "출금",
    add: "지급",
    subtract: "차감",
};

export const POINT_BRAKEDOWN_TEXT = {
    0: "선택",
    1: "통신비 차감",
    2: "포인트 충전",
    3: "포인트 출금",
    4: "포인트 출금 수수료 차감",
    5: "작업 등록 포인트 적립",
    6: "작업 완료 포인트 적립",
    7: "추천인 포인트 적립",
    8: "직접 입력",
};

export const WORK_CATEGORY = {
    all: null,
    c: 1,
    f: 2,
    e: 3,
    h: 4,
    m: 5,
    g: 6,
};

export const WORK_CATEGORY_TEXT = {
    c: "건설",
    f: "가구",
    e: "가전",
    h: "청소/인력",
    m: "이사",
    g: "기타",
};

export const MEMBERSHIP_STATUS = {
    all: null,
    membership: "정회원",
    normal: "기사회원",
    block: "이용정지",
    withdrawal: "탈퇴",
};

export const ORDER_TYPE = ["작업종류", "사다리차", "스카이차"];
export const ORDER_DIRECTION = ["방향", "내림", "올림", "양사"];
export const ORDER_VOLUME = ["작업량", "시간", "물량"];
export const ORDER_VOLUME_TIME = [
    "시간 선택",
    "간단\n(가구/씽크대/가전)",
    "1시간",
    "2시간",
    "3시간",
    "반나절(4시간)",
    "하루",
];
export const ORDER_VOLUME_QUANTITY = [
    "물량 선택",
    "1톤\n(이삿짐 / 1톤 해당하는 짐)",
    "2.5 - 5톤",
    "6톤",
    "7.5톤",
    "8.5 - 10톤",
];

export const LADDER_FLOOR = [
    [
        "층 수",
        "2층",
        "3층",
        "4층",
        "5층",
        "6층",
        "7층",
        "8층",
        "9층",
        "10층",
        "11층",
        "12층",
        "13층",
        "14층",
        "15층",
        "16층",
        "17층",
        "18층",
        "19층",
        "20층",
        "21층",
        "22층",
        "23층",
        "24층",
        "25층 이상",
    ],
    [
        "층 수",
        "2층",
        "3층",
        "4층",
        "5층",
        "6층",
        "7층",
        "8층",
        "9층",
        "10층",
        "11층",
        "12층",
        "13층",
        "14층",
        "15층",
        "16층",
        "17층",
        "18층",
        "19층",
        "20층",
        "21층",
        "22층",
        "23층",
        "24층",
        "25층",
        "26층 이상",
    ],
];

export const SKY_OPTION = [
    "작업 높이",
    "~22m (1톤)",
    "~25m (2.5톤)",
    "~30m (3.5톤)",
    "~45m (5톤)",
    "~54m (8.5톤)",
    "~58m (17.5톤)",
    "~75m (19.5톤)",
];

export const SKY_TIME = [
    ["작업 시간", "반나절(4시간)", "하루(8시간)", "월임대(협의)"],
    [
        "작업 시간",
        "1시간",
        "2시간",
        "반나절(3시간)",
        "반나절(4시간)",
        "하루(8시간)",
        "월임대(협의)",
    ],
];

export const BANK_LIST = [
    "은행 선택",
    "KB국민은행",
    "신한은행",
    "우리은행",
    "KEB하나은행",
    "SC제일은행",
    "한국씨티은행",
    "케이뱅크은행",
    "카카오뱅크",
    "토스뱅크",
    "NH농협은행",
    "수협은행",
    "기업은행",
    "대구은행",
    "부산은행",
    "경남은행",
    "광주은행",
    "전북은행",
    "제주은행",
    "새마을금고",
    "신협",
    "우체국",
];

export const ADMIN_POSITION = [
    "직책 선택",
    "정회원",
    "멤버십",
    "지사장",
    "본부장",
    "이사",
];

export const TELECOM = [
    "통신사 선택",
    "KT",
    "SKT",
    "LGU+",
    "KT 알뜰폰",
    "SKT 알뜰폰",
    "LGU+ 알뜰폰",
];
