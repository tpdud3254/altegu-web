import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import MainLayout from "../../../components/Layout/MainLayout";
import PageTitle from "../../../components/PageTitle";
import MainContentLayout from "../../../components/Layout/MainContentLayout";
import { Blank } from "../../../components/Blank";
import axios from "axios";
import { ORDER_DIRECTION, ORDER_TYPE, SERVER, VALID } from "../../../constant";
import {
    CheckValidation,
    GetCalendarDateText,
    GetKrDateTime,
    Reload,
} from "../../../utils/utils";
import { Calendar as ReactCalendar } from "react-calendar";
import "../../../components/Calendar/calendarStyle.css";
import moment from "moment";
import { useDaumPostcodePopup } from "react-daum-postcode";
import LoginContext from "../../../contexts/LoginContext";

const Container = styled.div`
    width: 100%;
    border: 1px solid grey;
    padding-top: 20px;
    padding-bottom: 20px;
    padding-left: 20px;
`;

const Item = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 15px;
`;
const ItemTitle = styled.div`
    margin-right: 10px;
`;
const ItemContent = styled.div`
    display: flex;
    align-items: center;
`;

const CalendarComponent = styled.div`
    background-color: white;
    position: absolute;
    border: 1px black solid;
    padding-top: 10px;
`;

const PAYMENT_TYPE = ["선불", "후불 (현장)", "후불 (지정일)"];
const VOLUME = ["물량", "시간"];

function RegistOrder() {
    const location = useLocation();
    const { permission } = useContext(LoginContext);
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const openDaumPostcodePopup = useDaumPostcodePopup();

    const [loading, setLoading] = useState(true);

    const [ladderQuantityOptions, setLadderQuantityOptions] = useState([]);
    const [ladderQuantityFloor, setLadderQuantityFloor] = useState([]);
    const [ladderQuantityTable, setLadderQuantityTable] = useState([]);

    const [ladderTimeOptions, setLadderTimeOptions] = useState([[]]);
    const [ladderTimeFloor, setLadderTimeFloor] = useState([]);
    const [ladderTimeTable, setLadderTimeTable] = useState([]);

    const [skyTimeOptions, setSkyTimeOptions] = useState([]);
    const [skyTimeWeight, setSkyTimeWeight] = useState([]);
    const [skyTimeTable, setSkyTimeTable] = useState([]);

    const [consultation, setConsultation] = useState(false);

    const [showPaymentCalendar, setShowPaymentCalendar] = useState(false);
    const [showDateTimeCalendar, setShowDateTimeCalendar] = useState(false);

    const [selectAddress1, setSelectAddress1] = useState({});
    const [selectAddress2, setSelectAddress2] = useState({});

    useEffect(() => {
        getAllPrice();
        // getGugupackPrice();

        register("originalPaymentDate");
        register("originalDateTimeDate");
        register("userId");
        register("name");
        register("phone");
        register("isGugupackUser");
        register("gugupackPrice");
        register("isDesignation");
        register("driverId");
        register("driverName");
    }, []);

    useEffect(() => {
        if (
            ladderQuantityTable.length > 0 &&
            ladderQuantityOptions.length > 0 &&
            ladderTimeTable.length > 0 &&
            ladderTimeOptions.length > 0 &&
            skyTimeTable.length > 0 &&
            skyTimeOptions.length > 0 &&
            skyTimeWeight.length > 0
        )
            setLoading(false);
        else setLoading(true);
    }, [
        ladderQuantityTable,
        ladderQuantityOptions,
        ladderTimeTable,
        ladderTimeOptions,
        skyTimeTable,
        skyTimeOptions,
        skyTimeWeight,
    ]);

    useEffect(() => {
        const vehicleType = Number(getValues("vehicleType", "1")) || null;
        const direction = Number(getValues("direction")) || null;
        const floor = Number(getValues("floor")) || null;
        const downFloor = Number(getValues("downFloor")) || null;
        const upFloor = Number(getValues("upFloor")) || null;
        const volume = Number(getValues("volume")) || null;
        const quantity = Number(getValues("volumeQuantity")) || null;
        const time = Number(getValues("volumeTime")) || null;

        //유효성 검사
        const check = {
            vehicleType,
            ...(vehicleType === 1 && {
                direction,
                ...((direction === 1 || direction === 2) && { floor }),
                ...(direction === 3 && { downFloor, upFloor }),
                volume,
                ...(volume === 1 && { quantity }),
                ...(volume === 2 && { time }),
            }),
            ...(vehicleType === 2 && { floor, time }),
        };

        if (CheckValidation(check)) {
            //금액 책정
            let calc = 0;
            setConsultation(false);

            if (vehicleType === 1) {
                if (direction === 1 || direction === 2) {
                    let ladderPrice = 0;

                    if (volume === 1)
                        ladderPrice =
                            ladderQuantityTable[quantity - 1][floor - 1];
                    else ladderPrice = ladderTimeTable[time - 1][floor - 1];

                    if (ladderPrice === 0) setConsultation(true);
                    else calc = calc + ladderPrice;
                } else if (direction === 3) {
                    let ladderPrice1 = 0;

                    if (volume === 1)
                        ladderPrice1 =
                            ladderQuantityTable[quantity - 1][downFloor - 1];
                    else
                        ladderPrice1 = ladderTimeTable[time - 1][downFloor - 1];

                    if (ladderPrice1 === 0) setConsultation(true);
                    else calc = calc + ladderPrice1;

                    let ladderPrice2 = 0;

                    if (volume === 1)
                        ladderPrice2 =
                            ladderQuantityTable[quantity - 1][upFloor - 1];
                    else ladderPrice2 = ladderTimeTable[time - 1][upFloor - 1];

                    if (ladderPrice2 === 0) setConsultation(true);
                    else calc = calc + ladderPrice2;
                }
            } else if (vehicleType === 2) {
                let skyPrice = 0;

                if (floor <= 5) skyPrice = skyTimeTable[time - 1][floor - 1];
                else skyPrice = skyTimeTable[time + 2][floor - 1];

                if (skyPrice === 0) setConsultation(true);
                else calc = calc + skyPrice;
            }

            setValue("price", calc);
        } else {
            setValue("price", "0");
        }
    }, [
        watch("vehicleType"),
        watch("direction"),
        watch("floor"),
        watch("downFloor"),
        watch("upFloor"),
        watch("volume"),
        watch("volumeQuantity"),
        watch("volumeTime"),
        loading,
    ]);

    useEffect(() => {
        setValue("isDesignation", false);
        setValue("driver", null);
        setValue("driverId", null);
        setValue("driverName", null);
    }, [watch("vehicleType")]);

    const getAllPrice = async () => {
        try {
            const response = await axios.get(SERVER + "/admin/price/order", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
                params: {
                    type: "all",
                },
            });
            const {
                data: {
                    result,
                    data: { priceTable },
                },
            } = response;

            if (result === VALID) {
                saveLadderQuantityTable(
                    priceTable.ladderQuantity.options,
                    priceTable.ladderQuantity.datas
                );
                saveLadderTimeTable(
                    priceTable.ladderTime.options,
                    priceTable.ladderTime.datas
                );
                saveSkyTimeTable(
                    priceTable.skyTime.options,
                    priceTable.skyTime.weight,
                    priceTable.skyTime.datas
                );
            } else {
                console.log("getAllPrice invalid");
            }
        } catch (error) {
            console.log("getAllPrice error : ", error);
        }
    };

    const saveLadderQuantityTable = (options, data) => {
        const newArr = [];
        const optionsArr = [];
        const floorArr = [];

        options.map((value) => {
            optionsArr.push(value.title);
        });

        let curOptionIndex = 1;
        let arr = [];

        data.map((value, index) => {
            if (value.optionId > curOptionIndex) {
                newArr.push(arr);
                curOptionIndex = curOptionIndex + 1;
                arr = [];
            } else if (
                value.optionId === optionsArr.length &&
                curOptionIndex === optionsArr.length &&
                index === data.length - 1
            ) {
                newArr.push(arr);
            }
            arr.push(value.price);
        });

        const resultArr = [];

        for (let x = 0; x < optionsArr.length; x++) {
            resultArr[x] = [];
            for (let y = 0; y < newArr[0].length; y++) {
                resultArr[x].push(newArr[x][y]);
                if (x === 0)
                    floorArr.push(
                        y +
                            2 +
                            "층" +
                            (y === newArr[0].length - 1 ? " 이상" : "")
                    );
            }
        }

        setLadderQuantityOptions(optionsArr);
        setLadderQuantityFloor(floorArr);
        setLadderQuantityTable(resultArr);
    };

    const saveLadderTimeTable = (options, data) => {
        const newArr = [];
        const optionsArr = [];
        const floorArr = [];

        options.map((value) => {
            optionsArr.push(value.title);
        });

        let curOptionIndex = 1;
        let arr = [];

        data.map((value, index) => {
            if (value.optionId > curOptionIndex) {
                newArr.push(arr);
                curOptionIndex = curOptionIndex + 1;
                arr = [];
            } else if (
                value.optionId === optionsArr.length &&
                curOptionIndex === optionsArr.length &&
                index === data.length - 1
            ) {
                newArr.push(arr);
            }
            arr.push(value.price);
        });

        const resultArr = [];
        for (let x = 0; x < optionsArr.length; x++) {
            resultArr[x] = [];
            for (let y = 0; y < newArr[0].length; y++) {
                resultArr[x].push(newArr[x][y]);
                if (x === 0)
                    floorArr.push(
                        y +
                            2 +
                            "층" +
                            (y === newArr[0].length - 1 ? " 이상" : "")
                    );
            }
        }

        setLadderTimeOptions(optionsArr);
        setLadderTimeFloor(floorArr);
        setLadderTimeTable(resultArr);
    };

    const saveSkyTimeTable = (options, weight, data) => {
        const newArr = [];
        const optionsArr = [];
        const weightArr = [];

        options.map((value) => {
            optionsArr.push(value.title);
        });

        weight.map((value) => {
            weightArr.push(value.weightTitle);
        });

        let curOptionIndex = 1;
        let arr = [];

        data.map((value, index) => {
            if (value.optionId > curOptionIndex) {
                newArr.push(arr);
                curOptionIndex = curOptionIndex + 1;
                arr = [];
            } else if (
                value.optionId === optionsArr.length &&
                curOptionIndex === optionsArr.length &&
                index === data.length - 1
            ) {
                newArr.push(arr);
            }
            arr.push(value.price);
        });

        const resultArr = [];
        for (let x = 0; x < optionsArr.length; x++) {
            resultArr[x] = [];
            for (let y = 0; y < newArr[0].length; y++) {
                resultArr[x].push(newArr[x][y]);
            }
        }

        setSkyTimeOptions([optionsArr.slice(3, optionsArr.length), optionsArr]);
        setSkyTimeWeight(weightArr);
        setSkyTimeTable(resultArr);
    };

    const check = (value) => (value && value.length > 0 ? true : false);

    const Calendar = ({ value }) => {
        const onChange = (data) => {
            console.log("selected date : ", data);
            const now = new Date();

            now.setDate(now.getDate() - 1);

            console.log(now);
            if (value === "paymentDate") {
                if (now >= data) {
                    alert("현재 날짜 이후의 날짜를 골라주세요.");
                    return;
                }
                setValue("originalPaymentDate", data);
                setShowPaymentCalendar(false);
            } else if (value === "dateTime") {
                if (now >= data) {
                    alert("현재 날짜 이후의 날짜를 골라주세요.");
                    return;
                }
                setValue("originalDateTimeDate", data);
                setShowDateTimeCalendar(false);
            }

            setValue(value, GetCalendarDateText(data));
        };

        return (
            <CalendarComponent>
                <ReactCalendar
                    calendarType="US"
                    onChange={onChange}
                    value={getValues(
                        value === "paymentDate"
                            ? "originalPaymentDate"
                            : value === "dateTime"
                            ? "originalDateTimeDate"
                            : ""
                    )}
                    showNeighboringMonth={true}
                    formatDay={(locale, date) => moment(date).format("DD")}
                    tileContent={({ date, view }) => {
                        let html = [];

                        return (
                            <div key={date} className="contents">
                                {html}
                            </div>
                        );
                    }}
                />
            </CalendarComponent>
        );
    };

    const openAddressPopup = (index) => {
        openDaumPostcodePopup({
            onComplete: (data) =>
                onSelectAddress({ addressIndex: index, ...data }),
        });
    };

    const onSelectAddress = (data) => {
        console.log("address result", data);
        const { addressIndex, address, sido, sigungu } = data;

        if (addressIndex === 1) {
            setValue("address1", address);
            setSelectAddress1({ address, sido, sigungu });
        } else {
            setValue("address2", address);
            setSelectAddress2({ address, sido, sigungu });
        }
    };

    const getUser = async (_, value = null) => {
        let phone = "";

        if (value === "driver") phone = getValues("driver");
        else phone = getValues("registUser");

        if (!check(phone)) {
            alert("올바른 휴대폰 번호를 입력해주세요.");
            return;
        }
        try {
            const response = await axios.get(SERVER + "/admin/user/phone", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
                params: { phone },
            });

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                const {
                    data: {
                        data: { user },
                    },
                } = response;

                if (value === "driver") {
                    if (user.userTypeId === 2) {
                        if (!user.vehicle || user.vehicle.length === 0) {
                            alert("유저를 찾지 못했습니다.");
                            setValue("isDesignation", false);
                            setValue("driverId", null);
                            setValue("driverName", null);
                        }

                        if (
                            Number(getValues("vehicleType")) ===
                            user.vehicle[0].type.id
                        ) {
                            setValue("isDesignation", true);
                            setValue("driverId", user.id);
                            setValue("driverName", user.name);
                        } else {
                            alert("유저를 찾지 못했습니다.");
                            setValue("isDesignation", false);
                            setValue("driverId", null);
                            setValue("driverName", null);
                        }
                    } else {
                        setValue("isDesignation", false);
                        setValue("driverId", null);
                        setValue("driverName", null);
                    }
                } else {
                    setValue("userId", user.id);
                    setValue("name", user.name);
                    setValue("phone", user.phone);
                    setValue("isGugupackUser", user.gugupack || false);
                    if (user.gugupack) await getGugupackPrice();
                    else setValue("gugupackPrice", 0);
                }
            } else {
                const {
                    data: { msg },
                } = response;

                console.log("getUser invalid");
                alert("유저를 찾지 못했습니다.");
                return;
            }
        } catch (error) {
            console.log("getUser error : ", error);
            alert("유저를 찾지 못했습니다.");
            return;
        }
    };

    const getGugupackPrice = async () => {
        axios
            .get(SERVER + "/users/gugupack/price")
            .then(({ data }) => {
                const {
                    result,
                    data: { price },
                } = data;
                console.log("getGugupackPrice: ", price.gugupackPrice);
                if (
                    getValues("vehicleType") === "1" &&
                    getValues("volume") === "2" &&
                    getValues("volumeTime") === "1" &&
                    (getValues("floor") === "1" ||
                        getValues("floor") === "2" ||
                        getValues("floor") === "3" ||
                        getValues("floor") === "4")
                )
                    setValue("gugupackPrice", 10000);
                else setValue("gugupackPrice", price.gugupackPrice);
            })
            .catch((error) => {
                // showError(error);
            });
    };

    const getRegion = (sido, sigungu) => {
        if (sido.includes("서울")) return 1;
        else if (sido.includes("인천")) return 2;
        else if (sido.includes("경기")) {
            if (
                sigungu.includes("김포") ||
                sigungu.includes("부천") ||
                sigungu.includes("파주") ||
                sigungu.includes("고양") ||
                sigungu.includes("동두천") ||
                sigungu.includes("연천")
            )
                return 3;
            else if (
                sigungu.includes("의정부") ||
                sigungu.includes("양주") ||
                sigungu.includes("구리") ||
                sigungu.includes("남양주") ||
                sigungu.includes("포천") ||
                sigungu.includes("가평")
            )
                return 4;
            else if (
                sigungu.includes("광명") ||
                sigungu.includes("시흥") ||
                sigungu.includes("안산") ||
                sigungu.includes("안양") ||
                sigungu.includes("과천") ||
                sigungu.includes("의왕") ||
                sigungu.includes("군포") ||
                sigungu.includes("수원") ||
                sigungu.includes("오산") ||
                sigungu.includes("화성") ||
                sigungu.includes("평택")
            )
                return 5;
            else if (
                sigungu.includes("성남") ||
                sigungu.includes("하남") ||
                sigungu.includes("광주") ||
                sigungu.includes("용인") ||
                sigungu.includes("안성") ||
                sigungu.includes("이천") ||
                sigungu.includes("여주") ||
                sigungu.includes("양평")
            )
                return 6;
        }

        return 7;
    };

    const onValid = async (data) => {
        console.log(data);

        const {
            address1,
            address2,
            detailAddress1,
            detailAddress2,
            directPhone,
            direction: directionText,
            downFloor: downFloorText,
            driver,
            floor: floorText,
            memo,
            orderHours: orderHoursText,
            orderMin: orderMinText,
            originalDateTimeDate,
            originalPaymentDate,
            paymentDate,
            paymentType: paymentTypeText,
            price: priceText,
            gugupackPrice: gugupackPriceText,
            registUser,
            upFloor: upFloorText,
            vehicleType: vehicleTypeText,
            volume: volumeText,
            volumeTime: volumeTimeText,
            volumeQuantity: volumeQuantityText,
            userId,
            name,
            phone,
            isDesignation,
            driverId,
            push,
        } = data;

        const direction = Number(directionText);
        const downFloor = Number(downFloorText);
        const floor = Number(floorText);
        const orderHours = Number(orderHoursText);
        const orderMin = Number(orderMinText);
        const paymentType = Number(paymentTypeText);
        const price = Number(priceText);
        const gugupackPrice = Number(gugupackPriceText);
        const upFloor = Number(upFloorText);
        const vehicleType = Number(vehicleTypeText);
        const volume = Number(volumeText);
        const volumeTime = Number(volumeTimeText);
        const volumeQuantity = Number(volumeQuantityText);

        if (paymentType === 2 && (!originalPaymentDate || !paymentDate)) {
            alert("후불 지정일을 선택해 주세요.");
            return;
        }

        if (!userId || !check(name) || !check(phone)) {
            alert("작업 요청자를 선택해 주세요.");
            return;
        }

        if (
            !originalDateTimeDate ||
            !check(orderHoursText) ||
            !check(orderMinText)
        ) {
            alert("작업 날짜 or 시간을 선택해 주세요.");
            return;
        }

        if (
            orderHours.length > 2 ||
            orderMin.length > 2 ||
            orderHours < 0 ||
            orderHours > 23 ||
            orderMin < 0 ||
            orderMin > 59
        ) {
            alert("올바른 작업 시간을 입력해 주세요.");
            return;
        }

        if (
            !check(address1) ||
            !check(detailAddress1) ||
            (direction === 3 && (!check(address2) || !check(detailAddress2)))
        ) {
            alert("작업 주소를 입력해 주세요.");
            return;
        }

        const orderDatetime = GetKrDateTime(originalDateTimeDate);

        orderDatetime.setUTCHours(orderHours);
        orderDatetime.setUTCMinutes(orderMin);

        const regionId = getRegion(selectAddress1.sido, selectAddress1.sigungu);

        let latitude = null;
        let longitude = null;

        try {
            const res = await axios.get(
                `https://dapi.kakao.com/v2/local/search/address.json?query=${selectAddress1.address}`,
                {
                    headers: {
                        Authorization:
                            "KakaoAK 86e0df46fbae745bb4c658276b280088",
                    },
                }
            );

            const {
                data: { documents },
            } = res;

            console.log("kakao map response : ", documents);

            latitude = documents[0].y;
            longitude = documents[0].x;
        } catch (error) {
            console.log(error);
            return;
        }

        const emergencyPrice = 0;
        const usePoint = 0;
        const orderPrice = price + emergencyPrice - gugupackPrice;
        const totalPrice = orderPrice - usePoint;
        const tax = paymentType !== 0 ? 0 : orderPrice * 0.1;
        const finalPrice = totalPrice + tax;

        const sendData = {
            paymentType,
            paymentDate:
                paymentType === 1
                    ? orderDatetime
                    : paymentType === 2
                    ? originalPaymentDate
                    : null,
            registUser: userId,
            phone: phone,
            vehicleType: ORDER_TYPE[vehicleType],
            ...(vehicleType === 1 && {
                direction: ORDER_DIRECTION[direction],
                ...((direction === 1 || direction === 2) && {
                    floor:
                        volume === 1
                            ? ladderQuantityFloor[floor - 1]
                            : ladderTimeFloor[floor - 1],
                }),
                ...(direction === 3 && {
                    downFloor:
                        volume === 1
                            ? ladderQuantityFloor[downFloor - 1]
                            : ladderTimeFloor[downFloor - 1],
                    upFloor:
                        volume === 1
                            ? ladderQuantityFloor[upFloor - 1]
                            : ladderTimeFloor[upFloor - 1],
                }),
                volume: VOLUME[volume - 1],
                ...(volume === 1 && {
                    quantity: ladderQuantityOptions[volumeQuantity - 1],
                }),
                ...(volume === 2 && {
                    time: ladderTimeOptions[volumeTime - 1],
                }),
            }),
            ...(vehicleType === 2 && {
                floor: skyTimeWeight[floor - 1],
                volume: VOLUME[1],
                time:
                    floor >= 6
                        ? skyTimeOptions[0][volumeTime - 1]
                        : skyTimeOptions[1][volumeTime - 1],
            }),
            dateTime: orderDatetime,
            address1: address1,
            address2: direction === 3 ? address2 : null,
            detailAddress1: detailAddress1,
            detailAddress2: direction === 3 ? detailAddress2 : null,
            simpleAddress1: selectAddress1.sido + " " + selectAddress1.sigungu,
            simpleAddress2:
                direction === 3
                    ? selectAddress2.sido + " " + selectAddress2.sigungu
                    : null,
            region: regionId,
            latitude,
            longitude,
            phone,
            directPhone: check(directPhone) ? directPhone : null,
            emergency: false,
            memo: check(memo) ? memo : null,
            isDesignation: isDesignation || false,
            driverId: isDesignation ? driverId : null,
            price,
            emergencyPrice,
            usePoint,
            orderPrice,
            totalPrice,
            tax,
            finalPrice,
            gugupackPrice,
            method: "admin_order",
            emergency: false,
            push,
        };

        console.log("sendData : ", sendData);

        try {
            const response = await axios.post(
                SERVER + "/admin/upload/work",
                {
                    direction: null,
                    floor: null,
                    volume: null,
                    downFloor: null,
                    upFloor: null,
                    quantity: null,
                    time: null,
                    ...sendData,
                },
                {
                    headers: {
                        "ngrok-skip-browser-warning": true,
                    },
                }
            );

            console.log(response);

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                const {
                    data: {
                        data: { order },
                    },
                } = response;

                alert("작업등록에 성공하였습니다.");
                Reload();

                return;
            } else {
                alert("작업등록에 실패하였습니다.");
            }
        } catch (error) {
            console.log("error : ", error);
            alert("작업등록에 실패하였습니다.");
        }
    };

    const resetRegistUser = () => {
        setValue("userId", null);
        setValue("name", null);
        setValue("phone", null);
    };

    const resetDriver = () => {
        setValue("isDesignation", false);
        setValue("driverId", null);
        setValue("driverName", null);
    };
    return (
        <>
            {!loading ? (
                <MainLayout path={location.pathname}>
                    <PageTitle title="작업 관리" />
                    <MainContentLayout show>
                        <form onSubmit={handleSubmit(onValid)}>
                            <>
                                <Container>
                                    <Item>
                                        {PAYMENT_TYPE.map((value, index) => (
                                            <React.Fragment key={index}>
                                                <input
                                                    type="radio"
                                                    name="paymentType"
                                                    value={index}
                                                    {...register(
                                                        "paymentType",
                                                        {
                                                            value: "0",
                                                        }
                                                    )}
                                                    defaultChecked={
                                                        index === 0
                                                            ? true
                                                            : false
                                                    }
                                                />
                                                {value}
                                                <Blank />
                                            </React.Fragment>
                                        ))}
                                    </Item>
                                    {watch("paymentType") === "2" ? (
                                        <Item>
                                            <ItemTitle>후불 지정일</ItemTitle>
                                            <ItemContent>
                                                <input
                                                    disabled
                                                    {...register("paymentDate")}
                                                />
                                                <Blank />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setShowPaymentCalendar(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    달력
                                                </button>
                                                {showPaymentCalendar ? (
                                                    <Calendar value="paymentDate" />
                                                ) : null}
                                            </ItemContent>
                                        </Item>
                                    ) : null}

                                    <Item>
                                        <ItemTitle>작업 요청자</ItemTitle>
                                        <ItemContent>
                                            <input
                                                type="number"
                                                {...register("registUser")}
                                                placeholder="휴대폰 번호 입력 (숫자만)"
                                                onChange={resetRegistUser}
                                            />
                                            <Blank />
                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    getUser(e, "registUser")
                                                }
                                            >
                                                검색
                                            </button>
                                            <Blank />
                                            <Blank />
                                            선택 회원 :{" "}
                                            {watch("userId")
                                                ? watch("name")
                                                : "없음"}
                                        </ItemContent>
                                    </Item>
                                    <Item>
                                        <ItemTitle>작업 종류</ItemTitle>
                                        <ItemContent>
                                            {ORDER_TYPE.map((type, index) => {
                                                if (index === 0) return null;
                                                return (
                                                    <React.Fragment key={index}>
                                                        <input
                                                            type="radio"
                                                            name="vehicleType"
                                                            value={index}
                                                            {...register(
                                                                "vehicleType",
                                                                {
                                                                    value: "1",
                                                                }
                                                            )}
                                                            defaultChecked={
                                                                index === 0
                                                                    ? true
                                                                    : false
                                                            }
                                                        />
                                                        {ORDER_TYPE[index]}
                                                        <Blank />
                                                    </React.Fragment>
                                                );
                                            })}
                                        </ItemContent>
                                    </Item>
                                    {watch("vehicleType", "1") === "1" ? (
                                        <>
                                            <Item>
                                                <ItemTitle>작업 형태</ItemTitle>
                                                <ItemContent>
                                                    {ORDER_DIRECTION.map(
                                                        (value, index) => {
                                                            if (index === 0)
                                                                return null;
                                                            return (
                                                                <React.Fragment
                                                                    key={index}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name="direction"
                                                                        value={
                                                                            index
                                                                        }
                                                                        {...register(
                                                                            "direction",
                                                                            {
                                                                                value: "1",
                                                                            }
                                                                        )}
                                                                        defaultChecked={
                                                                            index ===
                                                                            0
                                                                                ? true
                                                                                : false
                                                                        }
                                                                    />
                                                                    {
                                                                        ORDER_DIRECTION[
                                                                            index
                                                                        ]
                                                                    }
                                                                    <Blank />
                                                                </React.Fragment>
                                                            );
                                                        }
                                                    )}
                                                </ItemContent>
                                            </Item>
                                            <Item>
                                                <ItemTitle>물량/시간</ItemTitle>
                                                <ItemContent>
                                                    <select
                                                        name="volume"
                                                        {...register("volume", {
                                                            value: "1",
                                                        })}
                                                    >
                                                        {VOLUME.map(
                                                            (value, index) => {
                                                                return (
                                                                    <option
                                                                        value={
                                                                            index +
                                                                            1
                                                                        }
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {
                                                                            VOLUME[
                                                                                index
                                                                            ]
                                                                        }
                                                                    </option>
                                                                );
                                                            }
                                                        )}
                                                    </select>
                                                    <Blank />
                                                    {watch("volume", "1") ===
                                                    "1" ? (
                                                        <select
                                                            name="volumeQuantity"
                                                            {...register(
                                                                "volumeQuantity",
                                                                {
                                                                    value: "1",
                                                                }
                                                            )}
                                                        >
                                                            {ladderQuantityOptions.map(
                                                                (
                                                                    value,
                                                                    index
                                                                ) => (
                                                                    <option
                                                                        value={
                                                                            index +
                                                                            1
                                                                        }
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {value}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    ) : null}
                                                    {watch("volume") === "2" ? (
                                                        <select
                                                            name="volumeTime"
                                                            {...register(
                                                                "volumeTime",
                                                                {
                                                                    value: "1",
                                                                }
                                                            )}
                                                        >
                                                            {ladderTimeOptions.map(
                                                                (
                                                                    value,
                                                                    index
                                                                ) => (
                                                                    <option
                                                                        value={
                                                                            index +
                                                                            1
                                                                        }
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {value}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    ) : null}
                                                </ItemContent>
                                            </Item>
                                            {watch("direction", "1") !== "3" ? (
                                                <Item>
                                                    <ItemTitle>
                                                        작업 높이
                                                    </ItemTitle>
                                                    <ItemContent>
                                                        <select
                                                            name="floor"
                                                            {...register(
                                                                "floor",
                                                                {
                                                                    value: "1",
                                                                }
                                                            )}
                                                        >
                                                            {watch(
                                                                "volume",
                                                                "1"
                                                            ) === "1"
                                                                ? ladderQuantityFloor.map(
                                                                      (
                                                                          value,
                                                                          index
                                                                      ) => (
                                                                          <option
                                                                              value={
                                                                                  index +
                                                                                  1
                                                                              }
                                                                              key={
                                                                                  index
                                                                              }
                                                                          >
                                                                              {
                                                                                  value
                                                                              }
                                                                          </option>
                                                                      )
                                                                  )
                                                                : ladderTimeFloor.map(
                                                                      (
                                                                          value,
                                                                          index
                                                                      ) => (
                                                                          <option
                                                                              value={
                                                                                  index +
                                                                                  1
                                                                              }
                                                                              key={
                                                                                  index
                                                                              }
                                                                          >
                                                                              {
                                                                                  value
                                                                              }
                                                                          </option>
                                                                      )
                                                                  )}
                                                        </select>
                                                    </ItemContent>
                                                </Item>
                                            ) : (
                                                <>
                                                    <Item>
                                                        <ItemTitle>
                                                            내림 높이
                                                        </ItemTitle>
                                                        <ItemContent>
                                                            <select
                                                                name="downFloor"
                                                                {...register(
                                                                    "downFloor",
                                                                    {
                                                                        value: "1",
                                                                    }
                                                                )}
                                                            >
                                                                {watch(
                                                                    "volume",
                                                                    "1"
                                                                ) === "1"
                                                                    ? ladderQuantityFloor.map(
                                                                          (
                                                                              value,
                                                                              index
                                                                          ) => (
                                                                              <option
                                                                                  value={
                                                                                      index +
                                                                                      1
                                                                                  }
                                                                                  key={
                                                                                      index
                                                                                  }
                                                                              >
                                                                                  {
                                                                                      value
                                                                                  }
                                                                              </option>
                                                                          )
                                                                      )
                                                                    : ladderTimeFloor.map(
                                                                          (
                                                                              value,
                                                                              index
                                                                          ) => (
                                                                              <option
                                                                                  value={
                                                                                      index +
                                                                                      1
                                                                                  }
                                                                                  key={
                                                                                      index
                                                                                  }
                                                                              >
                                                                                  {
                                                                                      value
                                                                                  }
                                                                              </option>
                                                                          )
                                                                      )}
                                                            </select>
                                                        </ItemContent>
                                                    </Item>
                                                    <Item>
                                                        <ItemTitle>
                                                            올림 높이
                                                        </ItemTitle>
                                                        <ItemContent>
                                                            <select
                                                                name="upFloor"
                                                                {...register(
                                                                    "upFloor",
                                                                    {
                                                                        value: "1",
                                                                    }
                                                                )}
                                                            >
                                                                {watch(
                                                                    "volume",
                                                                    "1"
                                                                ) === "1"
                                                                    ? ladderQuantityFloor.map(
                                                                          (
                                                                              value,
                                                                              index
                                                                          ) => (
                                                                              <option
                                                                                  value={
                                                                                      index +
                                                                                      1
                                                                                  }
                                                                                  key={
                                                                                      index
                                                                                  }
                                                                              >
                                                                                  {
                                                                                      value
                                                                                  }
                                                                              </option>
                                                                          )
                                                                      )
                                                                    : ladderTimeFloor.map(
                                                                          (
                                                                              value,
                                                                              index
                                                                          ) => (
                                                                              <option
                                                                                  value={
                                                                                      index +
                                                                                      1
                                                                                  }
                                                                                  key={
                                                                                      index
                                                                                  }
                                                                              >
                                                                                  {
                                                                                      value
                                                                                  }
                                                                              </option>
                                                                          )
                                                                      )}
                                                            </select>
                                                        </ItemContent>
                                                    </Item>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Item>
                                                <ItemTitle>
                                                    작업 높이 (톤 수)
                                                </ItemTitle>
                                                <ItemContent>
                                                    <select
                                                        name="floor"
                                                        {...register("floor", {
                                                            value: "1",
                                                        })}
                                                    >
                                                        {skyTimeWeight.map(
                                                            (value, index) => (
                                                                <option
                                                                    value={
                                                                        index +
                                                                        1
                                                                    }
                                                                    key={index}
                                                                >
                                                                    {value}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </ItemContent>
                                            </Item>

                                            <Item>
                                                <ItemTitle>작업 시간</ItemTitle>
                                                <ItemContent>
                                                    <select
                                                        name="volumeTime"
                                                        {...register(
                                                            "volumeTime",
                                                            {
                                                                value: "1",
                                                            }
                                                        )}
                                                    >
                                                        {Number(
                                                            watch("floor")
                                                        ) < 6
                                                            ? skyTimeOptions[1].map(
                                                                  (
                                                                      value,
                                                                      index
                                                                  ) => (
                                                                      <option
                                                                          value={
                                                                              index +
                                                                              1
                                                                          }
                                                                          key={
                                                                              index
                                                                          }
                                                                      >
                                                                          {
                                                                              value
                                                                          }
                                                                      </option>
                                                                  )
                                                              )
                                                            : skyTimeOptions[0].map(
                                                                  (
                                                                      value,
                                                                      index
                                                                  ) => (
                                                                      <option
                                                                          value={
                                                                              index +
                                                                              1
                                                                          }
                                                                          key={
                                                                              index
                                                                          }
                                                                      >
                                                                          {
                                                                              value
                                                                          }
                                                                      </option>
                                                                  )
                                                              )}
                                                    </select>
                                                </ItemContent>
                                            </Item>
                                        </>
                                    )}
                                    <Item>
                                        <ItemTitle>작업 날짜</ItemTitle>
                                        <ItemContent>
                                            <input
                                                disabled
                                                {...register("dateTime")}
                                            />
                                            <Blank />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowDateTimeCalendar(
                                                        true
                                                    );
                                                }}
                                            >
                                                달력
                                            </button>
                                            {showDateTimeCalendar ? (
                                                <Calendar value="dateTime" />
                                            ) : null}
                                        </ItemContent>
                                    </Item>
                                    <Item>
                                        <ItemTitle>작업 시간</ItemTitle>
                                        <ItemContent>
                                            <input
                                                {...register("orderHours")}
                                                type="number"
                                                style={{ width: 50 }}
                                                placeholder="0 ~ 23"
                                            />
                                            <Blank />시
                                            <Blank />
                                            <Blank />
                                            <input
                                                {...register("orderMin")}
                                                type="number"
                                                style={{ width: 50 }}
                                                placeholder="0 ~ 59"
                                            />
                                            <Blank />분
                                        </ItemContent>
                                    </Item>
                                    {watch("direction") !== "3" ? (
                                        <Item>
                                            <ItemTitle>작업 주소</ItemTitle>
                                            <ItemContent>
                                                <input
                                                    disabled
                                                    {...register("address1")}
                                                />
                                                <Blank />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openAddressPopup(1)
                                                    }
                                                >
                                                    검색
                                                </button>
                                                <Blank />
                                                <Blank />
                                                <input
                                                    {...register(
                                                        "detailAddress1"
                                                    )}
                                                    placeholder="상세 주소 입력"
                                                />
                                            </ItemContent>
                                        </Item>
                                    ) : (
                                        <>
                                            <Item>
                                                <ItemTitle>내림 주소</ItemTitle>
                                                <ItemContent>
                                                    <input
                                                        disabled
                                                        {...register(
                                                            "address1"
                                                        )}
                                                    />
                                                    <Blank />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openAddressPopup(1)
                                                        }
                                                    >
                                                        검색
                                                    </button>
                                                    <Blank />
                                                    <Blank />
                                                    <input
                                                        {...register(
                                                            "detailAddress1"
                                                        )}
                                                        placeholder="상세 주소 입력"
                                                    />
                                                </ItemContent>
                                            </Item>
                                            <Item>
                                                <ItemTitle>올림 주소</ItemTitle>
                                                <ItemContent>
                                                    <input
                                                        disabled
                                                        {...register(
                                                            "address2"
                                                        )}
                                                    />
                                                    <Blank />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openAddressPopup(2)
                                                        }
                                                    >
                                                        검색
                                                    </button>
                                                    <Blank />
                                                    <Blank />
                                                    <input
                                                        {...register(
                                                            "detailAddress2"
                                                        )}
                                                        placeholder="상세 주소 입력"
                                                    />
                                                </ItemContent>
                                            </Item>
                                        </>
                                    )}
                                    <Item>
                                        <ItemTitle>기사 지정</ItemTitle>
                                        <ItemContent>
                                            <input
                                                type="number"
                                                {...register("driver")}
                                                placeholder="휴대폰 번호 입력 (숫자만)"
                                                onChange={resetDriver}
                                            />
                                            <Blank />
                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    getUser(e, "driver")
                                                }
                                            >
                                                검색
                                            </button>
                                            <Blank />
                                            <Blank />
                                            선택 회원 :{" "}
                                            {watch("isDesignation")
                                                ? watch("driverName")
                                                : "없음"}
                                        </ItemContent>
                                    </Item>
                                    <Item>
                                        <ItemTitle>작업 비용</ItemTitle>
                                        <ItemContent>
                                            <input
                                                {...register("price")}
                                                disabled={
                                                    permission.functionPermissions.find(
                                                        (fnId) =>
                                                            fnId ===
                                                            "modify_price"
                                                    ) === undefined
                                                }
                                            />
                                            <Blank />P
                                            <Blank />
                                            <Blank />
                                            {consultation
                                                ? "(예상 운임 협의 작업)"
                                                : null}
                                        </ItemContent>
                                    </Item>
                                    <Item>
                                        <ItemTitle>특이 사항</ItemTitle>
                                        <ItemContent>
                                            <input
                                                {...register("memo")}
                                                style={{ width: 300 }}
                                            />
                                            <Blank />
                                        </ItemContent>
                                    </Item>
                                    <Item>
                                        <ItemTitle>현장 연락처</ItemTitle>
                                        <ItemContent>
                                            <input
                                                {...register("directPhone")}
                                            />
                                            <Blank />
                                        </ItemContent>
                                    </Item>
                                    <Item>
                                        <ItemTitle>푸시 알림</ItemTitle>
                                        <ItemContent>
                                            <input
                                                type="checkbox"
                                                defaultChecked={true}
                                                {...register("push", {
                                                    value: true,
                                                })}
                                                disabled={
                                                    permission.functionPermissions.find(
                                                        (fnId) =>
                                                            fnId ===
                                                            "modify_push"
                                                    ) === undefined
                                                }
                                            />
                                            <Blank />
                                            <div style={{ color: "grey" }}>
                                                선택 해제 시 기사 지정 오더가
                                                아닌 경우 푸시 알림이 가지
                                                않습니다 (테스트용)
                                            </div>
                                        </ItemContent>
                                    </Item>
                                </Container>
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: 20,
                                    }}
                                >
                                    <button type="submit">작업 등록</button>
                                </div>
                            </>
                        </form>
                    </MainContentLayout>
                </MainLayout>
            ) : null}
        </>
    );
}

export default RegistOrder;
