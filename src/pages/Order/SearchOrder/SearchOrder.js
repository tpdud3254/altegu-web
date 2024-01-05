import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import {
    GetDate,
    GetDateTime,
    GetMinusDate,
    GetMinusDateTime,
    NumberWithComma,
    Reload,
    Reset,
} from "../../../utils/utils";
import { SERVER, VALID } from "../../../constant";
import axios from "axios";
import { ORDER_TABLE_COL } from "./table";
import MainLayout from "../../../components/Layout/MainLayout";
import PageTitle from "../../../components/PageTitle";
import MainContentLayout from "../../../components/Layout/MainContentLayout";
import { HorizontalTable } from "../../../components/Table/HorizontalTable";
import { Blank } from "../../../components/Blank";
import Table from "../../../components/Table/Table";
import { LinkText } from "../../../components/Text/LinkText";
import "../../../components/Calendar/calendarStyle.css";
import { Calendar as ReactCalendar } from "react-calendar";
import moment from "moment";
import Modal from "../../../components/Modal";
import { PointButton } from "../../../components/Button/PointButton";
import DetailContentLayout from "../../../components/Layout/DetailContentLayout";
import OrderDetail from "./OrderDetail";
import UserDetails from "./UserDetails";

const SearchContainer = styled.div`
    width: 100%;
`;

const SearchText = styled.div`
    font-weight: 600;
`;

const ResultContainer = styled.div`
    width: 100%;
    margin-top: 30px;
`;

const ResultWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    align-items: flex-end;
`;

const CalendarComponent = styled.div`
    background-color: white;
    position: absolute;
    border: 1px black solid;
    padding-top: 10px;
`;

const Buttons = styled.div`
    padding-top: 30px;
