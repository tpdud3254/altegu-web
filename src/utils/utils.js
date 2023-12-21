const getMonth = (month) => `${month + 1 < 10 ? "0" + (month + 1) : month + 1}`;

const getDate = (date) => `${date < 10 ? "0" + date : date}`;

const getHours = (hours) => `${hours < 10 ? "0" + hours : hours}`;

const getMin = (min) => `${min < 10 ? "0" + min : min}`;

export const GetDateTime = (dateTime) => {
    const newDateTime = new Date(dateTime);

    const kr_datetime = newDateTime.setHours(newDateTime.getHours() - 9);

    const result = new Date(kr_datetime);

    return `${result.getFullYear().toString().substring(2, 4)}.${getMonth(
        result.getMonth()
    )}.${getDate(result.getDate())} ${getHours(result.getHours())}:${getMin(
        result.getMinutes()
    )}`;
};

export const GetCurrentDateTime = () => {
    const curr = new Date();

    const kr_curr = curr.setHours(curr.getHours() + 9);

    const result = new Date(kr_curr);

    return result;
};

export const GetDate = (dateTime) => {
    const newDateTime = new Date(dateTime);

    return `${newDateTime.getFullYear().toString().substring(2, 4)}.${getMonth(
        newDateTime.getMonth()
    )}.${getDate(newDateTime.getDate())}`;
};

export const GetAge = (birth) => {
    const today = new Date();
    const year = birth.substring(0, 4);
    const month = birth.substring(4, 6);
    const date = birth.substring(6, 8);

    const birthDate = new Date(year, month, date); // 2000년 8월 10일

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

export const GetWorkRegion = (regionArr) => {
    let result = "";

    regionArr.map((data, index) => {
        result = result + data.region;
        if (index < regionArr.length - 1) result = result + ", ";
    });

    return result;
};

export const NumberWithComma = (cost) =>
    cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const GetUserType = (id) =>
    id === 1 ? "개인" : id === 2 ? "기사" : "기업";

export const Reset = (e) => {
    e.preventDefault();
    window.location.reload();
};

export const Reload = () => {
    window.location.reload();
};

export const GetPhoneNumberWithDash = (phone) => {
    if (!phone) {
        return "";
    }
    return `${phone.substring(0, 3)}-${phone.substring(3, 7)}-${phone.substring(
        7,
        phone.length
    )}`;
};

export const CheckPassword = (password) => {
    const regExp = /^.*(?=^.{8,}$)(?=.*\d)(?=.*[a-zA-Z]).*$/;

    if (!password.match(regExp)) {
        return false;
    } else {
        return true;
    }
};
