import styled from "styled-components";
import PropTypes from "prop-types";
import PageTitle from "../../components/PageTitle";

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
    margin-top: 50px;
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
    font-size: 20px;
    margin-bottom: 10px;
    width: 300px;
`;
const SubmitButton = styled.input`
    background-color: black;
    color: white;
    padding: 10px;
    width: 300px;
    text-align: center;
    font-size: 20px;
    font-weight: 500;
    margin-top: 10px;
`;

function Login() {
    return (
        <Container>
            <PageTitle title="로그인" />
            <Title>Altegu 관리자 페이지</Title>
            <Wrapper>
                <form>
                    <Input placeholder="아이디" type="text" />
                    <Input placeholder="비밀번호" type="password" />
                    <SubmitButton type="submit" value="로그인" />
                </form>
            </Wrapper>
        </Container>
    );
}

export default Login;
