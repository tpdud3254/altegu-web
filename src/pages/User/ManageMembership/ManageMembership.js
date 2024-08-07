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
} from "../../../constant";
import {
    GetAge,
    GetCalendarDateText,
    GetDateTime,
    GetPhoneNumberWithDash,
    GetUserType,
    NumberWithComma,
    Reload,
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
import DetailContentLayout from "../../../components/Layout/DetailContentLayout";
import SubtractScreen from "./SubtractScreen";
import Modal from "../../../components/Modal";
import { DefaultButton } from "../../../components/Button/DefaultButton";
import { LinkText } from "../../../components/Text/LinkText";

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
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [showReservationBlockModal, setShowReservationBlockModal] =
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

    //BUG: 정회원 기사회원 검색하는거도 이상하고 조건에 맞으면 vehicle 데이터가 조회가 안되는 현상
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
                userType: getUserType(value),
                reservationBlock: getReservationBlock(
                    value.reservationBlock,
                    index
                ),
                point: value.point
                    ? NumberWithComma(value.point.curPoint) + "AP"
                    : "0AP",
                status: getStatus(value.membership, value.status, value.id),
                withdrawalMembershipDate: value.withdrawalMembershipDate
                    ? GetDateTime(value.withdrawalMembershipDate)
                    : "-",
            });
        });
        return result;
    };

    const getUserType = (value) => {
        return (
            <div>
                {GetUserType(value.userTypeId)}
                {value?.vehicle?.length > 0 ? (
                    <div>
                        {"("}
                        {value?.vehicle[0]?.vehicleTypeId === 3
                            ? value?.vehicle[0]?.craneType?.type || ""
                            : value?.vehicle[0]?.type?.type || ""}
                        {" / "}
                        {value?.vehicle[0]?.vehicleTypeId === 1
                            ? value?.vehicle[0]?.floor?.floor || ""
                            : value?.vehicle[0]?.vehicleTypeId === 2
                            ? value?.vehicle[0]?.weight?.weight || ""
                            : value?.vehicle[0]?.vehicleCraneWeight?.weight +
                              ""}
                        {")"}
                    </div>
                ) : null}
            </div>
        );
    };

    const getReservationBlock = (block, index) => (
        <div
            onClick={() => openReservationBlock(index)}
            style={{
                textDecoration: "underline",
                fontWeight: block ? 600 : 400,
                color: block ? "red" : "green",
                cursor: "pointer",
            }}
        >
            {block ? "임시중지" : "정상"}
        </div>
    );

    const getStatus = (membership, status, id) => {
        if (membership)
            return (
                <LinkText onClick={() => cancelMembership(id)}>정회원</LinkText>
            );
        else if (status === "정상")
            return (
                <LinkText onClick={() => confirmMembership(id)}>
                    기사회원
                </LinkText>
            );
        else return status;
    };

    const cancelMembership = async (id) => {
        try {
            const response = await axios.patch(
                SERVER + "/admin/users/membership/cancel",
                {
                    id,
                }
            );

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                alert("정회원 수정에 성공하였습니다.");
                getMembershipUsers();
            } else {
                alert("정회원 수정에 실패하였습니다.");
            }
        } catch (error) {
            alert("정회원 수정에 실패하였습니다.");

            console.log("error : ", error);
        }
    };

    const confirmMembership = async (id) => {
        try {
            const response = await axios.patch(
                SERVER + "/admin/users/membership/confirm",
                {
                    id,
                }
            );

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                alert("정회원 수정에 성공하였습니다.");
                getMembershipUsers();
            } else {
                alert("정회원 수정에 실패하였습니다.");
            }
        } catch (error) {
            alert("정회원 수정에 실패하였습니다.");

            console.log("error : ", error);
        }
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

    const getSelectedUsers = async () => {
        const result = [];

        selectedArr.map((d) => {
            result.push(userData[d.index]);
        });

        setSubtractUsers(result);
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

                if (!getValues("originalMembershipStartDate")) {
                    alert("시작 날짜를 골라주세요.");
                    setShowEndCalendar(false);
                    return;
                }

                const membershipStartDate = new Date(
                    getValues("originalMembershipStartDate")
                );

                if (membershipStartDate > data) {
                    alert("시작 날짜 이후의 날짜를 골라주세요.");
                    return;
                }

                const endDate = new Date(data);
                endDate.setHours(23, 59, 0, 0);
                setValue("originalMembershipEndDate", endDate);
            }
            setValue(value, GetCalendarDateText(data));
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

    const openSubtractScreen = async () => {
        await getSelectedUsers();
        setShowSubtractScreen(true);
    };

    const closeSubtractScreen = () => {
        setShowSubtractScreen(false);
    };

    const onSubtractPoint = async () => {
        if (selectedArr.length === 0) return;

        openSubtractScreen();
    };

    const closeReservationBlockModal = () => {
        setUserIndex(null);
        setShowReservationBlockModal(false);
    };

    const openReservationBlock = (index) => {
        setUserIndex(index);
        setShowReservationBlockModal(true);
    };

    const ReservationBlockModal = () => (
        <Modal
            open={openReservationBlock}
            close={closeReservationBlockModal}
            header="임시중지 여부 수정"
        >
            <div style={{ fontWeight: "600", paddingBottom: 5 }}>
                회원코드 : {userData[userIndex].id}
            </div>
            <div style={{ fontWeight: "600", paddingBottom: 5 }}>
                이름 : {userData[userIndex].name}
            </div>
            <div style={{ fontWeight: "600", paddingBottom: 5 }}>
                연락처 : {userData[userIndex].phone}
            </div>
            <div style={{ marginTop: 20, marginBottom: 20 }}>
                {userData[userIndex].reservationBlock
                    ? "'정상' 상태로 변경하시겠습니까?"
                    : "'이용중지' 상태로 변경하시겠습니까?"}
            </div>
            <DefaultButton type="button" onClick={onSetReservationBlock}>
                변경하기
            </DefaultButton>
        </Modal>
    );

    const onSetReservationBlock = async () => {
        const userId = userData[userIndex].id;

        console.log(userId);

        try {
            const response = await axios.patch(SERVER + "/admin/user/block", {
                id: userId,
                blockStatus: userData[userIndex].reservationBlock
                    ? false
                    : true,
            });

            const {
                data: {
                    data: { user },
                    result,
                    msg,
                },
            } = response;

            console.log(user);

            if (result === VALID) {
                console.log("onSetReservationBlock valid");
                Reload();
                setUserIndex(null);
                closeReservationBlockModal();
            } else {
                console.log("onSetReservationBlock invalid");
                alert("임시중지 상태 변경에 실패하였습니다.");
            }
        } catch (error) {
            alert("임시중지 상태 변경에 실패하였습니다.");
            console.log("onSetReservationBlock error : ", error);
        }
    };

    const openDeleteUserModal = async () => {
        await getSelectedUsers();
        setShowDeleteUserModal(true);
    };

    const closeDeleteUserModal = () => {
        setShowDeleteUserModal(false);
    };

    const openDeleteUser = async () => {
        if (selectedArr.length === 0) return;

        openDeleteUserModal();
    };

    const DeleteUserModal = () => (
        <Modal
            open={openDeleteUserModal}
            close={closeDeleteUserModal}
            header="유저 삭제"
        >
            <div style={{ color: "red", fontWeight: "600", paddingBottom: 10 }}>
                삭제한 유저는 모든 정보가 영구히 삭제되기 때문에
                {"\n"}다시 복구 될 수 없습니다.
            </div>
            <div style={{ marginBottom: 20 }}>진행하시겠습니까?</div>
            <DefaultButton type="button" onClick={onDeleteUser}>
                삭제하기
            </DefaultButton>
        </Modal>
    );

    const onDeleteUser = async () => {
        const userList = [];

        console.log("selected : ", selectedArr);

        selectedArr.map((data) => {
            userList.push({
                userId: userData[data.index].id,
                pointId: userData[data.index]?.point?.id || null,
            });
        });
        console.log(userList);

        try {
            const response = await axios.delete(
                SERVER + "/admin/users/delete",
                {
                    data: {
                        userList,
                    },
                }
            );

            const {
                data: {
                    data: { user },
                    result,
                    msg,
                },
            } = response;

            console.log(user);

            if (result === VALID) {
                console.log("onDeleteUser valid");

                alert("유저 삭제에 성공하였습니다.");
                Reload();
                setSelectedArr([]);
                closeDeleteUserModal();
            }
        } catch (error) {}
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

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 0, 0);

        membershipStartDate.setHours(0, 0, 0, 0);
        membershipEndDate.setHours(23, 59, 0, 0);

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
            // ...(status === "membership" || status === "normal"
            //     ? { membership: status }
            //     : { status: MEMBERSHIP_STATUS[status] || null }),
            region: region ? region : null,
        };

        console.log("sendData : ", sendData);

        await getMembershipUsers(sendData);
    };

    const columns = useMemo(() => MEMBERSHIP_TABLE_COL, []);

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="회원 관리" />
            <MainContentLayout show={showSubtractScreen ? false : true}>
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
                                <div>
                                    <button
                                        type="button"
                                        onClick={onSubtractPoint}
                                    >
                                        회비 차감
                                    </button>
                                    <Blank />
                                    <button
                                        type="button"
                                        onClick={openDeleteUser}
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
                        {showDeleteUserModal ? <DeleteUserModal /> : null}
                        {showReservationBlockModal ? (
                            <ReservationBlockModal />
                        ) : null}
                    </>
                </form>
            </MainContentLayout>
            {showSubtractScreen && subtractUsers.length > 0 ? (
                <DetailContentLayout>
                    <SubtractScreen
                        onClose={closeSubtractScreen}
                        data={subtractUsers}
                    />
                </DetailContentLayout>
            ) : null}
        </MainLayout>
    );
}

export default ManageMembership;
