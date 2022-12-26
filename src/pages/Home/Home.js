import styled from "styled-components";
import PropTypes from "prop-types";
import MainLayout from "../../components/Layout/MainLayout";
import PageTitle from "../../components/PageTitle";
import { MENU } from "../../utils/menus";

function Home() {
    return (
        <MainLayout menu={MENU.HOME}>
            <PageTitle title="홈" />
            <div>content</div>
        </MainLayout>
    );
}

Home.propTypes = {};
export default Home;
