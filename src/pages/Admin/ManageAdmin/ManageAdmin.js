import styled from "styled-components";
import { useLocation } from "react-router-dom";
import MainLayout from "../../../components/Layout/MainLayout";
import PageTitle from "../../../components/PageTitle";
import MainContentLayout from "../../../components/Layout/MainContentLayout";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { SERVER, VALID } from "../../../constant";
import { GetDateTime, GetPhoneNumberWithDash } from "../../../utils/utils";
import { ADMIN_TABLE_COL } from "./table";
import Table from "../../../components/Table/Table";
import { LinkText } from "../../../components/Text/LinkText";
import { DefaultButton } from "../../../components/Button/DefaultButton";
import { Blank } from "../../../components/Blank";
import Modal from "../../../components/Modal";

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    padding-top: 30px;
`;

function ManageAdmin() {
    const location = useLocation();
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const [adminData, setAdminData] = useState([]);
    const [adminIndex, setAdminIndex] = useState(null);
    const [tableData, setTableData] = useState(null);
    const [selectedArr, setSelectedArr] = useState([]);

    const [showStatusModal, setShowStatusModal] = useState(false);

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
                console.log(list);
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

    const StatusModal = () => {
        return (
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
    };
    const toggleStatus = async (curStatus) => {
        console.log("curStatus : ", adminData[adminIndex].status);
        console.log("adminIndex : ", adminIndex);
        console.log("admin id : ", adminData[adminIndex].id);

        try {
            const response = await axios.patch(SERVER + "/admin/status", {
                status: adminData[adminIndex].status === true ? false : true,
                adminId: adminData[adminIndex].id,
            });

            console.log(response);

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

    const columns = useMemo(() => ADMIN_TABLE_COL, []);

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="관리자 관리" />
            <MainContentLayout show>
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
                        <DefaultButton>수정</DefaultButton>
                        <Blank />
                        <DefaultButton>삭제</DefaultButton>
                    </Wrapper>
                    {showStatusModal ? <StatusModal /> : null}
                </>
            </MainContentLayout>
        </MainLayout>
    );
}

export default ManageAdmin;
