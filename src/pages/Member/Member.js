import styled from "styled-components";
import MainLayout from "../../components/Layout/MainLayout";
import PageTitle from "../../components/PageTitle";
import { MENU } from "../../utils/menus";
import { useParams } from "react-router-dom";
import SearchMembers from "./SearchMembers";
import WithdrawalMember from "./WithdrawalMember";

function Member() {
    const { submenuIndex } = useParams();

    console.log(submenuIndex); //TODOS:localstorage에 가지고있기
    return (
        <MainLayout menu={MENU.MEMBER} subMenuIndex={0}>
            <PageTitle title="회원 관리" />
            {submenuIndex === "0" ? <SearchMembers /> : <WithdrawalMember />}
        </MainLayout>
    );
}

Member.propTypes = {};
export default Member;
