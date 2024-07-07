import MainLayout from "../../../components/Layout/MainLayout";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Table from "../../../components/Table/Table";
import Modal from "../../../components/Modal";
import { HorizontalTable } from "../../../components/Table/HorizontalTable";
import axios from "axios";
import {
    STATUS,
    USER_TYPE,
    WORK_CATEGORY,
    GENDER,
    SERVER,
    VALID,
    USER_TYPE_TEXT,
    WORK_CATEGORY_TEXT,
    GUGUPACK_STATUS,
    POINT_STATUS,
    POINT_BRAKEDOWN_TEXT,
    VEHICLE_TYPE,
    VEHICLE_TYPE_TEXT,
} from "../../../constant";
import {
    GetUserType,
    GetAge,
    GetDateTime,
    NumberWithComma,
    Reset,
    Reload,
    GetCalendarDateText,
} from "../../../utils/utils";
import { useForm } from "react-hook-form";
import PageTitle from "../../../components/PageTitle";
import { LinkText } from "../../../components/Text/LinkText";
import { Blank } from "../../../components/Blank";
import { Calendar as ReactCalendar } from "react-calendar";
import moment from "moment";
import MainContentLayout from "../../../components/Layout/MainContentLayout";
import DetailContentLayout from "../../../components/Layout/DetailContentLayout";
import { SEARCH_TABLE_COL } from "./table";
import SubtractScreen from "./SubtractScreen";
import { DefaultButton } from "../../../components/Button/DefaultButton";
import { PointButton } from "../../../components/Button/PointButton";
import UserDetails from "./UserDetails";
import "../../../components/Calendar/calendarStyle.css";
import { useContext } from "react";
import LoginContext from "../../../contexts/LoginContext";

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

