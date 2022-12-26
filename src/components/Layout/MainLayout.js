import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import PropTypes from "prop-types";

import { useEffect, useState } from "react";
import { MAIN_MENUS, MENU, MENUINFO } from "../../utils/menus";

const subMenus = {
    HOME: [],
    MEMBER: ["회원정보 검색", "탈퇴회원 관리"],
    ORDER: [],
    SCHEDULE: [],
    SALES: [],
    NOTI: [],
    ETC: [],
};

const Container = styled.div`
    margin: 20px;
`;
const Header = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-end;
    background-color: lightgrey;
    align-items: center;
`;
const Greeting = styled.div`
    font-size: 1rem;
`;
const LogoutButton = styled.button`
    margin: 5px 10px;
    background-color: black;
    color: white;
    border: none;
    padding: 5px;
`;

const Wrapper = styled.div`
    margin-top: 20px;
`;
const MainNavBar = styled.div`
    justify-content: space-between;
    display: flex;
    align-items: center;
`;
const MainTitle = styled.div`
    font-size: 1.6rem;
`;
const MainNavs = styled.div`
    width: 47vw;
    display: flex;
    justify-content: space-between;
    padding-right: 20px;
`;
const MainNav = styled.div`
    font-weight: ${(props) => (props.current ? 600 : 400)};
    text-decoration: ${(props) => (props.current ? "underline" : "none")};
`;
const Content = styled.div`
    display: flex;
    border-top: 1px solid grey;
    margin-top: 10px;
    height: 83vh;
`;

const SubNavSideBar = styled.div`
    border-right: 1px solid grey;
    display: flex;
    flex-direction: column;
    width: 12vw;
`;
const SubTitle = styled.div`
    width: inherit;
    text-align: center;
    font-weight: 600;
    font-size: 1rem;
    padding: 30px 0;
    background-color: lightgrey;
    border-bottom: 1px solid grey;
    border-right: 1px solid grey;
`;
const SubNavs = styled.div`
    width: inherit;
    padding: 13px 20px;
`;
const SubNav = styled.div`
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid lightgrey;
    padding: 10px 5px;
    margin-bottom: 5px;
    //TODOS: 메뉴 선택 시 강조
`;

function MainLayout({ children, menu }) {
    const [curMenuTitle, setCurMenuTitle] = useState(MENUINFO[menu].TITLE);

    const isCurrentMenu = (index) => {
        const curIndex = MENUINFO[menu].ID;

        return index === curIndex;
    };
    return (
        <Container>
            <Header>
                <Greeting>안녕하세요. 운영관리자님.</Greeting>
                <LogoutButton>로그아웃</LogoutButton>
            </Header>

            <Wrapper>
                <MainNavBar>
                    <MainTitle>ATG 관리자 시스템</MainTitle>
                    <MainNavs>
                        {MAIN_MENUS.map((menu, index) => (
                            <MainNav key={index} current={isCurrentMenu(index)}>
                                {menu}
                            </MainNav>
                        ))}
                    </MainNavs>
                </MainNavBar>
                <Content>
                    <SubNavSideBar>
                        <SubTitle>{curMenuTitle}</SubTitle>
                        <SubNavs>
                            {MENUINFO[menu].SUB_MENUS.map((menu, index) => (
                                <SubNav key={index}>
                                    <span>{menu.TITLE}</span>
                                    <FontAwesomeIcon
                                        icon={faChevronRight}
                                        color="grey"
                                    />
                                </SubNav>
                            ))}
                        </SubNavs>
                    </SubNavSideBar>
                    {children}
                </Content>
            </Wrapper>
        </Container>
    );
}

MainLayout.propTypes = {
    menu: PropTypes.string.isRequired,
};
export default MainLayout;
