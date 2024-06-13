import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { MENUS, SUB_MENUS } from "../../utils/menus";
import { Link } from "react-router-dom";

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
    display: flex;
    justify-content: space-between;
    padding-right: 20px;
`;
const MainNav = styled.div`
    font-weight: ${(props) => (props.current ? 600 : 400)};
    text-decoration: ${(props) => (props.current ? "underline" : "none")};
    padding-left: 10px;
`;
const Bottom = styled.div`
    display: flex;
    border-top: 1px solid grey;
    margin-top: 10px;
    min-height: 83vh;
`;

const SubNavSideBar = styled.div`
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
    font-weight: ${(props) => (props.current ? "600" : "400")};
    color: ${(props) => (props.current ? "black" : "grey")};
`;

const Content = styled.div`
    border-left: 1px solid grey;
    width: 100%;
    padding: 15px 0px 0px 15px;
`;
function MainLayout({ children, path }) {
    const [loading, setLoading] = useState(false);
    const [curMenu, setCurMenu] = useState(null);
    const [curSubMenuIndex, setCurSubMenuIndex] = useState(null);

    //TODO: admin 계정일 경우 전부다 보이게 설정
    const menuPermissions = ["user", "order", "price", "manage"]; //TEST: 테스트 코드
    const submenuPermissions = [
        "user_search",
        "order_search",
        "price_order",
        "manage_manager",
    ]; //TEST: 테스트 코드

    useEffect(() => {
        console.log("current path : ", path);

        if (path === "/") {
            setCurMenu("USER");
            setCurSubMenuIndex(0);
            return;
        }

        const arr = path.split("/");

        setCurMenu(arr[1].toUpperCase());
        SUB_MENUS[arr[1].toUpperCase()].map((value, index) => {
            if (value.route === "/" + arr[2]) setCurSubMenuIndex(index);
        });
    }, []);

    useEffect(() => {
        if (curMenu !== null && curSubMenuIndex !== null) {
            setLoading(true);
        }
    }, [curMenu, curSubMenuIndex]);

    const checkMenuPermission = (curMenu) =>
        menuPermissions.find((menu) => menu === curMenu);

    const checkSubmenuPermissions = (curSubmenu) =>
        submenuPermissions.find((submenu) => submenu === curSubmenu);

    return (
        <>
            {loading ? (
                <Container>
                    <Header>
                        <Greeting>안녕하세요. 운영관리자님.</Greeting>
                        {/* <LogoutButton>로그아웃</LogoutButton> */}
                    </Header>
                    <Wrapper>
                        <MainNavBar>
                            <MainTitle>ATG 관리자 시스템</MainTitle>
                            <MainNavs>
                                {Object.keys(MENUS).map((menu, index) => {
                                    if (!checkMenuPermission(MENUS[menu].id))
                                        return;

                                    return (
                                        <Link
                                            to={
                                                MENUS[menu].route +
                                                SUB_MENUS[menu][0].route
                                            }
                                            key={index}
                                        >
                                            <MainNav
                                                current={
                                                    MENUS[menu].route ===
                                                    MENUS[curMenu].route
                                                }
                                            >
                                                {MENUS[menu].name}
                                            </MainNav>
                                        </Link>
                                    );
                                })}
                            </MainNavs>
                        </MainNavBar>
                        <Bottom>
                            <SubNavSideBar>
                                <SubTitle>{MENUS[curMenu].name}</SubTitle>
                                <SubNavs>
                                    {SUB_MENUS[curMenu].map(
                                        (submenu, index) => {
                                            if (
                                                !checkSubmenuPermissions(
                                                    submenu.id
                                                )
                                            )
                                                return;

                                            return (
                                                <Link
                                                    key={index}
                                                    to={
                                                        MENUS[curMenu].route +
                                                        SUB_MENUS[curMenu][
                                                            index
                                                        ].route
                                                    }
                                                >
                                                    <SubNav
                                                        current={
                                                            curSubMenuIndex ===
                                                            index
                                                        }
                                                    >
                                                        <span>
                                                            {submenu.name}
                                                        </span>
                                                        <FontAwesomeIcon
                                                            icon={
                                                                faChevronRight
                                                            }
                                                            color="grey"
                                                        />
                                                    </SubNav>
                                                </Link>
                                            );
                                        }
                                    )}
                                </SubNavs>
                            </SubNavSideBar>
                            <Content>{children}</Content>
                        </Bottom>
                    </Wrapper>
                </Container>
            ) : (
                <div></div>
            )}
        </>
    );
}

MainLayout.propTypes = {
    path: PropTypes.string.isRequired,
};

export default MainLayout;
