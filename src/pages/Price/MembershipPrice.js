import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import MainLayout from "../../components/Layout/MainLayout";
import PageTitle from "../../components/PageTitle";
import MainContentLayout from "../../components/Layout/MainContentLayout";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import { Blank } from "../../components/Blank";
import { DefaultButton } from "../../components/Button/DefaultButton";
import axios from "axios";
import { SERVER, VALID } from "../../constant";
import { NumberWithComma } from "../../utils/utils";

const Container = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;

function MembershipPrice() {
    const location = useLocation();
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const [modifyMode, setModifyMode] = useState(false);
    const [price, setPrice] = useState(0);

    useEffect(() => {
        getMembershipPrice();
    }, []);

    const getMembershipPrice = async (data) => {
        try {
            const response = await axios.get(
                SERVER + "/admin/price/membership",
                {
                    headers: {
                        "ngrok-skip-browser-warning": true,
                    },
                }
            );
            const {
                data: { result, data },
            } = response;
            if (result === VALID) {
                console.log(data.membershipPrice.membershipPrice);
                setPrice(data.membershipPrice.membershipPrice);
            } else {
                console.log("getMembershipPrice invalid");
                setPrice(0);
            }
        } catch (error) {
            console.log("getMembershipPrice error : ", error);
        }
    };

    const onValid = async (data) => {
        const { price } = data;

        try {
            const response = await axios.patch(
                SERVER + "/admin/price/membership",
                {
                    headers: {
                        "ngrok-skip-browser-warning": true,
                    },
                    price,
                }
            );

            const {
                data: { result, data },
            } = response;

            console.log(response);
            if (result === VALID) {
                setPrice(data.price.membershipPrice);
            } else {
                console.log("onValid invalid");
                alert("수정 실패");
            }
        } catch (error) {
            console.log("onValid error : ", error);
        } finally {
            setModifyMode(false);
        }
    };

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="금액 관리" />
            <MainContentLayout show={true}>
                <form onSubmit={handleSubmit(onValid)}>
                    <>
                        <Container>
                            <HorizontalTable style={{ width: 500 }}>
                                <thead></thead>
                                <tbody>
                                    <tr>
                                        <th style={{ width: 200 }}>
                                            정회원 차감 금액
                                        </th>
                                        <td>
                                            {modifyMode ? (
                                                <>
                                                    <input
                                                        placeholder="숫자만 입력해주세요."
                                                        {...register("price")}
                                                    />
                                                    <Blank />
                                                    <DefaultButton type="submit">
                                                        저장
                                                    </DefaultButton>
                                                    <Blank />
                                                    <DefaultButton
                                                        onClick={() =>
                                                            setModifyMode(false)
                                                        }
                                                    >
                                                        취소
                                                    </DefaultButton>
                                                </>
                                            ) : (
                                                <>
                                                    <div>
                                                        <span>
                                                            {NumberWithComma(
                                                                price
                                                            )}
                                                            원
                                                        </span>
                                                        <Blank />
                                                        <DefaultButton
                                                            onClick={() =>
                                                                setModifyMode(
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            수정하기
                                                        </DefaultButton>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </HorizontalTable>
                        </Container>
                    </>
                </form>
            </MainContentLayout>
        </MainLayout>
    );
}

export default MembershipPrice;
