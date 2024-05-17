import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import {
    GetCalendarDateText,
    GetDate,
    GetDateTime,
    GetOrderSerialNumber,
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
import UserDetails from "../SearchOrder/UserDetails";

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

function SearchPostpaidOrder() {
    const location = useLocation();
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

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
            const response = await axios.get(
                SERVER + "/admin/orders/postpaid",
                {
                    headers: {
                        "ngrok-skip-browser-warning": true,
                    },
                    ...(data && { params: { ...data } }),
                }
            );
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
                console.log("getOrders invalid");
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
                orderId: getOrderId(value),
                registDate: GetDateTime(value.createdAt),
                workingDateTime: value.dateTime
                    ? GetDateTime(value.dateTime)
                    : "-",
                paymentDate: GetDate(value.paymentDate),
                registUser: getName(value.registUser.id, value.registUser.name),
                price: NumberWithComma(value.price),
                gugupack: value.gugupackPrice > 0 ? "O" : "X",

                memo: value.memo ? value.memo : "-",
                acceptUser: getName(value.acceptUser, value.acceptUserName),
                orderStatus: getOrderStatus(value, index),
                pointCalc: getPointCalc(index, value.id, value.isCalculated),
            });
        });
        return result;
    };

    const getPointCalc = (tableIndex, orderId, isCalculated) => {
        const calculated = async () => {
            try {
                const response = await axios.patch(
                    SERVER + "/admin/order/calculate",
                    {
                        orderId: orderId,
                    }
                );

                const {
                    data: {
                        data: { order },
                        result,
                        msg,
                    },
                } = response;

                console.log(order);

                if (result === VALID) {
                    const prev = [...orderData];
                    prev[tableIndex].isCalculated = true;

                    setOrderData([...prev]);
                    setTableData(getTableData([...prev]));
                } else {
                    console.log("calculated invalid");
                    alert("포인트 분배에 실패하였습니다.");
                }
            } catch (error) {
                alert("포인트 분배에 실패하였습니다.");
                console.log("calculated error : ", error);
            }
        };

        return isCalculated ? "O" : <LinkText onClick={calculated}>X</LinkText>;
    };

    const getName = (index, name) => (
        <LinkText onClick={() => openUserDetail(index)}>{name}</LinkText>
    );

    const getOrderId = (value) => {
        const datetime = GetOrderSerialNumber(value.dateTime);

        return datetime + value.id;
    };

    const getOrderStatus = (value, index) => {
        if (value.standBy && value.orderStatusId) {
            if (value.orderStatusId === 1) return "입금 대기중";
            else return "작업 취소";
        }
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
                setValue("originalStartDate", data);
            } else {
                if (!getValues("originalStartDate")) {
                    alert("시작 날짜를 골라주세요.");
                    setShowEndCalendar(false);
                    return;
                }

                const startDate = new Date(getValues("originalStartDate"));

                if (startDate > data) {
                    alert("시작 날짜 이후의 날짜를 골라주세요.");
                    return;
                }

                const endDate = new Date(data);
                endDate.setHours(23, 59, 0, 0);
                setValue("originalEndDate", endDate);
            }

            setValue(value, GetCalendarDateText(data));
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
                {/* DEVELOP: timezone */}
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
        const { orderStatus, originalEndDate, originalStartDate, calculate } =
            data;

        const startDate = new Date(originalStartDate);
        const endDate = new Date(originalEndDate);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 0, 0);

        const sendData = {
            orderStatus: orderStatus !== "0" ? orderStatus : null,
            startDate: originalStartDate ? startDate : null,
            endDate: originalEndDate ? endDate : null,
            calculate: calculate !== "0" ? calculate : null,
        };

        await getOrders(sendData);
    };
    const columns = useMemo(() => ORDER_TABLE_COL, []);

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="작업 관리" />
            <MainContentLayout show={showUserDetail ? false : true}>
                <form onSubmit={handleSubmit(onValid)}>
                    <>
                        <SearchContainer>
                            <SearchText>검색 조건 입력</SearchText>
                            <HorizontalTable>
                                <thead></thead>
                                <tbody>
                                    <tr>
                                        <th>기간(작업일시)</th>
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
                                        <th></th>
                                        <td></td>
                                    </tr>
                                    <tr>
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
                                        <th>포인트 분배</th>
                                        <td>
                                            <select
                                                name="calculate"
                                                {...register("calculate")}
                                            >
                                                <option value="0">전체</option>
                                                <option value="1">
                                                    분배 전 (X)
                                                </option>
                                                <option value="2">
                                                    분배 완료 (O)
                                                </option>
                                            </select>
                                        </td>
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
                                    건
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
            {showUserDetail && userIndex !== null ? (
                <DetailContentLayout>
                    <UserDetails onClose={closeUserDetail} data={userIndex} />
                </DetailContentLayout>
            ) : null}
        </MainLayout>
    );
}

export default SearchPostpaidOrder;
