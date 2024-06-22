import styled from "styled-components";
import { useLocation } from "react-router-dom";
import MainLayout from "../../../components/Layout/MainLayout";
import PageTitle from "../../../components/PageTitle";
import MainContentLayout from "../../../components/Layout/MainContentLayout";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { SERVER, VALID } from "../../../constant";
import {
    GetDateTime,
    GetPhoneNumberWithDash,
    Reload,
} from "../../../utils/utils";
import { ADMIN_TABLE_COL } from "./table";
import Table from "../../../components/Table/Table";
import { LinkText } from "../../../components/Text/LinkText";
import { DefaultButton } from "../../../components/Button/DefaultButton";
import { Blank } from "../../../components/Blank";
import Modal from "../../../components/Modal";
import DetailContentLayout from "../../../components/Layout/DetailContentLayout";
import ModifyAdmin from "./ModifyAdmin";

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    padding-top: 30px;
`;

function ManageAdmin() {
    const location = useLocation();

    const [adminData, setAdminData] = useState([]);
    const [adminIndex, setAdminIndex] = useState(null);
    const [tableData, setTableData] = useState(null);
    const [selectedArr, setSelectedArr] = useState([]);

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [showModifyScreen, setShowModifyScreen] = useState(false);

    useEffect(() => {
        getAdmin();
    }, []);

    const getAdmin = async () => {
        try {
            const response = await axios.get(SERVER + "/admin/list");

            const {
                data: {
                    result,
                    data: { list },
                },
            } = response;

            if (result === VALID) {
                // console.log(list);
                setAdminData(list);
                setTableData(getTableData(list));
            } else {
                setAdminData([]);
            }
        } catch (error) {
            console.log("getAdmin error : ", error);
        }
    };

    const getTableData = (data) => {
        const result = [];
        data.map((value, index) => {
            result.push({
                phone: GetPhoneNumberWithDash(value.userId),
                name: value.name,
                position: value.position.position,
                signUpDate: GetDateTime(value.createdAt),
                idNumber: value.idNumber,
                bankAccount: value.bank + " " + value.bankAccountNumber,
                telecom: value.telecom.value,
                status: getStatusButton(value.status, index),
            });
        });
        return result;
    };

    const saveTableData = (index, data) => {
        const prev = [...tableData];
        prev[index] = {
            phone: GetPhoneNumberWithDash(data.userId),
            name: data.name,
            position: data.position.position,
            signUpDate: GetDateTime(data.createdAt),
            idNumber: data.idNumber,
            bankAccount: data.bank + " " + data.bankAccountNumber,
            telecom: data.telecom.value,
            status: getStatusButton(data.status, index),
        };
        setTableData([...prev]);
    };

    const getStatusButton = (status, index) => {
        return status ? (
            <LinkText onClick={() => openStatusModal(index)}>활성화</LinkText>
        ) : (
            <LinkText onClick={() => openStatusModal(index)}>비활성화</LinkText>
        );
    };

    const openStatusModal = (index) => {
        setAdminIndex(index);
        setShowStatusModal(true);
    };

    const closeStatusModal = () => {
        setAdminIndex(null);
        setShowStatusModal(false);
    };

    const StatusModal = () => (
        <Modal
            open={openStatusModal}
            close={closeStatusModal}
            header="권한 수정"
        >
            <div style={{ fontWeight: "600", paddingBottom: 5 }}>
                연락처 : {adminData[adminIndex].userId}
            </div>
            <div style={{ fontWeight: "600", paddingBottom: 5 }}>
                이름 : {adminData[adminIndex].name}
            </div>
            <div style={{ marginTop: 20, marginBottom: 20 }}>
                {adminData[adminIndex].status
                    ? "'비활성화' 상태로 변경하시겠습니까?"
                    : "'활성화' 상태로 변경하시겠습니까?"}
            </div>
            <DefaultButton type="button" onClick={toggleStatus}>
                변경하기
            </DefaultButton>
        </Modal>
    );

    const toggleStatus = async () => {
        try {
            const response = await axios.patch(SERVER + "/admin/status", {
                status: adminData[adminIndex].status === true ? false : true,
                adminId: adminData[adminIndex].id,
            });

            // console.log(response);

            const {
                data: {
                    result,
                    data: { admin },
                },
            } = response;

            if (result === VALID) {
                const prev1 = [...tableData];
                prev1[adminIndex].status = getStatusButton(
                    admin.status,
                    adminIndex
                );
                setTableData([...prev1]);

                const prev2 = [...adminData];
                prev2[adminIndex].status = admin.status;
                setAdminData([...prev2]);
            } else {
                console.log("toggleStatus invalid");
                alert("관리자 권한 설정에 실패하였습니다.");
            }
        } catch (error) {
            console.log("toggleStatus error : ", error);
            alert("관리자 권한 설정에 실패하였습니다.");
        } finally {
            closeStatusModal();
        }
    };

    const openDeleteUserModal = async () => {
        if (selectedArr.length === 0) {
            alert("한개 이상의 데이터를 선택해주세요.");
            return;
        }

        setShowDeleteUserModal(true);
    };

    const closeDeleteUserModal = () => {
        setShowDeleteUserModal(false);
    };

    const onDeleteUser = async () => {
        const adminList = [];

        selectedArr.map((data) => {
            adminList.push(adminData[data.index].id);
        });

        // console.log("adminList : ", adminList);

        try {
            const response = await axios.delete(SERVER + "/admin/delete", {
                data: {
                    adminList,
                },
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
                console.log("onDeleteUser valid");

                alert("유저 삭제에 성공하였습니다.");
                Reload();
                setSelectedArr([]);
                closeDeleteUserModal();
            }
        } catch (error) {}
    };

    const DeleteUserModal = () => (
        <Modal
            open={openDeleteUserModal}
            close={closeDeleteUserModal}
            header="관리자 삭제"
        >
            <div style={{ color: "red", fontWeight: "600", paddingBottom: 10 }}>
                삭제한 관리자는 모든 정보가 영구히 삭제되기 때문에
                {"\n"}다시 복구 될 수 없습니다.
            </div>
            <div style={{ marginBottom: 20 }}>진행하시겠습니까?</div>
            <DefaultButton type="button" onClick={onDeleteUser}>
                삭제하기
            </DefaultButton>
        </Modal>
    );

    const onModifyAdmin = async () => {
        if (selectedArr.length !== 1) {
            alert("한명의 관리자만 선택해주세요.");
            return;
        }

        openModifyScreen();
    };

    const openModifyScreen = () => {
        setAdminIndex(selectedArr[0].index);
        setShowModifyScreen(true);
    };

    const closeModifyScreen = (result) => {
        if (result) {
            const prev = [...adminData];
            prev[adminIndex] = result;
            setAdminData([...prev]);

            saveTableData(result);
        }
        setAdminIndex(null);
        setShowModifyScreen(false);
    };

    const columns = useMemo(() => ADMIN_TABLE_COL, []);

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="관리자 관리" />
            <MainContentLayout show={showModifyScreen ? false : true}>
                <>
                    {tableData !== null ? (
                        <Table
                            columns={columns}
                            data={tableData}
                            selectMode={true}
                            selectedArr={(data) => setSelectedArr(data)}
                        />
                    ) : null}
                    <Wrapper>
                        <DefaultButton onClick={onModifyAdmin}>
                            수정
                        </DefaultButton>
                        <Blank />
                        <DefaultButton onClick={openDeleteUserModal}>
                            삭제
                        </DefaultButton>
                    </Wrapper>
                    {showStatusModal ? <StatusModal /> : null}
                    {showDeleteUserModal ? <DeleteUserModal /> : null}
                </>
            </MainContentLayout>
            {showModifyScreen ? (
                <DetailContentLayout>
                    <ModifyAdmin
                        onClose={closeModifyScreen}
                        data={{
                            ...selectedArr[0],
                            permission: adminData[adminIndex].permission,
                            bankAccountName:
                                adminData[adminIndex].bankAccountName,
                        }}
                    />
                </DetailContentLayout>
            ) : null}
        </MainLayout>
    );
}

export default ManageAdmin;
