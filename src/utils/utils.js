export const getDateTime = (dateTime) => {
  const newDateTime = new Date(dateTime);

  return `${newDateTime.getFullYear().toString().substring(2, 4)}.${getMonth(
    newDateTime.getMonth()
  )}.${getDate(newDateTime.getDate())} ${getHours(
    newDateTime.getHours()
  )}:${getMin(newDateTime.getMinutes())}`;
};

export const getMonth = (month) =>
  `${month + 1 < 10 ? "0" + (month + 1) : month + 1}`;

export const getDate = (date) => `${date < 10 ? "0" + date : date}`;

export const getHours = (hours) => `${hours < 10 ? "0" + hours : hours}`;

export const getMin = (min) => `${min < 10 ? "0" + min : min}`;

export const getAge = (birth) => {
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

export const getWorkRegion = (regionArr) => {
  let result = "";

  regionArr.map((data, index) => {
    result = result + data.region;
    if (index < regionArr.length - 1) result = result + ", ";
  });

  return result;
};

export const numberWithComma = (cost) =>
  cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
