import { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import {
    GetAge,
    GetDate,
    GetDateTime,
    GetPhoneNumberWithDash,
    GetUserType,
    NumberWithComma,
    Reset,
} from "../../../utils/utils";
import { useMemo } from "react";
import { RECOMMEND_TABLE_COL } from "./table";
import Table from "../../../components/Table/Table";
import { LinkText } from "../../../components/Text/LinkText";
import { HorizontalTable } from "../../../components/Table/HorizontalTable";
import axios from "axios";
import {
    POINT_BRAKEDOWN_TEXT,
    POINT_STATUS,
    SERVER,
    VALID,
} from "../../../constant";
import { DefaultButton } from "../../../components/Button/DefaultButton";
import { Blank } from "../../../components/Blank";
import Modal from "../../../components/Modal";
import { useForm } from "react-hook-form";
import LoginContext from "../../../contexts/LoginContext";
import { useContext } from "react";

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
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

const Buttons = styled.div`
    padding-top: 30px;
`;

function UserDetails({ data, onClose }) {
    const { permission } = useContext(LoginContext);

    const [userData, setUserData] = useState(null);
    const [myRecommendData, setMyRecommendData] = useState(null);
    const [recommendData, setRecommendData] = useState(null);

    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const [showPointModal, setShowPointModal] = useState(false);

    useEffect(() => {
        getUser(data);
    }, []);

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
                const {
                    data: {
                        data: { users },
                    },
                } = response;
                console.log("getUser valid : ", users);

                setUserData(users);
                setMyRecommendData(getTableData(users.myRecommendUser));
                setRecommendData(getTableData(users.recommendUserList));
            } else {
                const {
                    data: { msg },
                } = response;

                console.log("getUser invalid");
                setUserData([]);
            }
        } catch (error) {
            console.log("getUser error : ", error);
        }
    };

    const getTableData = (data) => {
        console.log("getTableData : ", data);
        if (data.length === 0) return [];

        const result = [];
        data.map((value, index) => {
            if (value.id === 1) {
                result.push({
                    userId: "-",
                    name: value.name,
                    signUpDate: "-",
                    age: "-",
                    gender: "-",
                    phone: "-",
                    userType: "-",
                    region: "-",
                    curPoint: "-",
                    status: "-",
                    withdrawalDate: "-",
                });
            } else {
                result.push({
                    userId: value.id,
                    name: value.name,
                    signUpDate: GetDateTime(value.createdAt),
                    age: GetAge(value.birth),
                    gender: value.gender,
                    phone: value.phone,
                    userType:
                        value.userTypeId === 3
                            ? GetUserType(value.userTypeId) +
                              ">" +
                              value.workCategory.name
                            : GetUserType(value.userTypeId),
                    region: value.accessedRegion,
                    curPoint: value.point
                        ? NumberWithComma(value.point.curPoint) + "AP"
                        : "0AP",
                    status: value.status,
                    withdrawalDate: value.withdrawalDate
                        ? GetDateTime(value.withdrawalDate)
                        : "-",
                });
            }
        });
        return result;
    };

    const columns = useMemo(() => RECOMMEND_TABLE_COL, []);

    const openPointModal = (index) => {
        setShowPointModal(true);
    };
    const closePointModal = () => {
        setShowPointModal(false);
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
                            {NumberWithComma(userData.point.curPoint) + "AP"}
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
                pointId: userData.point.id,
                curPoint: Number.parseInt(userData.point.curPoint),
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

                const prev1 = userData;
                prev1.point.curPoint = points.curPoint;
                setUserData(prev1);

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

    return (
        <>
            {userData ? (
                <Container>
                    <div style={{ width: "100%" }}>
                        <LinkText onClick={onClose}>작업정보 검색</LinkText>{" "}
                        {">"} 회원상세정보
                    </div>
                    <Wrapper>
                        <Title>기본정보</Title>
                        <HorizontalTable>
                            <thead></thead>
                            <tbody>
                                <tr>
                                    <th>회원코드</th>
                                    <td>{userData.id}</td>
                                    <th>가입일</th>
                                    <td>20{GetDate(userData.createdAt)}</td>
                                </tr>
                                <tr>
                                    <th>상태</th>
                                    <td>{userData.status}</td>
                                    <th>회원 구분</th>
                                    <td>
                                        {userData.userTypeId === 3
                                            ? GetUserType(userData.userTypeId) +
                                              ">" +
                                              userData.workCategory.name
                                            : GetUserType(userData.userTypeId) +
                                              (userData.membership
                                                  ? " (정회원)"
                                                  : "")}
                                    </td>
                                </tr>
                                <tr>
                                    <th>회원 ID</th>
                                    <td>{userData.phone}</td>
                                    <th>전화번호</th>
                                    <td>
                                        {GetPhoneNumberWithDash(userData.phone)}
                                    </td>
                                </tr>

                                <tr>
                                    <th>보유포인트</th>
                                    <td>
                                        {userData.point
                                            ? NumberWithComma(
                                                  userData.point.curPoint
                                              ) + "AP"
                                            : "0AP"}
                                        <Blank />
                                        {permission.functionPermissions.find(
                                            (fnId) => fnId === "modify_point"
                                        ) === undefined ? null : (
                                            <DefaultButton
                                                onClick={openPointModal}
                                            >
                                                변경
                                            </DefaultButton>
                                        )}
                                    </td>
                                    <th>
                                        사업자 등록증/
                                        <br />
                                        화물운송허가증
                                    </th>
                                    <td>
                                        <div>
                                            사업자 등록증{" "}
                                            {userData.license
                                                ? "있음  "
                                                : "없음  "}
                                        </div>
                                        <div>
                                            화물운송허가증{" "}
                                            {userData.vehiclePermission
                                                ? "있음  "
                                                : "없음  "}
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>차량번호</th>
                                    <td>
                                        {userData.vehicle.length === 0
                                            ? "-"
                                            : userData.vehicle[0].number}
                                    </td>
                                    <th>차량종류</th>
                                    <td>
                                        {userData.vehicle.length === 0
                                            ? "-"
                                            : userData.vehicle[0].type.type +
                                              " / " +
                                              (userData.vehicle[0].weight
                                                  ? userData.vehicle[0].weight
                                                        .weight
                                                  : userData.vehicle[0].floor
                                                  ? userData.vehicle[0].floor
                                                        .floor
                                                  : userData.vehicle[0]
                                                        .vehicleCraneWeight
                                                        .weight)}
                                    </td>
                                </tr>
                                <tr>
                                    <th>이름(실명)</th>
                                    <td>{userData.name}</td>
                                    <th>생년월일</th>
                                    <td>{userData.birth}</td>
                                </tr>
                                <tr>
                                    <th>은행/예금주</th>
                                    <td>
                                        {userData.point
                                            ? userData.point.bank
                                                ? userData.point.bank +
                                                  " / " +
                                                  userData.point.accountName
                                                : ""
                                            : ""}
                                    </td>
                                    <th>성별</th>
                                    <td>{userData.gender}</td>
                                </tr>
                                <tr>
                                    <th>계좌번호</th>
                                    <td>
                                        {userData.point
                                            ? userData.point.accountNumber
                                                ? userData.point.accountNumber
                                                : ""
                                            : ""}
                                    </td>
                                    <th>작업지역</th>
                                    <td>
                                        {userData.workRegion.length === 0
                                            ? ""
                                            : userData.workRegion.map(
                                                  (value, index) =>
                                                      index ===
                                                      userData.workRegion
                                                          .length -
                                                          1
                                                          ? value.region
                                                          : value.region + " / "
                                              )}
                                    </td>
                                </tr>
                            </tbody>
                        </HorizontalTable>
                    </Wrapper>
                    <Wrapper>
                        <Title>내가 입력한 추천인</Title>
                        <div style={{ paddingTop: 10 }}>
                            {myRecommendData !== null ? (
                                <Table
                                    columns={columns}
                                    data={myRecommendData}
                                    pagenationMode={false}
                                />
                            ) : null}
                        </div>
                    </Wrapper>
                    <Wrapper>
                        <Title>나를 입력한 회원</Title>
                        <div style={{ paddingTop: 10 }}>
                            {recommendData !== null ? (
                                <Table
                                    columns={columns}
                                    data={recommendData}
                                    pagenationMode={false}
                                />
                            ) : null}
                        </div>
                    </Wrapper>
                    {showPointModal ? <PointModal /> : null}
                </Container>
            ) : null}
        </>
    );
}

export default UserDetails;
