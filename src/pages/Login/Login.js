import styled from "styled-components";
import PageTitle from "../../components/PageTitle";
import { useContext, useState } from "react";
import LoginContext from "../../contexts/LoginContext";
import { useNavigate } from "react-router-dom";
import { MENUS, SUB_MENUS } from "../../utils/menus";
import { DefaultButton } from "../../components/Button/DefaultButton";
import { PointButton } from "../../components/Button/PointButton";
import { Blank } from "../../components/Blank";
import axios from "axios";
import { SERVER, VALID } from "../../constant";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
`;
const Title = styled.div`
    font-size: 30px;
`;
const Wrapper = styled.div`
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
`;
const Input = styled.input`
    border: 1px solid black;
    padding: 10px;
    margin-bottom: 10px;
    width: 300px;
`;

const Buttons = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    padding-top: 20px;
`;

function Login() {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const { setIsLoggedIn, setUserInfo } = useContext(LoginContext);
    const navigate = useNavigate();

    const login = async () => {
        console.log("id : ", id);
        console.log("password : ", password);
        if (id.length === 0 || password.length === 0) {
            alert("값을 입력해주세요.");
            return;
        }
        try {
            const response = await axios.post(SERVER + `/admin/login`, {
                id,
                password,
            });

            const {
                data: { result },
            } = response;

            console.log(response);
            if (result === VALID) {
                const {
                    data: {
                        data: { user, token },
                    },
                } = response;

                console.log("admin create account valid : ", user);
                setIsLoggedIn(true);
                setUserInfo(user);
                localStorage.setItem("TOKEN", user.token);
                navigate(`${MENUS.USER.route}${SUB_MENUS.USER[0].route}`);
            } else {
                alert(response.data.msg);
            }
        } catch (error) {
            alert("로그인에 실패하였습니다.");
            console.log("admin create account invalid");
            console.log(error);
        }
    };

    const goToSignIn = () => {
        navigate("/signIn");
    };

    return (
        <Container>
            <PageTitle title="로그인" />
            <Title>ATG 관리자 시스템</Title>
            <Wrapper>
                <form>
                    <Input
                        placeholder="아이디"
                        type="text"
                        onChange={(e) => {
                            setId(e.target.value);
                        }}
                    />
                    <Input
                        placeholder="비밀번호"
                        type="password"
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                    />
                    <Buttons>
                        <DefaultButton type="button" onClick={goToSignIn}>
                            회원가입
                        </DefaultButton>
                        <Blank />
                        <Blank />
                        <Blank />
                        <PointButton type="button" onClick={login}>
                            로그인
                        </PointButton>
                    </Buttons>
                </form>
            </Wrapper>
        </Container>
    );
}

export default Login;
