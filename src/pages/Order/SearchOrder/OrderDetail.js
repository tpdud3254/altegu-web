import styled from "styled-components";
import { LinkText } from "../../../components/Text/LinkText";
import {
    GetDate,
    GetDateTime,
    GetMinusDate,
    GetMinusDateTime,
    GetPhoneNumberWithDash,
    NumberWithComma,
    Reload,
    Reset,
} from "../../../utils/utils";
import { HorizontalTable } from "../../../components/Table/HorizontalTable";
import { PointButton } from "../../../components/Button/PointButton";
import { Blank } from "../../../components/Blank";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar as ReactCalendar } from "react-calendar";
import moment from "moment";
import {
    LADDER_FLOOR,
    ORDER_DIRECTION,
    ORDER_TYPE,
    ORDER_VOLUME,
    ORDER_VOLUME_QUANTITY,
    ORDER_VOLUME_TIME,
    SERVER,
    SKY_OPTION,
    SKY_TIME,
    VALID,
} from "../../../constant";
import axios from "axios";

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const Wrapper = styled.div`
    width: 100%;
    padding-top: 15px;
    padding-bottom: 15px;
`;

const Title = styled.div`
    width: 100%;
    font-weight: 600;
`;

const CalendarComponent = styled.div`
    background-color: white;
    position: absolute;
    border: 1px black solid;
    padding-top: 10px;
`;

const Buttons = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;

