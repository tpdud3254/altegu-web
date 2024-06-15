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

function ManageAdmin() {
    const location = useLocation();
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const [adminData, setAdminData] = useState([]);
    const [adminIndex, setAdminIndex] = useState(null);
    const [tableData, setTableData] = useState(null);
    const [selectedArr, setSelectedArr] = useState([]);

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
            <LinkText>활성화</LinkText>
        ) : (
            <LinkText>비활성화</LinkText>
        );
    };

    const columns = useMemo(() => ADMIN_TABLE_COL, []);

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="관리자 관리" />
            <MainContentLayout show>
                {tableData !== null ? (
                    <Table
                        columns={columns}
                        data={tableData}
                        selectMode={true}
                        selectedArr={(data) => setSelectedArr(data)}
                    />
                ) : null}
            </MainContentLayout>
        </MainLayout>
    );
}

export default ManageAdmin;