function SearchUser() {
    const location = useLocation();
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const { adminInfo, permission } = useContext(LoginContext);
    const [showDetail, setShowDetail] = useState(false);
    const [showSubtractScreen, setShowSubtractScreen] = useState(false);

    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const [showPointModal, setShowPointModal] = useState(false);
    const [showGugupackModal, setShowGugupackModal] = useState(false);
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const [showVehiclePermissionModal, setShowVehiclePermissionModal] =
        useState(false);
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [showReservationBlockModal, setShowReservationBlockModal] =
        useState(false);

    const [userData, setUserData] = useState([]);
    const [userIndex, setUserIndex] = useState(null);
    const [tableData, setTableData] = useState(null);
    const [selectedArr, setSelectedArr] = useState([]);
    const [subtractUsers, setSubtractUsers] = useState([]);

    const [processing, setProcessing] = useState(false);

    const licenseRef = useRef();
    const vehiclePermissionRef = useRef();

    useEffect(() => {
        register("originalStartDate");
        register("originalEndDate");
        getUsers();
    }, []);

    const getUsers = async (data) => {
        try {
            const response = await axios.get(SERVER + "/admin/users", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
                params: {
                    ...(data && { ...data }),
                    ...(permission.functionPermissions.find(
                        (fnId) => fnId === "user_list"
                    ) === undefined && {
                        requestAdminId: adminInfo.id,
                        requestAdminPhone: adminInfo.userId,
                    }),
                },
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
                name: getName(index, value.name),
                signUpDate: GetDateTime(value.createdAt),
                age: GetAge(value.birth),
                gender: value.gender,
                phone: value.phone,
                userType: getUserType(value),
                reservationBlock:
                    value.userTypeId === 2
                        ? getReservationBlock(value.reservationBlock, index)
                        : null,
                license:
                    value.userTypeId === 1 ? "-" : getLicense(index, value),
                point: value.point
                    ? getPointButton(index, value.point.curPoint)
                    : "0AP",
                status: value.status,
                withdrawalDate: value.withdrawalDate
                    ? GetDateTime(value.withdrawalDate)
                    : "-",
                gugupack: getGugupackButton(index, value.gugupack),
            });
        });
        return result;
    };

    const getUserType = (value) => {
        return value.userTypeId === 1 ? (
            GetUserType(value.userTypeId)
        ) : value.userTypeId === 2 ? (
            <div>
                {GetUserType(value.userTypeId)}
                {value?.vehicle?.length > 0 ? (
                    <div>
                        {"("}
                        {value?.vehicle[0]?.vehicleTypeId === 3
                            ? value?.vehicle[0]?.craneType.type || ""
                            : value?.vehicle[0]?.type?.type || ""}
                        {" / "}
                        {value?.vehicle[0]?.vehicleTypeId === 1
                            ? value?.vehicle[0]?.floor.floor || ""
                            : value?.vehicle[0]?.vehicleTypeId === 2
                            ? value?.vehicle[0]?.weight.weight || ""
                            : value?.vehicle[0]?.vehicleCraneWeight.weight + ""}
                        {")"}
                    </div>
                ) : null}
                {value.membership ? <div>(정회원)</div> : null}
            </div>
        ) : (
            GetUserType(value.userTypeId) + ">" + value.workCategory?.name
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

    const getSelectedUsers = async () => {
        const result = [];

        selectedArr.map((d) => {
            result.push(userData[d.index]);
        });

        setSubtractUsers(result);
    };

    const getName = (index, name) => (
        <LinkText onClick={() => openDetail(index)}>{name}</LinkText>
    );

    const getLicense = (index, value) => {
        if (value.userTypeId === 2) {
            return (
                <div>
                    {!value.license && !value.vehiclePermission ? (
                        "미등록"
                    ) : (
                        <div>
                            <div>
                                <LinkText
                                    onClick={() => openLicenseModal(index)}
                                >
                                    {value.license ? "등록증" : null}
                                </LinkText>
                            </div>
                            <LinkText
                                onClick={() =>
                                    openVehiclePermissionModal(index)
                                }
                            >
                                {value.vehiclePermission ? "허가증" : null}
                            </LinkText>
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <LinkText onClick={() => openLicenseModal(index)}>
                    {value.license ? "등록증" : null}
                </LinkText>
            );
        }
    };

    const getPointButton = (index, point) => {
        // if(permission.functionPermission)
        if (
            permission.functionPermissions.find(
                (fnId) => fnId === "modify_point"
            ) === undefined
        )
            return <div>{NumberWithComma(point) + "AP"}</div>;
        return (
            <LinkText onClick={() => openPointModal(index)}>
                {NumberWithComma(point) + "AP"}
            </LinkText>
        );
    };

    const getGugupackButton = (index, isGugupackUser) =>
        isGugupackUser ? (
            <LinkText onClick={() => openGugupackModal(index)}>회원</LinkText>
        ) : (
            ""
        );

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

    const openDetail = (index) => {
        setShowDetail(true);
        setUserIndex(index);
    };

    const closeDetail = () => {
        setShowDetail(false);
        setUserIndex(null);
    };

    const openSubtractScreen = async () => {
        await getSelectedUsers();
        setShowSubtractScreen(true);
    };

    const closeSubtractScreen = () => {
        setShowSubtractScreen(false);
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

    const openPointModal = (index) => {
        setShowPointModal(true);
        setUserIndex(index);
    };
    const closePointModal = () => {
        setShowPointModal(false);
        setUserIndex(null);
        setValue("point", "");
        setValue("pointStatus", "0");
        setValue("pointsData", "0");
        setValue("pointsText", "");
    };

    const PointModal = () => (
        <Modal
            open={openPointModal}
            close={closePointModal}
            header="포인트 수정"
        >
            <HorizontalTable>
                <thead></thead>
                <tbody>
                    <tr>
                        <th>현재 포인트</th>
                        <td>
                            {NumberWithComma(
                                userData[userIndex].point.curPoint
                            ) + "AP"}
                        </td>
                    </tr>
                    <tr>
                        <th>금액</th>
                        <td>
                            <input
                                type="number"
                                {...register("point", "0")}
                            ></input>
                        </td>
                    </tr>
                    <tr>
                        <th>종류</th>
                        <td>
                            <select
                                name="pointStatus"
                                {...register("pointStatus", "0")}
                            >
                                {Object.keys(POINT_STATUS).map(
                                    (value, index) => (
                                        <option value={value} key={index}>
                                            {value === "none"
                                                ? "선택"
                                                : POINT_STATUS[value]}
                                        </option>
                                    )
                                )}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th>내역</th>
                        <td>
                            <select
                                name="pointsData"
                                {...register("pointsData", "0")}
                            >
                                {Object.keys(POINT_BRAKEDOWN_TEXT).map(
                                    (value, index) => (
                                        <option value={value} key={index}>
                                            {value === "0"
                                                ? "선택"
                                                : POINT_BRAKEDOWN_TEXT[value]}
                                        </option>
                                    )
                                )}
                            </select>
                            <Blank />
                            <input
                                disabled={watch("pointsData") !== "8"}
                                {...register("pointsText", "")}
                            ></input>
                        </td>
                    </tr>
                </tbody>
            </HorizontalTable>
            <button type="button" onClick={onModifyPoint}>
                포인트 수정 및 저장
            </button>
        </Modal>
    );

    const openLicenseModal = (index) => {
        setShowLicenseModal(true);
        setUserIndex(index);
    };
    const closeLicenseModal = () => {
        setShowLicenseModal(false);
        setUserIndex(null);
    };

    const LicenseModal = () => {
        return (
            <Modal
                open={openLicenseModal}
                close={closeLicenseModal}
                header="사업자 등록증"
            >
                <div>
                    <img
                        src={userData[userIndex].license}
                        style={{ width: "20vw" }}
                    />
                </div>
                <Buttons>
                    <input
                        ref={licenseRef}
                        type="file"
                        accept="image/*"
                        onChange={onModifyLicense}
                        style={{ display: "none" }}
                    />
                    <PointButton
                        type="button"
                        onClick={onClickModifyLicenseButton}
                        disabled={processing}
                    >
                        {processing ? "수정 중" : "수정"}
                    </PointButton>
                </Buttons>
            </Modal>
        );
    };

    const openVehiclePermissionModal = (index) => {
        setShowVehiclePermissionModal(true);
        setUserIndex(index);
    };
    const closeVehiclePermissionModal = () => {
        setShowVehiclePermissionModal(false);
        setUserIndex(null);
    };

    const VehiclePermissionModal = () => {
        console.log("permission : ", userData[userIndex].vehiclePermission);
        return (
            <Modal
                open={openVehiclePermissionModal}
                close={closeVehiclePermissionModal}
                header="화물자동차 운송사업 허가증"
            >
                <div>
                    <img
                        src={userData[userIndex].vehiclePermission}
                        style={{ width: "20vw" }}
                    />
                </div>
                <Buttons>
                    <input
                        ref={vehiclePermissionRef}
                        type="file"
                        accept="image/*"
                        onChange={onModifyVehiclePermission}
                        style={{ display: "none" }}
                    />
                    <PointButton
                        type="button"
                        onClick={onClickModifyVehiclePermissionButton}
                        disabled={processing}
                    >
                        {processing ? "수정 중" : "수정"}
                    </PointButton>
                </Buttons>
            </Modal>
        );
    };

    const openGugupackModal = (index) => {
        setShowGugupackModal(true);
        setUserIndex(index);
    };
    const closeGugupackModal = () => {
        setShowGugupackModal(false);
        setUserIndex(null);
    };

    const GugupackModal = () => (
        <Modal
            open={openGugupackModal}
            close={closeGugupackModal}
            header="구구팩 해제"
        >
            <div>해당 회원의 구구팩을 해제하시겠습니까?</div>
            <Blank />
            <div>
                {userData[userIndex].name} / {userData[userIndex].phone}
            </div>
            <Blank />
            <Blank />
            <div>
                <DefaultButton type="button" onClick={onUnsubscribeGugupack}>
                    해제하기
                </DefaultButton>
            </div>
        </Modal>
    );

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

    const onSubtractPoint = async () => {
        if (selectedArr.length === 0) return;

        openSubtractScreen();
    };

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

    const onClickModifyLicenseButton = useCallback(() => {
        if (!licenseRef.current) return;
        licenseRef.current.click();
    }, []);

    const onModifyLicense = useCallback(async (e) => {
        if (!e.target.files) return;

        setProcessing(true);

        console.log(e.target.files[0]);

        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        axios
            .post(
                SERVER + "/users/license",
                {
                    formData,
                },
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    transformRequest: [
                        function () {
                            return formData;
                        },
                    ],
                }
            )
            .then(({ data }) => {
                const {
                    data: { location },
                    result,
                } = data;
                if (result === VALID) {
                    console.log("license url : ", location);
                    onUploadLicenseUrl(location);
                }
            })
            .catch((error) => {
                console.log("onModifyLicense error : ", error);
            })
            .finally(() => {
                setProcessing(false);
            });
    });

    const onUploadLicenseUrl = async (url) => {
        try {
            const response = await axios.post(
                SERVER + `/admin/upload/license`,
                {
                    id: userData[userIndex].id,
                    url: url,
                }
            );

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                const {
                    data: {
                        data: { user },
                    },
                } = response;

                console.log("onUploadLicenseUrl valid");
                alert("이미지 수정에 성공하였습니다.");
                Reload();
            }
        } catch (error) {
            alert("이미지 수정에 실패하였습니다.");
            console.log("onUploadLicenseUrl invalid");
            console.log(error);
        } finally {
            // setUploading(false);
        }
    };

    const onClickModifyVehiclePermissionButton = useCallback(() => {
        if (!vehiclePermissionRef.current) return;
        vehiclePermissionRef.current.click();
    }, []);

    const onModifyVehiclePermission = useCallback(async (e) => {
        if (!e.target.files) return;

        setProcessing(true);

        console.log(e.target.files[0]);

        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        axios
            .post(
                SERVER + "/users/permission",
                {
                    formData,
                },
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    transformRequest: [
                        function () {
                            return formData;
                        },
                    ],
                }
            )
            .then(({ data }) => {
                const {
                    data: { location },
                    result,
                } = data;
                if (result === VALID) {
                    console.log("permission url : ", location);
                    onUploadVehiclePermissionUrl(location);
                }
            })
            .catch((error) => {
                console.log("onModifyVehiclePermission error : ", error);
            })
            .finally(() => {
                setProcessing(false);
            });
    });

    const onUploadVehiclePermissionUrl = async (url) => {
        try {
            const response = await axios.post(
                SERVER + `/admin/upload/permission`,
                {
                    id: userData[userIndex].id,
                    url: url,
                }
            );

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                const {
                    data: {
                        data: { user },
                    },
                } = response;

                console.log("onUploadVehiclePermissionUrl valid");
                alert("이미지 수정에 성공하였습니다.");
                Reload();
            }
        } catch (error) {
            alert("이미지 수정에 실패하였습니다.");
            console.log("onUploadVehiclePermissionUrl invalid");
            console.log(error);
        }
    };

    const onModifyPoint = async () => {
        const { point, pointStatus, pointsData, pointsText } = getValues();

        console.log("modify point : ", point);
        console.log("modify pointStatus : ", pointStatus);
        console.log("modify pointsData : ", pointsData);
        console.log("modify pointsText : ", pointsText);

        if (!point || point.length === 0 || Number(point) === 0) {
            alert("금액을 입력하세요.");
            return;
        }

        if (
            !pointStatus ||
            pointStatus.length === 0 ||
            pointStatus === "none"
        ) {
            alert("종류를 선택하세요.");
            return;
        }

        if (!pointsData || pointsData.length === 0 || pointsData === "0") {
            alert("포인트 내역을 선택하세요.");
            return;
        }

        if (pointsData === "8" && (!pointsText || pointsText.length === 0)) {
            alert("포인트 내역을 입력하세요.");
            return;
        }

        try {
            const response = await axios.patch(SERVER + "/admin/points", {
                pointId: userData[userIndex].point.id,
                curPoint: Number.parseInt(userData[userIndex].point.curPoint),
                points: Number.parseInt(point),
                type: pointStatus,
                content:
                    pointsData === "8"
                        ? pointsText
                        : POINT_BRAKEDOWN_TEXT[pointsData],
            });

            const {
                data: {
                    data: { points },
                    result,
                    msg,
                },
            } = response;

            if (result === VALID) {
                console.log("onModifyPoint valid");
                console.log(points);
                const prev1 = [...tableData];
                prev1[userIndex].point = getPointButton(
                    userIndex,
                    points.curPoint
                );
                setTableData([...prev1]);

                const prev2 = [...userData];
                prev2[userIndex].point.curPoint = points.curPoint;
                setUserData([...prev2]);

                closePointModal();
                alert("포인트 변경 및 내역 추가가 완료되었습니다.");
            } else {
                console.log("onModifyPoint invalid");
                alert("포인트 변경 및 내역 추가에 실패하였습니다.");
            }
        } catch (error) {
            console.log("onModifyPoint error : ", error);
            alert("포인트 변경 및 내역 추가에 실패하였습니다.");
        }
    };

    const onUnsubscribeGugupack = async () => {
        try {
            const response = await axios.post(
                SERVER + "/users/gugupack/cancel",
                {
                    id: userData[userIndex].id,
                }
            );

            const {
                data: {
                    data: { user },
                    result,
                },
            } = response;

            if (result === VALID) {
                console.log("onUnsubscribeGugupack valid");
                alert("구구팩 해지에 성공");

                if (getValues("gugupackStatus") === "member") {
                    const prev1 = [...tableData];
                    prev1.splice(userIndex, 1);
                    setTableData([...prev1]);

                    const prev2 = [...userData];
                    prev2.splice(userIndex, 1);
                    setUserData([...prev2]);
                } else {
                    const prev1 = [...tableData];
                    prev1[userIndex].gugupack = getGugupackButton(
                        userIndex,
                        false
                    );
                    setTableData([...prev1]);

                    const prev2 = [...userData];
                    prev2[userIndex].gugupack = false;
                    setUserData([...prev2]);
                }

                closeGugupackModal();
            } else {
                console.log("onUnsubscribeGugupack invalid");
                alert("해지 실패");
            }
        } catch (error) {
            console.log("onUnsubscribeGugupack error : ", error);
            alert("해지 실패");
        } finally {
        }
    };

    const onValid = async (data) => {
        const {
            gender,
            name,
            originalEndDate,
            originalStartDate,
            phone,
            status,
            userType,
            vehicleType,
            workCategory,
            gugupackStatus,
        } = data;

        const startDate = new Date(originalStartDate);
        const endDate = new Date(originalEndDate);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 0, 0);

        const sendData = {
            name: name ? name : null,
            phone: phone ? phone : null,
            gender: GENDER[gender],
            startDate: originalStartDate ? startDate : null,
            endDate: originalEndDate ? endDate : null,
            status: STATUS[status],
            userTypeId: USER_TYPE[userType],
            vehicleTypeId:
                USER_TYPE[userType] === 2 ? VEHICLE_TYPE[vehicleType] : null,
            workCategoryId:
                USER_TYPE[userType] === 3 ? WORK_CATEGORY[workCategory] : null,
            gugupackStatus:
                gugupackStatus && gugupackStatus !== "all"
                    ? gugupackStatus
                    : null,
        };

        console.log("sendData : ", sendData);

        await getUsers(sendData);
    };

    const columns = useMemo(() => SEARCH_TABLE_COL, []);

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="회원 관리" />
            <MainContentLayout
                show={showDetail || showSubtractScreen ? false : true}
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
                                                placeholder="숫자만 입력 (일부검색가능)"
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
                                                {Object.keys(STATUS).map(
                                                    (value, index) => (
                                                        <option
                                                            value={value}
                                                            key={index}
                                                        >
                                                            {value === "all"
                                                                ? "전체"
                                                                : STATUS[value]}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>구분</th>
                                        <td>
                                            <select
                                                name="userType"
                                                {...register("userType")}
                                            >
                                                {Object.keys(USER_TYPE).map(
                                                    (value, index) => (
                                                        <option
                                                            value={value}
                                                            key={index}
                                                        >
                                                            {value === "all"
                                                                ? "전체"
                                                                : USER_TYPE_TEXT[
                                                                      value
                                                                  ]}
                                                        </option>
                                                    )
                                                )}
                                            </select>
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
                                            {watch("userType") === "driver" ? (
                                                <select
                                                    name="vehicleType"
                                                    {...register("vehicleType")}
                                                >
                                                    {Object.keys(
                                                        VEHICLE_TYPE
                                                    ).map((value, index) => (
                                                        <option
                                                            value={value}
                                                            key={index}
                                                        >
                                                            {
                                                                VEHICLE_TYPE_TEXT[
                                                                    value
                                                                ]
                                                            }
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : null}
                                        </td>
                                        <th>구구팩 가입 여부</th>
                                        <td>
                                            <select
                                                name="gugupackStatus"
                                                {...register("gugupackStatus")}
                                            >
                                                {Object.keys(
                                                    GUGUPACK_STATUS
                                                ).map((value, index) => (
                                                    <option
                                                        value={value}
                                                        key={index}
                                                    >
                                                        {value === "all"
                                                            ? "전체"
                                                            : GUGUPACK_STATUS[
                                                                  value
                                                              ]}
                                                    </option>
                                                ))}
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
                                    명
                                </div>
                                <div>
                                    {/* <button
                                        type="button"
                                        onClick={() => {}}
                                        // onClick={onSubtractPoint}
                                        disabled
                                    >
                                        포인트 차감
                                    </button>
                                    <Blank /> */}
                                    <button
                                        type="button"
                                        onClick={openDeleteUser}
                                    >
                                        회원 탈퇴
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
                        {showPointModal ? <PointModal /> : null}
                        {showLicenseModal ? <LicenseModal /> : null}
                        {showVehiclePermissionModal ? (
                            <VehiclePermissionModal />
                        ) : null}
                        {showDeleteUserModal ? <DeleteUserModal /> : null}
                        {showGugupackModal ? <GugupackModal /> : null}
                        {showReservationBlockModal ? (
                            <ReservationBlockModal />
                        ) : null}
                    </>
                </form>
            </MainContentLayout>
            {showDetail && userIndex !== null ? (
                <DetailContentLayout>
                    <UserDetails
                        onClose={closeDetail}
                        data={userData[userIndex].id}
                    />
                </DetailContentLayout>
            ) : null}
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

export default SearchUser;
