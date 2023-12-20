import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import {
    GENDER,
    MEMBERSHIP_STATUS,
    SERVER,
    VALID,
    WORK_CATEGORY,
    WORK_CATEGORY_TEXT,
} from "../../../contant";
import {
    GetAge,
    GetDate,
    GetDateTime,
    GetPhoneNumberWithDash,
    NumberWithComma,
    Reset,
} from "../../../utils/utils";
import { MEMBERSHIP_TABLE_COL } from "./table";
import MainLayout from "../../../components/Layout/MainLayout";
import PageTitle from "../../../components/PageTitle";
import MainContentLayout from "../../../components/Layout/MainContentLayout";
import { HorizontalTable } from "../../../components/Table/HorizontalTable";
import { Blank } from "../../../components/Blank";
import Table from "../../../components/Table/Table";
import { Calendar as ReactCalendar } from "react-calendar";
import moment from "moment";
import "../../../components/Calendar/calendarStyle.css";

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

function ManageMembership() {
    const location = useLocation();
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const [showSubtractScreen, setShowSubtractScreen] = useState(false);

    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const [showMembershipStartCalendar, setShowMembershipStartCalendar] =
        useState(false);
    const [showMembershipEndCalendar, setShowMembershipEndCalendar] =
        useState(false);

    const [userData, setUserData] = useState([]);
    const [userIndex, setUserIndex] = useState(null);
    const [tableData, setTableData] = useState(null);
    const [selectedArr, setSelectedArr] = useState([]);
    const [subtractUsers, setSubtractUsers] = useState([]);

    useEffect(() => {
        register("originalStartDate");
        register("originalEndDate");
        register("originalMembershipStartDate");
        register("originalMembershipEndDate");
        getUsers();
    }, []);

    const getUsers = async (data) => {
        try {
            const response = await axios.get(SERVER + "/admin/users", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
                ...(data && { params: { ...data, userTypeId: 2 } }),
                ...(!data && { params: { userTypeId: 2 } }),
            });

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                const {
                    data: {
                        data: { users },
                    },
                } = response;
                console.log("getUsers valid : ", users);

                setUserData(users);
                setTableData(getTableData(users));
            } else {
                const {
                    data: { msg },
                } = response;

                console.log("getUsers invalid");
                setUserData([]);
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
                userId: value.id,
                name: value.name,
                signUpDate: GetDateTime(value.createdAt),
                membershipDate: value.membershipDate
                    ? GetDateTime(value.membershipDate)
                    : "-",
                finalMembershipDate: value.finalMembershipDate
                    ? GetDateTime(value.finalMembershipDate)
                    : "-",
                age: GetAge(value.birth),
                gender: value.gender,
                phone: GetPhoneNumberWithDash(value.phone),
                userType: "기사",
                region: value.accessedRegion,
                point: value.point
                    ? NumberWithComma(value.point.curPoint) + "AP"
                    : "0AP",
                status: getStatus(value.membership, value.status),
                withdrawalMembershipDate: value.withdrawalMembershipDate
                    ? GetDateTime(value.withdrawalMembershipDate)
                    : "-",
            });
        });
        return result;
    };

    const getStatus = (membership, status) => {
        if (membership) return "정회원";
        else if (status === "정상") return "기사회원";
        else return status;
    };

    const getMembershipUsers = async (data) => {
        try {
            const response = await axios.get(
                SERVER + "/admin/users/membership",
                {
                    headers: {
                        "ngrok-skip-browser-warning": true,
                    },
                    ...(data && { params: { ...data, userTypeId: 2 } }),
                    ...(!data && { params: { userTypeId: 2 } }),
                }
            );

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                const {
                    data: {
                        data: { users },
                    },
                } = response;
                console.log("getUsers valid : ", users);

                setUserData(users);
                setTableData(getTableData(users));
            } else {
                const {
                    data: { msg },
                } = response;

                console.log("getUsers invalid");
                setUserData([]);
            }
        } catch (error) {
            console.log("getUsers error : ", error);
        }
    };

    const Calendar = ({ value }) => {
        const membership = value.indexOf("membership") != -1 ? true : false;

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
                if (now < data) {
                    alert("현재 날짜 이전의 날짜를 골라주세요.");
                    return;
                }

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

        const onMembershipChange = (data) => {
            console.log("selected date : ", data);
            const now = new Date();

            if (value === "membershipStartDate") {
                if (now < data) {
                    alert("현재 날짜 이전의 날짜를 골라주세요.");
                    return;
                }
                setValue("originalMembershipStartDate", data);
            } else {
                if (now < data) {
                    alert("현재 날짜 이전의 날짜를 골라주세요.");
                    return;
                }

                const membershipStartDate = new Date(
                    getValues("originalMembershipStartDate")
                );

                if (!getValues("originalMembershipStartDate")) {
                    alert("시작 날짜를 골라주세요.");
                    setShowEndCalendar(false);
                    return;
                }
                if (membershipStartDate > data) {
                    alert("시작 날짜 이후의 날짜를 골라주세요.");
                    return;
                }
                setValue("originalMembershipEndDate", data);
            }
            setValue(value, GetDate(data));
            setShowMembershipEndCalendar(false);
            setShowMembershipStartCalendar(false);
        };

        return (
            <CalendarComponent>
                <ReactCalendar
                    calendarType="US"
                    onChange={membership ? onMembershipChange : onChange}
                    value={
                        membership
                            ? getValues(
                                  value === "membershipStartDate"
                                      ? "originalMembershipStartDate"
                                      : "originalEndDate"
                              )
                            : getValues(
                                  value === "startDate"
                                      ? "originalStartDate"
                                      : "originalMembershipEndDate"
                              )
                    }
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
        const {
            gender,
            name,
            originalEndDate,
            originalMembershipEndDate,
            originalMembershipStartDate,
            originalStartDate,
            phone,
            region,
            status,
        } = data;

        const startDate = new Date(originalStartDate);
        const endDate = new Date(originalEndDate);

        const membershipStartDate = new Date(originalMembershipStartDate);
        const membershipEndDate = new Date(originalMembershipEndDate);

        const sendData = {
            name: name ? name : null,
            phone: phone ? phone : null,
            gender: GENDER[gender],
            startDate: originalStartDate ? startDate : null,
            endDate: originalEndDate ? endDate : null,
            membershipStartDate: originalMembershipStartDate
                ? membershipStartDate
                : null,
            membershipEndDate: originalMembershipEndDate
                ? membershipEndDate
                : null,
            status: MEMBERSHIP_STATUS[status],
            region: region ? region : null,
        };

        console.log("sendData : ", sendData);

        await getMembershipUsers(sendData);
    };

    const columns = useMemo(() => MEMBERSHIP_TABLE_COL, []);

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="회원 관리" />
            <MainContentLayout
                // show={showDetail || showSubtractScreen ? false : true}
                show={true}
            >
                <form onSubmit={handleSubmit(onValid)}>
                    <>
                        <SearchContainer>
                            <SearchText>검색 조건 입력</SearchText>
                            <HorizontalTable>
                                <thead></thead>
                                <tbody>
                                    <tr>
                                        <th>회원명</th>
                                        <td>
                                            <input {...register("name")} />
                                        </td>
                                        <th>사업자번호</th>
                                        <td>
                                            <input />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>연락처</th>
                                        <td>
                                            <input
                                                {...register("phone")}
                                                placeholder="숫자만 입력"
                                            />
                                        </td>
                                        <th>성별</th>
                                        <td>
                                            <div>
                                                {Object.keys(GENDER).map(
                                                    (value, index) => (
                                                        <React.Fragment
                                                            key={index}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="gender"
                                                                value={value}
                                                                {...register(
                                                                    "gender"
                                                                )}
                                                                defaultChecked={
                                                                    index === 0
                                                                        ? true
                                                                        : false
                                                                }
                                                            />
                                                            {value === "all"
                                                                ? "전체"
                                                                : GENDER[
                                                                      value
                                                                  ] + "성"}
                                                            <Blank />
                                                        </React.Fragment>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>가입일자</th>
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
                                        <th>상태</th>
                                        <td>
                                            <select
                                                name="status"
                                                {...register("status")}
                                            >
                                                {Object.keys(
                                                    MEMBERSHIP_STATUS
                                                ).map((value, index) => (
                                                    <option
                                                        value={value}
                                                        key={index}
                                                    >
                                                        {value === "all"
                                                            ? "전체"
                                                            : MEMBERSHIP_STATUS[
                                                                  value
                                                              ]}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>정회원 전환일자</th>
                                        <td>
                                            <input
                                                disabled
                                                {...register(
                                                    "membershipStartDate"
                                                )}
                                            />
                                            <Blank />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowMembershipStartCalendar(
                                                        true
                                                    );
                                                }}
                                            >
                                                달력
                                            </button>
                                            {showMembershipStartCalendar ? (
                                                <Calendar value="membershipStartDate" />
                                            ) : null}
                                            <Blank />
                                            ~
                                            <Blank />
                                            <input
                                                disabled
                                                {...register(
                                                    "membershipEndDate"
                                                )}
                                            />
                                            <Blank />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowMembershipEndCalendar(
                                                        true
                                                    );
                                                }}
                                            >
                                                달력
                                            </button>
                                            {showMembershipEndCalendar ? (
                                                <Calendar value="membershipEndDate" />
                                            ) : null}
                                            <Blank />
                                            {watch("userType") === "company" ? (
                                                <select
                                                    name="workCategory"
                                                    {...register(
                                                        "workCategory"
                                                    )}
                                                >
                                                    {Object.keys(
                                                        WORK_CATEGORY
                                                    ).map((value, index) => (
                                                        <option
                                                            value={value}
                                                            key={index}
                                                        >
                                                            {value === "all"
                                                                ? "전체"
                                                                : WORK_CATEGORY_TEXT[
                                                                      value
                                                                  ]}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : null}
                                        </td>
                                        <th>접속지역</th>
                                        <td>
                                            <input {...register("region")} />
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
                                    명
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        // onClick={onSubtractPoint}
                                    >
                                        회비 차감
                                    </button>
                                    <Blank />
                                    <button
                                        type="button"
                                        // onClick={openDeleteUser}
                                    >
                                        데이터 삭제
                                    </button>
                                </div>
                            </ResultWrapper>
                            {tableData !== null ? (
                                <Table
                                    columns={columns}
                                    data={tableData}
                                    selectMode={true}
                                    selectedArr={(data) => setSelectedArr(data)}
                                />
                            ) : null}
                        </ResultContainer>
                    </>
                </form>
            </MainContentLayout>
        </MainLayout>
    );
}

export default ManageMembership;
