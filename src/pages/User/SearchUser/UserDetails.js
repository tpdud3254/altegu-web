import { useCallback, useEffect, useRef } from "react";
import { useState } from "react";
import styled from "styled-components";
import {
    CheckPassword,
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
import { Blank } from "../../../components/Blank";
import { PointButton } from "../../../components/Button/PointButton";
import { LinkText } from "../../../components/Text/LinkText";
import { HorizontalTable } from "../../../components/Table/HorizontalTable";
import axios from "axios";
import { SERVER, VALID } from "../../../contant";
import Modal from "../../../components/Modal";

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

    const [password, setPassword] = useState("");

    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const [showVehiclePermissionModal, setShowVehiclePermissionModal] =
        useState(false);

    const [processing, setProcessing] = useState(false);

    const licenseRef = useRef();
    const vehiclePermissionRef = useRef();

    useEffect(() => {
        getUsers(data);
    }, []);

    console.log(password);

    const getUsers = async (data) => {
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

                console.log("getUsers invalid");
                setUserData([]);
            }
        } catch (error) {
            console.log("getUsers error : ", error);
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

    const onModifyPassword = async () => {
        if (!CheckPassword(password)) {
            alert("비밀번호가 조건에 맞지 않습니다.");
            return;
        }

        try {
            const response = await axios.post(SERVER + "/users/password", {
                phone: userData.phone,
                password,
            });

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                alert("비밀번호가 변경 되었습니다.");
                setPassword("");
            }
        } catch (error) {
            alert("비밀번호가 변경에 실패하였었습니다.");
        }
    };

    const openLicenseModal = () => {
        setShowLicenseModal(true);
    };
    const closeLicenseModal = () => {
        setShowLicenseModal(false);
    };

    const LicenseModal = () => {
        return (
            <Modal
                open={openLicenseModal}
                close={closeLicenseModal}
                header="사업자 등록증"
            >
                <div>
                    <img src={userData.license} style={{ width: "20vw" }} />
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
    };
    const closeVehiclePermissionModal = () => {
        setShowVehiclePermissionModal(false);
    };

    const VehiclePermissionModal = () => {
        console.log("permission : ", userData.vehiclePermission);
        return (
            <Modal
                open={openVehiclePermissionModal}
                close={closeVehiclePermissionModal}
                header="화물자동차 운송사업 허가증"
            >
                <div>
                    <img
                        src={userData.vehiclePermission}
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
                    id: userData.id,
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
                closeLicenseModal();
                userData.license = url;
                alert("이미지 수정에 성공하였습니다.");
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
                    id: userData.id,
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
                closeVehiclePermissionModal();
                userData.vehiclePermission = url;
                alert("이미지 수정에 성공하였습니다.");
            }
        } catch (error) {
            alert("이미지 수정에 실패하였습니다.");
            console.log("onUploadVehiclePermissionUrl invalid");
            console.log(error);
        }
    };

    const columns = useMemo(() => RECOMMEND_TABLE_COL, []);

    return (
        <>
            {userData ? (
                <Container>
                    <div style={{ width: "100%" }}>
                        <LinkText onClick={Reset}>회원정보 검색</LinkText> {">"}{" "}
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
                                    <th>비밀번호 수정</th>
                                    <td>
                                        <input
                                            type="text"
                                            placeholder="영문, 숫자를 포함한 8자 이상"
                                            style={{ width: "15vw" }}
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                        />
                                        <Blank />
                                        <PointButton
                                            type="button"
                                            onClick={onModifyPassword}
                                        >
                                            수정
                                        </PointButton>
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
                                            <PointButton
                                                type="button"
                                                onClick={openLicenseModal}
                                            >
                                                수정
                                            </PointButton>
                                        </div>
                                        <div>
                                            화물운송허가증{" "}
                                            {userData.vehiclePermission
                                                ? "있음  "
                                                : "없음  "}
                                            <PointButton
                                                type="button"
                                                onClick={
                                                    openVehiclePermissionModal
                                                }
                                            >
                                                수정
                                            </PointButton>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>차량번호</th>
                                    <td>
                                        {userData.vehicle.length === 0
                                            ? ""
                                            : userData.vehicle[0].number}
                                        <Blank />
                                        <PointButton type="button">
                                            수정
                                        </PointButton>
                                    </td>
                                    <th>차량종류</th>
                                    <td>
                                        {userData.vehicle.length === 0
                                            ? ""
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
                                    <th>전화번호</th>
                                    <td>
                                        {GetPhoneNumberWithDash(userData.phone)}
                                    </td>
                                    <th>추천인 지정</th>
                                    <td>
                                        <input placeholder="전화번호/회원코드 입력" />
                                        <Blank />
                                        <PointButton type="button">
                                            저장
                                        </PointButton>
                                    </td>
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
                    {showLicenseModal ? <LicenseModal /> : null}
                    {showVehiclePermissionModal ? (
                        <VehiclePermissionModal />
                    ) : null}
                </Container>
            ) : null}
        </>
    );
}

export default UserDetails;