`;

function SearchOrder() {
    const location = useLocation();
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const [showDetail, setShowDetail] = useState(false);
    const [showUserDetail, setShowUserDetail] = useState(false);

    const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);

    const [orderData, setOrderData] = useState([]);
    const [tableData, setTableData] = useState(null);
    const [orderIndex, setOrderIndex] = useState(null);
    const [userIndex, setUserIndex] = useState(null);

    useEffect(() => {
        register("originalStartDate");
        register("originalEndDate");
        getOrders();
    }, []);

    const getOrders = async (data) => {
        try {
            const response = await axios.get(SERVER + "/admin/orders", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
                ...(data && { params: { ...data } }),
            });
            const {
                data: { result },
            } = response;
            if (result === VALID) {
                const {
                    data: {
                        data: { orders },
                    },
                } = response;
                console.log("getOrders valid : ", orders);
                setOrderData(orders);
                setTableData(getTableData(orders));
            } else {
                console.log("getUsers invalid");
                setOrderData([]);
            }
        } catch (error) {
            console.log("getUsers error : ", error);
        }
    };

    const getTableData = (data) => {
        const result = [];
        data.map((value, index) => {
            result.push({
                num: index + 1,
                orderId: (
                    <LinkText onClick={() => openDetail(index)}>
                        {getOrderId(value)}
                    </LinkText>
                ),
                registDate: GetMinusDateTime(value.createdAt),
                workingDateTime: value.dateTime
                    ? GetMinusDateTime(value.dateTime)
                    : "-",
                address: getAddress(value),
                registUser: getName(value.registUser.id, value.registUser.name),
                price: NumberWithComma(value.price),
                orderType: getOrderType(value),
                memo: value.memo ? value.memo : "-",
                acceptUser: getName(value.acceptUser, value.acceptUserName),
                orderStatus: getOrderStatus(value, index),
                doneDateTime:
                    value.updatedAt &&
                    (value.orderStatusId === 5 || value.orderStatusId === 6)
                        ? GetDateTime(value.updatedAt)
                        : "-",
            });
        });
        return result;
    };

    const getName = (index, name) => (
        <LinkText onClick={() => openUserDetail(index)}>{name}</LinkText>
    );

    const getOrderId = (value) => {
        const datetime = GetMinusDate(value.dateTime);

        return datetime + value.id;
    };

    const getAddress = (value) => {
        return value.direction === "양사" ? (
            <div style={{ wordBreak: "break-all", maxWidth: "11vw" }}>
                올림 : {value.address1} <br />
                내림 : {value.address2}
            </div>
        ) : (
            <div style={{ wordBreak: "break-all", maxWidth: "11vw" }}>
                {value.address1}
            </div>
        );
    };

    const getOrderType = (value) => {
        return (
            <div style={{ wordBreak: "break-all", maxWidth: "11vw" }}>
                [{value.vehicleType}] {value.direction},{" "}
                {value.direction === "양사"
                    ? "올림 : " + value.upFloor + ", 내림 : " + value.downFloor
                    : value.floor}
                , {value.volume === "시간" ? value.time : value.quantity}
            </div>
        );
    };

    const getOrderStatus = (value, index) => {
        switch (value.orderStatusId) {
            case 1:
                return "작업 요청"; //1
            case 2:
                return (
                    <LinkText onClick={() => openCancelOrderModal(index)}>
                        작업 예약
                    </LinkText>
                ); //2
            case 3:
                return "작업 예약"; //2
            case 4:
                return "작업 중"; //3
            case 5:
                return <div style={{ color: "red" }}>작업 완료</div>; //4

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

    const Calendar = ({ value }) => {
        const onChange = (data) => {
            console.log("selected date : ", data);
            const now = new Date();

            if (value === "startDate") {
                if (now < data) {
                    alert("현재 날짜 이전의 날짜를 골라주세요.");
                    return;
                }
                setValue("originalStartDate", data);
            } else {
                const startDate = new Date(getValues("originalStartDate"));

                if (!getValues("originalStartDate")) {
                    alert("시작 날짜를 골라주세요.");
                    setShowEndCalendar(false);
                    return;
                }
                if (startDate > data) {
                    alert("시작 날짜 이후의 날짜를 골라주세요.");
                    return;
                }
                setValue("originalEndDate", data);
            }
            setValue(value, GetDate(data));
            setShowEndCalendar(false);
            setShowStartCalendar(false);
        };

        return (
            <CalendarComponent>
                <ReactCalendar
                    calendarType="US"
                    onChange={onChange}
                    value={getValues(
                        value === "startDate"
                            ? "originalStartDate"
                            : "originalEndDate"
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

    const openDetail = (index) => {
        setShowDetail(true);
        setOrderIndex(index);
    };

    const closeDetail = (data) => {
        if (data) {
            const prev1 = [...tableData];

            prev1[orderIndex].registDate = GetDateTime(data.createdAt);
            prev1[orderIndex].workingDateTime = data.dateTime
                ? GetMinusDateTime(data.dateTime)
                : "-";
            prev1[orderIndex].address = getAddress(data);
            prev1[orderIndex].registUser = getName(
                data.registUser.id,
                data.registUser.name
            );
            prev1[orderIndex].price = NumberWithComma(data.price);
            prev1[orderIndex].orderType = getOrderType(data);
            prev1[orderIndex].memo = data.memo ? data.memo : "-";
            prev1[orderIndex].orderStatus = getOrderStatus(
                data,
                Number(prev1[orderIndex].num) - 1
            );
            prev1[orderIndex].doneDateTime =
                data.updatedAt &&
                (data.orderStatusId === 5 || data.orderStatusId === 6)
                    ? GetDateTime(data.updatedAt)
                    : "-";

            setTableData([...prev1]);

            const prev2 = [...orderData];
            prev2[orderIndex] = { ...data };
            setOrderData([...prev2]);
        }
        setShowDetail(false);
        setOrderIndex(null);
    };

    const openUserDetail = (index) => {
        console.log("user id : ", index);
        setShowUserDetail(true);
        setUserIndex(index);
    };

    const closeUserDetail = () => {
        setShowUserDetail(false);
        setUserIndex(null);
    };

    const openCancelOrderModal = async (index) => {
        setOrderIndex(index);
        setShowCancelOrderModal(true);
    };

    const closeCancelOrderModal = () => {
        setOrderIndex(null);
        setShowCancelOrderModal(false);
    };

    const CancelOrderModal = () => (
        <Modal
            open={openCancelOrderModal}
            close={closeCancelOrderModal}
            header="작업 예약 취소"
        >
            <div
                style={{
                    fontWeight: "600",
                    lineHeight: 1.3,
                    paddingTop: 10,
                    paddingBottom: 10,
                    backgroundColor: "lightgray",
                }}
            >
                <div>{GetDateTime(orderData[orderIndex].dateTime)}</div>
                <div>{orderData[orderIndex].simpleAddress1}</div>
                <div>
                    [{orderData[orderIndex].vehicleType}]{" "}
                    {orderData[orderIndex].direction},{" "}
                    {orderData[orderIndex].direction === "양사"
                        ? "올림 : " +
                          orderData[orderIndex].upFloor +
                          ", 내림 : " +
                          orderData[orderIndex].downFloor
                        : orderData[orderIndex].floor}
                    ,{" "}
                    {orderData[orderIndex].volume === "시간"
                        ? orderData[orderIndex].time
                        : orderData[orderIndex].quantity}
                </div>
            </div>
            <div style={{ marginTop: 20, marginBottom: -10 }}>
                취소하시겠습니까?
            </div>
            <Buttons>
                <PointButton type="button" onClick={onCancelOrder}>
                    확인
                </PointButton>
            </Buttons>
        </Modal>
    );

    const onCancelOrder = async () => {
        console.log(orderIndex);

        try {
            const response = await axios.patch(SERVER + "/admin/order/cancel", {
                orderId: orderData[orderIndex].id,
            });

            const {
                data: {
                    data: { order },
                    result,
                    msg,
                },
            } = response;

            console.log(order);

            if (result === VALID) {
                alert("예약취소 성공하였습니다.");
                Reload();
            } else {
                console.log("onModifyPoint invalid");
                alert("예약취소 실패하였습니다.");
            }
        } catch (error) {
            alert("예약취소 실패하였습니다.");
            console.log("onModifyPoint error : ", error);
        }
    };

    const onValid = async (data) => {
        const {
            orderId,
            acceptUser,
            registUser,
            orderType,
            orderStatus,
            region,
            originalEndDate,
            originalStartDate,
        } = data;

        const sendData = {
            orderId: orderId ? orderId.substring(6, orderId.length) : null,
            acceptUser: acceptUser ? acceptUser : null,
            registUser: registUser ? registUser : null,
            orderStatus: orderStatus !== "0" ? orderStatus : null,
            orderType:
                orderType !== "0"
                    ? orderType === "1"
                        ? "사다리차"
                        : "스카이차"
                    : null,
            region: region ? region : null,
            startDate: originalStartDate ? originalStartDate : null,
            endDate: originalEndDate ? originalEndDate : null,
        };

        console.log(sendData);
        await getOrders(sendData);
    };
    const columns = useMemo(() => ORDER_TABLE_COL, []);

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="작업 관리" />
            <MainContentLayout
                show={showDetail || showUserDetail ? false : true}
            >
                <form onSubmit={handleSubmit(onValid)}>
                    <>
                        <SearchContainer>
                            <SearchText>검색 조건 입력</SearchText>
                            <HorizontalTable>
                                <thead></thead>
                                <tbody>
                                    <tr>
                                        <th>작업 구분</th>
                                        <td>
                                            <select
                                                name="orderType"
                                                {...register("orderType")}
                                            >
                                                <option value="0">전체</option>
                                                <option value="1">
                                                    사다리
                                                </option>
                                                <option value="2">
                                                    스카이
                                                </option>
                                            </select>
                                        </td>
                                        <th>작업상태</th>
                                        <td>
                                            <select
                                                name="orderStatus"
                                                {...register("orderStatus")}
                                            >
                                                <option value="0">전체</option>
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
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>작업자 회원코드</th>
                                        <td>
                                            <input
                                                type="number"
                                                placeholder="숫자만 입력"
                                                {...register("acceptUser")}
                                            />
                                        </td>
                                        <th>등록자</th>
                                        <td>
                                            <input
                                                {...register("registUser")}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>기간</th>
                                        <td>
                                            <input
                                                disabled
                                                {...register("startDate")}
                                            />
                                            <Blank />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowStartCalendar(true);
                                                }}
                                            >
                                                달력
                                            </button>
                                            {showStartCalendar ? (
                                                <Calendar value="startDate" />
                                            ) : null}
                                            <Blank />
                                            ~
                                            <Blank />
                                            <input
                                                disabled
                                                {...register("endDate")}
                                            />
                                            <Blank />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowEndCalendar(true);
                                                }}
                                            >
                                                달력
                                            </button>
                                            {showEndCalendar ? (
                                                <Calendar value="endDate" />
                                            ) : null}
                                        </td>
                                        <th>지역명</th>
                                        <td>
                                            <input {...register("region")} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>작업번호</th>
                                        <td>
                                            <input
                                                type="number"
                                                placeholder="숫자만 입력"
                                                {...register("orderId")}
                                            />
                                        </td>
                                        <th></th>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </HorizontalTable>
                            <button type="submit">검색하기</button>
                            <Blank />
                            <button type="button" onClick={Reset}>
                                초기화
                            </button>
                        </SearchContainer>
                        <ResultContainer>
                            <ResultWrapper>
                                <div>
                                    총:{" "}
                                    {tableData !== null
                                        ? NumberWithComma(tableData.length)
                                        : "-"}
                                    명
                                </div>
                            </ResultWrapper>
                            {tableData !== null ? (
                                <Table columns={columns} data={tableData} />
                            ) : null}
                        </ResultContainer>
                        {showCancelOrderModal ? <CancelOrderModal /> : null}
                    </>
                </form>
            </MainContentLayout>
            {showDetail && orderIndex !== null ? (
                <DetailContentLayout>
                    <OrderDetail
                        onClose={closeDetail}
                        data={orderData[orderIndex]}
                    />
                </DetailContentLayout>
            ) : null}
            {showUserDetail && userIndex !== null ? (
                <DetailContentLayout>
                    <UserDetails onClose={closeUserDetail} data={userIndex} />
                </DetailContentLayout>
            ) : null}
        </MainLayout>
    );
}

export default SearchOrder;
