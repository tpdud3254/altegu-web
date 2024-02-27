import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import MainLayout from "../../../components/Layout/MainLayout";
import PageTitle from "../../../components/PageTitle";
import MainContentLayout from "../../../components/Layout/MainContentLayout";
import { HorizontalTable } from "../../../components/Table/HorizontalTable";
import { Blank } from "../../../components/Blank";
import { DefaultButton } from "../../../components/Button/DefaultButton";
import axios from "axios";
import { SERVER, VALID } from "../../../constant";
import {
    GetCalendarDateText,
    GetDate,
    GetPhoneNumberWithDash,
    NumberWithComma,
} from "../../../utils/utils";
import { BREAKDOWN_TABLE_COL, WITHDRAWALTABLE_COL } from "./table";
import Table from "../../../components/Table/Table";
import { Calendar as ReactCalendar } from "react-calendar";
import moment from "moment";

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

function BreakdownList() {
    const location = useLocation();
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);

    const [pointData, setPointData] = useState([]);
    const [tableData, setTableData] = useState(null);

    useEffect(() => {
        register("originalStartDate");
        register("originalEndDate");
        getWithdrawalList();
    }, []);

    const getWithdrawalList = async (data) => {
        try {
            const response = await axios.get(SERVER + "/admin/withdrawal", {
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
                        data: { list },
                    },
                } = response;

                setPointData(list);
                setTableData(getTableData(list));
            } else {
                console.log("getWithdrawalList invalid");
                setPointData([]);
            }
        } catch (error) {
            console.log("getWithdrawalList error : ", error);
        }
    };

    const getTableData = (data) => {
        const result = [];
        data.map((value, index) => {
            result.push({
                num: index + 1,
                userId: value.user.id,
                name: value.user.name,
                phone: GetPhoneNumberWithDash(value.user.phone),
                content: value.content,
                point: NumberWithComma(value.point) + "AP",
                type: value.type === "적립" ? "지급" : value.type,
                saveDate:
                    value.type === "적립" || value.type === "지급"
                        ? GetDate(value.date)
                        : "-",
                subtractDate: value.type === "차감" ? GetDate(value.date) : "-",
                withdrawalDate:
                    value.type === "출금" ? GetDate(value.date) : "-",
                restPoint: NumberWithComma(value.restPoint) + "AP",
                bank: value.user.point.bank,
                accountNumber: value.user.point.accountNumber,
            });
        });
        return result;
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

    const getTotalSavePoint = () => {
        let totalPoint = 0;
        pointData.map((value) => {
            if (value.type === "지급" || value.type === "적립") {
                totalPoint = totalPoint + value.point;
            }
        });

        return <div>{NumberWithComma(totalPoint)}AP</div>;
    };
    const getTotalWithdrawalPoint = () => {
        let totalPoint = 0;
        pointData.map((value) => {
            if (value.type === "출금") {
                totalPoint = totalPoint + value.point;
            }
        });

        return <div>{NumberWithComma(totalPoint)}AP</div>;
    };
    const getTotalSubtractPoint = () => {
        let totalPoint = 0;
        pointData.map((value) => {
            if (value.type === "차감") {
                totalPoint = totalPoint + value.point;
            }
        });

        return <div>{NumberWithComma(totalPoint)}AP</div>;
    };
    const onValid = async (data) => {
        console.log(data);
        const { originalEndDate, originalStartDate, searchData, type } = data;

        let name = null;
        let userId = null;
        let phone = null;

        if (Number(searchData)) {
            console.log("num");
            if (searchData.length < 11) {
                userId = searchData;
            } else {
                phone = searchData;
            }
        } else {
            name = searchData;
        }
        console.log(Number(searchData), typeof Number(searchData));

        const startDate = new Date(originalStartDate);
        const endDate = new Date(originalEndDate);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 0, 0);
        const sendData = {
            startDate: originalStartDate ? originalStartDate : null,
            endDate: originalEndDate ? originalEndDate : null,
            name: name ? name : null,
            userId: userId ? Number(userId) : null,
            phone: phone ? phone : null,
            type: type && type !== "0" ? type : null,
        };
        console.log(sendData);
        getWithdrawalList(sendData);
    };

    const columns = useMemo(() => BREAKDOWN_TABLE_COL, []);
    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="포인트 관리" />
            <MainContentLayout show={true}>
                <form onSubmit={handleSubmit(onValid)}>
                    <>
                        <SearchContainer>
                            <SearchText>검색 조건 입력</SearchText>
                            <HorizontalTable>
                                <thead></thead>
                                <tbody>
                                    <tr>
                                        <th>포인트 적립 총액</th>
                                        <td>{getTotalSavePoint()}</td>
                                        <th>포인트 출금 총액</th>
                                        <td>{getTotalWithdrawalPoint()}</td>
                                    </tr>
                                    <tr>
                                        <th>포인트 차감 총액</th>
                                        <td>{getTotalSubtractPoint()}</td>
                                        <th></th>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </HorizontalTable>
                            <HorizontalTable>
                                <thead></thead>
                                <tbody>
                                    <tr>
                                        <th>기간</th>
                                        <td>
                                            {" "}
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
                                        <th>검색</th>
                                        <td>
                                            <input
                                                placeholder="회원코드 / 이름 / 휴대폰번호"
                                                {...register("searchData")}
                                            />
                                            <Blank />
                                            <DefaultButton type="submit">
                                                검색
                                            </DefaultButton>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>유형</th>
                                        <td>
                                            <select
                                                name="type"
                                                {...register("type")}
                                            >
                                                <option value="0">전체</option>
                                                <option value="충전">
                                                    충전
                                                </option>
                                                <option value="지급">
                                                    지급
                                                </option>
                                                <option value="차감">
                                                    차감
                                                </option>
                                                <option value="출금">
                                                    출금
                                                </option>
                                            </select>
                                        </td>
                                        <th></th>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </HorizontalTable>
                        </SearchContainer>
                        <ResultContainer>
                            <ResultWrapper></ResultWrapper>
                            {tableData !== null ? (
                                <Table columns={columns} data={tableData} />
                            ) : null}
                        </ResultContainer>
                    </>
                </form>
            </MainContentLayout>
        </MainLayout>
    );
}

export default BreakdownList;