function OrderDetail({ onClose, data }) {
    const { register, handleSubmit, setValue, watch, getValues, reset } =
        useForm();

    const [modifyMode, setModifyMode] = useState(false);

    const [showWorkDateCalendar, setShowWorkDateCalendar] = useState(false);
    const [showRegistDateCalendar, setShowRegistDateCalendar] = useState(false);

    const [order, setOrder] = useState(null);
    const [updatedOrder, setUpdatedOrder] = useState(null);

    useEffect(() => {
        setOrder(data);
        register("originalWorkDate");
        register("originalRegistDate");
    }, []);

    useEffect(() => {
        reset();
    }, [modifyMode]);

    const getOrderId = (value) => {
        const datetime = GetMinusDate(value.dateTime);

        return datetime + value.id;
    };

    const getOrderType = (value) => {
        return (
            <div style={{ wordBreak: "break-all" }}>
                [{value.vehicleType}] {value.direction},{" "}
                {value.direction === "양사"
                    ? "올림 : " + value.upFloor + ", 내림 : " + value.downFloor
                    : value.floor}
                , {value.volume === "시간" ? value.time : value.quantity}
            </div>
        );
    };

    const getOrderStatus = (value) => {
        switch (value.orderStatusId) {
            case 1:
                return "작업 요청"; //1
            case 2:
                return "작업 예약"; //2
            case 3:
                return "작업 예약 (기사님 출발 상태)"; //2
            case 4:
                return "작업 중"; //3
            case 5:
                return "작업 완료"; //4
            case 6:
                return "작업 완료 확인"; //5
            case 7:
                return "작업 취소"; //6
            case 8:
                return "작업 취소"; //6
            default:
                break;
        }
    };

    const WorkDateCalendar = () => {
        const onChange = (data) => {
            console.log("selected date : ", data);
            const now = new Date();

            setValue("originalWorkDate", data);
            setValue("workDate", GetDate(data));
            setShowWorkDateCalendar(false);
        };

        return (
            <CalendarComponent>
                <ReactCalendar
                    calendarType="US"
                    onChange={onChange}
                    value={getValues("originalWorkDate")}
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

    const onValid = async (data) => {
        console.log(data);
        setUpdatedOrder(null);
        const {
            address1,
            address2,
            detailAddress1,
            detailAddress2,
            direction,
            downFloor,
            floor,
            memo,
            orderStatus,
            orderType,
            originalRegistDate,
            originalWorkDate,
            price,
            registDate,
            registUser,
            reigstTime,
            skyTime,
            upFloor,
            volume,
            workDate,
            workTime,
            time,
            quantity,
            directPhone,
        } = data;

        const registUserResult = Number(registUser) || null;

        if (registUserResult) {
            const response = await getUser(registUserResult);
            if (!response) {
                alert("찾을 수 없는 사용자입니다.");
                return;
            }
        }
        let workDateTimeResult = true;
        const workDateTime = workDate ? new Date(originalWorkDate) : null;
        const workTimeArr = workTime.split(":");
        if (workDateTime && workTimeArr.length > 1) {
            workDateTime.setHours(Number(workTimeArr[0]));
            workDateTime.setMinutes(Number(workTimeArr[1]));
        } else {
            workDateTimeResult = false;
        }

        let registDateTimeResult = true;
        const registDateTime = registDate ? new Date(originalRegistDate) : null;
        const registTimeArr = reigstTime ? reigstTime.split(":") : [];
        if (registDateTime && registTimeArr.length > 1) {
            registDateTime.setHours(Number(registTimeArr[0]));
            registDateTime.setMinutes(Number(registTimeArr[1]));
        } else {
            registDateTimeResult = false;
        }

        let address1Result = true;
        if (
            !address1 ||
            address1.length < 1 ||
            !detailAddress1 ||
            detailAddress1.length < 1
        )
            address1Result = false;

        let latitude1 = null;
        let longitude1 = null;
        let simpleAddress1 = null;
        if (address1Result && address1 && address1.length > 0) {
            try {
                const res = await axios.get(
                    `https://dapi.kakao.com/v2/local/search/address.json?query=${address1}`,
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

                latitude1 =
                    documents && documents.length > 0 ? documents[0].y : null;
                longitude1 =
                    documents && documents.length > 0 ? documents[0].x : null;

                simpleAddress1 =
                    documents && documents.length > 0
                        ? documents[0].address.region_1depth_name +
                          " " +
                          documents[0].address.region_2depth_name
                        : null;
            } catch (error) {
                alert("1차 작업 주소를 찾을 수 없습니다.");
                return;
            }

            if (!(latitude1 && longitude1)) {
                alert("1차 작업 주소를 찾을 수 없습니다.");
                return;
            }
        }

        let address2Result = true;
        if (
            !address2 ||
            address2.length < 1 ||
            !detailAddress2 ||
            detailAddress2.length < 1
        )
            address2Result = false;

        let latitude2 = null;
        let longitude2 = null;
        let simpleAddress2 = null;
        if (address2Result && address2 && address2.length > 0) {
            try {
                const res = await axios.get(
                    `https://dapi.kakao.com/v2/local/search/address.json?query=${address2}`,
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

                latitude2 =
                    documents && documents.length > 0 ? documents[0].y : null;
                longitude2 =
                    documents && documents.length > 0 ? documents[0].x : null;
                simpleAddress2 =
                    documents && documents.length > 0
                        ? documents[0].address.region_1depth_name +
                          " " +
                          documents[0].address.region_2depth_name
                        : null;
            } catch (error) {
                alert("2차 작업 주소를 찾을 수 없습니다.");
                return;
            }

            if (!(latitude2 && longitude2)) {
                alert("2차 작업 주소를 찾을 수 없습니다.");
                return;
            }
        }

        let orderTypeResult = null;
        if (orderType !== "0") orderTypeResult = ORDER_TYPE[Number(orderType)];

        let directionResult = null;
        let volumeResult = null;
        let timeResult = null;
        let skyTimeResult = null;
        let quantityResult = null;
        let floorResult = null;
        let skyFloorResult = null;
        let downFloorResult = null;
        let upFloorResult = null;

        if (orderType === "1") {
            //사다리차
            if (direction !== "0") {
                directionResult = ORDER_DIRECTION[Number(direction)];
                if (volume !== "0") {
                    volumeResult = ORDER_VOLUME[Number(volume)];
                    if (volume === "1") {
                        //시간
                        if (time !== "0") {
                            timeResult = ORDER_VOLUME_TIME[Number(time)];
                        } else {
                            alert("작업 종류 > 시간을 선택해주세요.");
                            return;
                        }
                    } else if (volume === "2") {
                        //물량
                        if (quantity !== "0") {
                            quantityResult =
                                ORDER_VOLUME_QUANTITY[Number(quantity)];
                        } else {
                            alert("작업 종류 > 물량을 선택해주세요.");
                            return;
                        }
                    }
                    if (direction === "3") {
                        //양사
                        if (downFloor !== "0") {
                            downFloorResult =
                                volume === "1"
                                    ? LADDER_FLOOR[0][Number(downFloor)]
                                    : LADDER_FLOOR[1][Number(downFloor)];
                        } else {
                            alert("작업 종류 > 내림 층 수를 선택해주세요.");
                            return;
                        }
                        if (upFloor !== "0") {
                            upFloorResult =
                                volume === "1"
                                    ? LADDER_FLOOR[0][Number(upFloor)]
                                    : LADDER_FLOOR[1][Number(upFloor)];
                        } else {
                            alert("작업 종류 > 올림 층 수를 선택해주세요.");
                            return;
                        }
                    } else if (direction === "1" || direction === "2") {
                        //올림, 내림
                        if (floor !== "0") {
                            floorResult =
                                volume === "1"
                                    ? LADDER_FLOOR[0][Number(floor)]
                                    : LADDER_FLOOR[1][Number(floor)];
                        } else {
                            alert("작업 종류 > 층 수를 선택해주세요.");
                            return;
                        }
                    }
                } else {
                    alert("작업 종류 > 작업량을 선택해주세요.");
                    return;
                }
            } else {
                alert("작업 종류 > 방향을 선택해주세요.");
                return;
            }
        } else if (orderType === "2") {
            //스카이차
            if (floor !== "0") {
                skyFloorResult = SKY_OPTION[Number(floor)];

                if (skyTime !== "0") {
                    if (Number(floor) <= 5) {
                        skyTimeResult = SKY_TIME[1][Number(skyTime)];
                    } else if (Number(floor) > 5) {
                        skyTimeResult = SKY_TIME[0][Number(skyTime)];
                    }
                } else {
                    alert("작업 종류 > 작업 시간을 선택해주세요.");
                    return;
                }
            } else {
                alert("작업 종류 > 작업 높이를 선택해주세요.");
                return;
            }
        }

        const orderStatusResult =
            orderStatus === "0" ? null : Number(orderStatus);

        const priceStatusResult = price.length === 0 ? null : Number(price);
        const memoResult = memo.length === 0 ? null : memo;
        const directPhoneResult = directPhone.length === 0 ? null : directPhone;

        const sendingData = {
            registUser: registUserResult ? registUserResult : null,
            registDateTime: registDateTimeResult ? registDateTime : null,
            workDateTime: workDateTimeResult ? workDateTime : null,
            address1: address1Result ? address1 : null,
            detailAddress1: address1Result ? detailAddress1 : null,
            simpleAddress1: address1Result ? simpleAddress1 : null,
            address2: address2Result ? address2 : null,
            detailAddress2: address2Result ? detailAddress2 : null,
            simpleAddress2: address2Result ? simpleAddress2 : null,
            orderType: orderTypeResult,
            direction: directionResult,
            volume: volumeResult,
            time: timeResult,
            quantity: quantityResult,
            floor: floorResult,
            downFloor: downFloorResult,
            upFloor: upFloorResult,
            skyTime: skyTimeResult,
            skyFloor: skyFloorResult,
            orderStatus: orderStatusResult,
            price: priceStatusResult,
            memo: memoResult,
            directPhone: directPhoneResult,
            latitude: latitude1,
            longitude: longitude1,
        };

        console.log("sendingData : ", sendingData);

        updateOrder(sendingData);
    };

    const getUser = async (data) => {
        try {
            const response = await axios.get(SERVER + "/admin/user", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
                params: { id: data },
            });

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    };

    const updateOrder = async (data) => {
        try {
            const response = await axios.patch(SERVER + "/admin/order/update", {
                ...data,
                orderId: order.id,
            });

            const {
                data: {
                    data: { updatedOrder: orders },
                    result,
                    msg,
                },
            } = response;

            console.log(orders);

            if (result === VALID) {
                setUpdatedOrder(orders);
                setOrder(orders);
                setModifyMode(false);
            } else alert(msg);
        } catch (error) {
            console.log(error);
        }
    };

    const onDeleteOrder = async () => {
        try {
            const response = await axios.delete(SERVER + "/admin/order", {
                data: {
                    orderId: order.id,
                },
            });

            console.log(response);
            const {
                data: { result },
            } = response;

            if (result === VALID) {
                Reload();
            } else alert("오더 삭제에 실패했습니다.");
        } catch (error) {
            console.log(error);
            alert("오더 삭제에 실패했습니다.");
        }
    };

    return (
        <>
            {order ? (
                <Container>
                    <div style={{ width: "100%" }}>
                        <LinkText onClick={Reset}>작업정보 검색</LinkText> {">"}{" "}
                        작업상세정보
                    </div>
                    <form onSubmit={handleSubmit(onValid)}>
                        <Wrapper>
                            <Title>세부정보</Title>
                            <HorizontalTable>
                                <thead></thead>
                                <tbody>
                                    <tr>
                                        <th>작업번호</th>
                                        <td>{getOrderId(order)}</td>
                                        <th>
                                            {modifyMode
                                                ? "작업 등록자 회원코드"
                                                : "작업 등록자"}
                                        </th>
                                        <td>
                                            {modifyMode ? (
                                                <input
                                                    style={{ width: "100%" }}
                                                    type="number"
                                                    placeholder={
                                                        "숫자만 입력 가능 (기존 : " +
                                                        order.registUser.name +
                                                        ")"
                                                    }
                                                    {...register("registUser")}
                                                />
                                            ) : (
                                                order.registUser.name
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>작업일시</th>
                                        <td>
                                            {modifyMode ? (
                                                <>
                                                    {" "}
                                                    <input
                                                        style={{ width: "9vw" }}
                                                        disabled
                                                        {...register(
                                                            "workDate"
                                                        )}
                                                    />
                                                    <Blank />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setShowWorkDateCalendar(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        달력
                                                    </button>
                                                    <Blank />
                                                    <input
                                                        placeholder="예시) 17:04"
                                                        style={{ width: "9vw" }}
                                                        {...register(
                                                            "workTime"
                                                        )}
                                                    />
                                                    {showWorkDateCalendar ? (
                                                        <WorkDateCalendar />
                                                    ) : null}
                                                </>
                                            ) : (
                                                GetMinusDateTime(order.dateTime)
                                            )}
                                        </td>
                                        <th>등록일시</th>
                                        <td>
                                            {GetDateTime(order.createdAt)}
                                            {/* {modifyMode ? (
                                                <>
                                                    {" "}
                                                    <input
                                                        style={{ width: "9vw" }}
                                                        disabled
                                                        {...register(
                                                            "registDate"
                                                        )}
                                                    />
                                                    <Blank />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setShowRegistDateCalendar(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        달력
                                                    </button>
                                                    <Blank />
                                                    <input
                                                        placeholder="예시) 17:04"
                                                        style={{ width: "9vw" }}
                                                        {...register(
                                                            "reigstTime"
                                                        )}
                                                    />
                                                    {showRegistDateCalendar ? (
                                                        <RegistDateCalendar />
                                                    ) : null}
                                                </>
                                            ) : (
                                                GetDateTime(order.createdAt)
                                            )} */}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>1차 작업 주소</th>
                                        <td>
                                            {modifyMode ? (
                                                <>
                                                    <input
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        placeholder={
                                                            order.address1
                                                        }
                                                        {...register(
                                                            "address1"
                                                        )}
                                                    />
                                                    <input
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        placeholder={
                                                            order.detailAddress1
                                                        }
                                                        {...register(
                                                            "detailAddress1"
                                                        )}
                                                    />
                                                </>
                                            ) : (
                                                order.address1 +
                                                " " +
                                                order.detailAddress1
                                            )}
                                        </td>
                                        <th>2차 작업 주소</th>
                                        <td>
                                            {modifyMode ? (
                                                <>
                                                    <input
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        placeholder={
                                                            order.address2
                                                                ? order.address2
                                                                : "주소"
                                                        }
                                                        {...register(
                                                            "address2"
                                                        )}
                                                    />
                                                    <input
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        placeholder={
                                                            order.detailAddress2
                                                                ? order.detailAddress2
                                                                : "상세 주소"
                                                        }
                                                        {...register(
                                                            "detailAddress2"
                                                        )}
                                                    />
                                                </>
                                            ) : order.address2 ? (
                                                order.address2 +
                                                " " +
                                                order.detailAddress2
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>작업 종류</th>
                                        <td>
                                            {!modifyMode ? (
                                                getOrderType(order)
                                            ) : (
                                                <>
                                                    <select
                                                        name="orderType"
                                                        {...register(
                                                            "orderType"
                                                        )}
                                                    >
                                                        {ORDER_TYPE.map(
                                                            (value, index) => (
                                                                <option
                                                                    value={
                                                                        index
                                                                    }
                                                                    key={index}
                                                                >
                                                                    {value}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                    <Blank />
                                                    {watch("orderType") ===
                                                        "0" ||
                                                    watch("orderType") ===
                                                        null ? null : watch(
                                                          "orderType"
                                                      ) === "1" ? (
                                                        <>
                                                            <select
                                                                name="direction"
                                                                {...register(
                                                                    "direction"
                                                                )}
                                                            >
                                                                {ORDER_DIRECTION.map(
                                                                    (
                                                                        value,
                                                                        index
                                                                    ) => (
                                                                        <option
                                                                            value={
                                                                                index
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
                                                            <Blank />
                                                            <select
                                                                name="volume"
                                                                {...register(
                                                                    "volume"
                                                                )}
                                                            >
                                                                {ORDER_VOLUME.map(
                                                                    (
                                                                        value,
                                                                        index
                                                                    ) => (
                                                                        <option
                                                                            value={
                                                                                index
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
                                                            <Blank />
                                                            {watch("volume") ===
                                                            "1" ? (
                                                                <select
                                                                    name="time"
                                                                    {...register(
                                                                        "time"
                                                                    )}
                                                                >
                                                                    {ORDER_VOLUME_TIME.map(
                                                                        (
                                                                            value,
                                                                            index
                                                                        ) => (
                                                                            <option
                                                                                value={
                                                                                    index
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
                                                            ) : null}
                                                            {watch("volume") ===
                                                            "2" ? (
                                                                <select
                                                                    name="quantity"
                                                                    {...register(
                                                                        "quantity"
                                                                    )}
                                                                >
                                                                    {ORDER_VOLUME_QUANTITY.map(
                                                                        (
                                                                            value,
                                                                            index
                                                                        ) => (
                                                                            <option
                                                                                value={
                                                                                    index
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
                                                            ) : null}
                                                            {watch("volume") ===
                                                            "1" ? (
                                                                watch(
                                                                    "direction"
                                                                ) === "3" ? (
                                                                    <>
                                                                        <Blank />
                                                                        <select
                                                                            name="downFloor"
                                                                            {...register(
                                                                                "downFloor"
                                                                            )}
                                                                        >
                                                                            {LADDER_FLOOR[0].map(
                                                                                (
                                                                                    value,
                                                                                    index
                                                                                ) => (
                                                                                    <option
                                                                                        value={
                                                                                            index
                                                                                        }
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                    >
                                                                                        {index ===
                                                                                        0
                                                                                            ? "내림 " +
                                                                                              value
                                                                                            : value}
                                                                                    </option>
                                                                                )
                                                                            )}
                                                                        </select>
                                                                        \
                                                                        <select
                                                                            name="upFloor"
                                                                            {...register(
                                                                                "upFloor"
                                                                            )}
                                                                        >
                                                                            {LADDER_FLOOR[0].map(
                                                                                (
                                                                                    value,
                                                                                    index
                                                                                ) => (
                                                                                    <option
                                                                                        value={
                                                                                            index
                                                                                        }
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                    >
                                                                                        {index ===
                                                                                        0
                                                                                            ? "올림 " +
                                                                                              value
                                                                                            : value}
                                                                                    </option>
                                                                                )
                                                                            )}
                                                                        </select>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Blank />
                                                                        <select
                                                                            name="floor"
                                                                            {...register(
                                                                                "floor"
                                                                            )}
                                                                        >
                                                                            {LADDER_FLOOR[0].map(
                                                                                (
                                                                                    value,
                                                                                    index
                                                                                ) => (
                                                                                    <option
                                                                                        value={
                                                                                            index
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
                                                                    </>
                                                                )
                                                            ) : null}
                                                            {watch("volume") ===
                                                            "2" ? (
                                                                watch(
                                                                    "direction"
                                                                ) === "3" ? (
                                                                    <>
                                                                        <Blank />
                                                                        <select
                                                                            name="downFloor"
                                                                            {...register(
                                                                                "downFloor"
                                                                            )}
                                                                        >
                                                                            {LADDER_FLOOR[1].map(
                                                                                (
                                                                                    value,
                                                                                    index
                                                                                ) => (
                                                                                    <option
                                                                                        value={
                                                                                            index
                                                                                        }
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                    >
                                                                                        {index ===
                                                                                        0
                                                                                            ? "내림 " +
                                                                                              value
                                                                                            : value}
                                                                                    </option>
                                                                                )
                                                                            )}
                                                                        </select>
                                                                        \
                                                                        <select
                                                                            name="upFloor"
                                                                            {...register(
                                                                                "upFloor"
                                                                            )}
                                                                        >
                                                                            {LADDER_FLOOR[1].map(
                                                                                (
                                                                                    value,
                                                                                    index
                                                                                ) => (
                                                                                    <option
                                                                                        value={
                                                                                            index
                                                                                        }
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                    >
                                                                                        {index ===
                                                                                        0
                                                                                            ? "올림 " +
                                                                                              value
                                                                                            : value}
                                                                                    </option>
                                                                                )
                                                                            )}
                                                                        </select>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Blank />
                                                                        <select
                                                                            name="floor"
                                                                            {...register(
                                                                                "floor"
                                                                            )}
                                                                        >
                                                                            {LADDER_FLOOR[1].map(
                                                                                (
                                                                                    value,
                                                                                    index
                                                                                ) => (
                                                                                    <option
                                                                                        value={
                                                                                            index
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
                                                                    </>
                                                                )
                                                            ) : null}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Blank />
                                                            <select
                                                                name="floor"
                                                                {...register(
                                                                    "floor"
                                                                )}
                                                            >
                                                                {SKY_OPTION.map(
                                                                    (
                                                                        value,
                                                                        index
                                                                    ) => (
                                                                        <option
                                                                            value={
                                                                                index
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
                                                            <Blank />
                                                            {Number(
                                                                watch("floor")
                                                            ) <= 5 ? (
                                                                <select
                                                                    name="skyTime"
                                                                    {...register(
                                                                        "skyTime"
                                                                    )}
                                                                >
                                                                    {SKY_TIME[1].map(
                                                                        (
                                                                            value,
                                                                            index
                                                                        ) => (
                                                                            <option
                                                                                value={
                                                                                    index
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
                                                            ) : (
                                                                <select
                                                                    name="skyTime"
                                                                    {...register(
                                                                        "skyTime"
                                                                    )}
                                                                >
                                                                    {SKY_TIME[0].map(
                                                                        (
                                                                            value,
                                                                            index
                                                                        ) => (
                                                                            <option
                                                                                value={
                                                                                    index
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
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <th>작업상태</th>
                                        <td>
                                            {modifyMode ? (
                                                <select
                                                    name="orderStatus"
                                                    {...register("orderStatus")}
                                                >
                                                    <option value="0">
                                                        전체
                                                    </option>
                                                    <option value="1">
                                                        작업 요청
                                                    </option>
                                                    <option value="2">
                                                        작업 예약
                                                    </option>
                                                    <option value="3">
                                                        작업 진행
                                                    </option>
                                                    <option value="4">
                                                        작업 완료
                                                    </option>
                                                    <option value="5">
                                                        작업 완료 확인
                                                    </option>
                                                    <option value="6">
                                                        작업 취소
                                                    </option>
                                                </select>
                                            ) : (
                                                getOrderStatus(order)
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>작업 비용</th>
                                        <td>
                                            {modifyMode ? (
                                                <input
                                                    type="number"
                                                    {...register("price")}
                                                    placeholder={
                                                        order.orderPrice
                                                    }
                                                />
                                            ) : (
                                                NumberWithComma(
                                                    order.orderPrice
                                                )
                                            )}
                                            AP
                                        </td>
                                        <th>특이사항</th>
                                        <td>
                                            {modifyMode ? (
                                                <input
                                                    style={{ width: "100%" }}
                                                    {...register("memo")}
                                                    defaultValue={
                                                        order ? order.memo : ""
                                                    }
                                                />
                                            ) : order.memo ? (
                                                order.memo
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>전화번호</th>
                                        <td>
                                            {GetPhoneNumberWithDash(
                                                order.phone
                                            )}
                                        </td>
                                        <th>현장 전화번호</th>
                                        <td>
                                            {modifyMode ? (
                                                <input
                                                    type="number"
                                                    placeholder={
                                                        order.directPhone
                                                    }
                                                    {...register("directPhone")}
                                                />
                                            ) : order.directPhone ? (
                                                GetPhoneNumberWithDash(
                                                    order.directPhone
                                                )
                                            ) : (
                                                "-"
                                            )}
                                            {}
                                        </td>
                                    </tr>
                                </tbody>
                            </HorizontalTable>
                        </Wrapper>
                        {modifyMode ? (
                            <Buttons>
                                <PointButton type="submit">완료</PointButton>
                                <Blank />
                                <Blank />
                                <PointButton
                                    type="button"
                                    onClick={() => setModifyMode(false)}
                                >
                                    취소
                                </PointButton>
                            </Buttons>
                        ) : (
                            <Buttons>
                                <PointButton
                                    type="button"
                                    onClick={onDeleteOrder}
                                >
                                    삭제하기
                                </PointButton>

                                {order.orderStatusId === 1 ||
                                order.orderStatusId === 2 ? (
                                    <>
                                        {" "}
                                        <Blank />
                                        <Blank />
                                        <PointButton
                                            type="button"
                                            onClick={() =>
                                                order.orderStatusId === 1 ||
                                                order.orderStatusId === 2
                                                    ? setModifyMode(true)
                                                    : setModifyMode(false)
                                            }
                                        >
                                            수정하기
                                        </PointButton>
                                    </>
                                ) : null}

                                <Blank />
                                <Blank />
                                <PointButton
                                    type="button"
                                    onClick={() => onClose(updatedOrder)}
                                >
                                    닫기
                                </PointButton>
                            </Buttons>
                        )}
                    </form>
                </Container>
            ) : null}
        </>
    );
}

export default OrderDetail;
