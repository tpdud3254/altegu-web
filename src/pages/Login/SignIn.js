import styled from "styled-components";
import PageTitle from "../../components/PageTitle";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DefaultButton } from "../../components/Button/DefaultButton";
import { PointButton } from "../../components/Button/PointButton";
import { Blank } from "../../components/Blank";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import {
    ADMIN_POSITION,
    BANK_LIST,
    SERVER,
    TELECOM,
    VALID,
} from "../../constant";
import { useForm } from "react-hook-form";
import axios from "axios";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
`;
const Title = styled.div`
    font-size: 20px;
    padding-bottom: 20px;
    color: grey;
`;
const SubTitle = styled.div`
    font-size: 25px;
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
const Buttons = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    padding-top: 20px;
`;

function SignIn() {
    const { register, handleSubmit, setValue, watch, getValues } = useForm();
    const [isCheckedId, setIsCheckedId] = useState(false);
    const navigate = useNavigate();

    const checkId = async () => {
        if (getValues("id").length === 0) {
            alert("아이디를 입력해주세요.");
            return;
        }
        try {
            const response = await axios.post(SERVER + `/admin/check`, {
                id: getValues("id"),
            });

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                const {
                    data: {
                        data: { exist },
                    },
                } = response;

                console.log("admin check account valid : ", exist);
                if (!exist) {
                    setIsCheckedId(true);
                    alert("사용 가능한 아이디입니다.");
                } else {
                    setIsCheckedId(false);
                    alert("존재하는 아이디입니다.");
                }
            }
        } catch (error) {
            setIsCheckedId(false);
            alert("존재하는 아이디입니다.");
            console.log("admin check account invalid");
            console.log(error);
        }
    };

    const onValid = async (data) => {
        console.log("data : ", data);
        let result = true;
        Object.keys(data).map((value) => {
            if (!data[value] || data[value].length === 0) {
                result = false;
            }
        });

        if (!result) {
            alert("누락된 값이 있습니다.");
            return;
        }

        if (!isCheckedId) {
            alert("아이디 중복확인을 해주세요.");
            return;
        }

        const {
            id,
            password,
            verifiedPassword,
            name,
            idNumber1,
            idNumber2,
            bank,
            bankAccountName,
            bankAccountNumber,
            telecom,
            position,
        } = data;

        if (password !== verifiedPassword) {
            alert("비밀번호가 일치 하지 않습니다.");
            return;
        }

        if (idNumber1.length !== 6 || idNumber2.length !== 7) {
            alert("유효하지 않은 주민번호입니다.");
            return;
        }

        const bankId = Number(bank);
        const telecomId = Number(telecom);
        const positionId = Number(position);

        if (!bankId || bankId === 0) {
            alert("은행을 선택해주세요.");
            return;
        }

        if (!telecomId || telecomId === 0) {
            alert("통신사를 선택해주세요.");
            return;
        }

        if (!positionId || positionId === 0) {
            alert("직책을 선택해주세요.");
            return;
        }

        console.log(data);

        try {
            const response = await axios.post(SERVER + `/admin/create`, {
                userId: id,
                password,
                name,
                idNumber: idNumber1 + "-" + idNumber2,
                bank: BANK_LIST[bankId],
                bankAccountName,
                bankAccountNumber,
                telecomId,
                positionId,
            });

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                console.log("admin create account valid");
                alert(
                    "회원가입에 성공하였습니다.\n관리자의 승인을 대기해주세요."
                );
                navigate("/");
            }
        } catch (error) {
            alert("회원가입에 실패하였습니다.");
            console.log("admin create account invalid");
            console.log(error);
        }
    };

    return (
        <Container>
            <PageTitle title="회원가입" />
            <Title>ATG 관리자 시스템</Title>
            <SubTitle>회원가입</SubTitle>
            <Wrapper>
                <form onSubmit={handleSubmit(onValid)}>
                    <HorizontalTable>
                        <thead></thead>
                        <tbody>
                            <tr>
                                <th>아이디 (연락처)</th>
                                <td>
                                    <input
                                        {...register("id")}
                                        onChange={() => setIsCheckedId(false)}
                                    />
                                    <Blank />
                                    <DefaultButton
                                        type="button"
                                        onClick={checkId}
                                    >
                                        중복확인
                                    </DefaultButton>
                                </td>
                            </tr>
                            <tr>
                                <th>비밀번호</th>
                                <td>
                                    <input
                                        type="password"
                                        {...register("password")}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>비밀번호 확인</th>
                                <td>
                                    <input
                                        type="password"
                                        {...register("verifiedPassword")}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>이름</th>
                                <td>
                                    <input {...register("name")} />
                                </td>
                            </tr>
                            <tr>
                                <th>주민번호</th>
                                <td>
                                    <input
                                        type="number"
                                        style={{ width: 80 }}
                                        {...register("idNumber1")}
                                    />
                                    <Blank />
                                    -
                                    <Blank />
                                    <input
                                        type="number"
                                        style={{ width: 80 }}
                                        {...register("idNumber2")}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>예금주</th>
                                <td>
                                    <input {...register("bankAccountName")} />
                                </td>
                            </tr>
                            <tr>
                                <th>계좌번호</th>
                                <td>
                                    <select name="bank" {...register("bank")}>
                                        {BANK_LIST.map((bank, index) => (
                                            <option value={index} key={index}>
                                                {bank}
                                            </option>
                                        ))}
                                    </select>
                                    <Blank />
                                    <input
                                        type="number"
                                        placeholder="숫자만 입력해주세요."
                                        {...register("bankAccountNumber")}
                                    />
                                </td>
                            </tr>

                            <tr>
                                <th>통신사</th>
                                <td>
                                    <select
                                        name="telecom"
                                        {...register("telecom")}
                                    >
                                        {TELECOM.map((telecom, index) => (
                                            <option value={index} key={index}>
                                                {telecom}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th>직책</th>
                                <td>
                                    <select
                                        name="position"
                                        {...register("position")}
                                    >
                                        {ADMIN_POSITION.map(
                                            (position, index) => (
                                                <option
                                                    value={index}
                                                    key={index}
                                                >
                                                    {position}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </HorizontalTable>
                    <Buttons>
                        <PointButton type="submit">회원가입</PointButton>
                        <Blank />
                        <Blank />
                        <Blank />
                        <Link to="/">
                            <DefaultButton>뒤로가기</DefaultButton>
                        </Link>
                    </Buttons>
                </form>
            </Wrapper>
        </Container>
    );
}

export default SignIn;
