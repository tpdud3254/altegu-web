import styled from "styled-components";
import MainLayout from "../../components/Layout/MainLayout";
import PageTitle from "../../components/PageTitle";
import { MENU } from "../../utils/menus";
import { useParams } from "react-router-dom";
import SearchMembers from "./SearchMembers";
import WithdrawalMember from "./WithdrawalMember";
import axios from "axios";
import { useEffect } from "react";

function Member() {
    const { submenuIndex } = useParams();

    useEffect(() => {
        axios({
            url: "http://localhost:4000/hi",
            method: "GET",
            header: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTP-8",
            },
            withCredentials: true,
        }).then(({ data }) => {
            console.log(data);
        });
    }, []);

    return (
        <MainLayout menu={MENU.MEMBER} submenuIndex={submenuIndex}>
            <PageTitle title="회원 관리" />
            {submenuIndex === "0" ? <SearchMembers /> : <WithdrawalMember />}
        </MainLayout>
    );
}

Member.propTypes = {};
export default Member;
