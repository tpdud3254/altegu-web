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
import { SERVER, VALID } from "../../../constant";

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
    const [userData, setUserData] = useState(null);
    const [myRecommendData, setMyRecommendData] = useState(null);
    const [recommendData, setRecommendData] = useState(null);

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

    return (
        <>
            {userData ? (
                <Container>
                    <div style={{ width: "100%" }}>
                        <LinkText onClick={Reset}>작업정보 검색</LinkText> {">"}{" "}
                        회원상세정보
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
                                                        .floor)}
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
                </Container>
            ) : null}
        </>
    );
}

export default UserDetails;
