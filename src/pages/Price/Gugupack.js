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

function Gugupack() {
    const location = useLocation();
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const [modifyMode, setModifyMode] = useState(false);
    const [price, setPrice] = useState(0);

    useEffect(() => {
        getGugupackPrice();
    }, []);

    const getGugupackPrice = async (data) => {
        try {
            const response = await axios.get(SERVER + "/users/gugupack/price", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
            });
            const {
                data: { result, data },
            } = response;
            if (result === VALID) {
                setPrice(data.price.gugupackPrice);
            } else {
                console.log("getGugupackPrice invalid");
                setPrice(0);
            }
        } catch (error) {
            console.log("getGugupackPrice error : ", error);
        }
    };

    const onValid = async (data) => {
        const { price } = data;

        try {
            const response = await axios.patch(
                SERVER + "/admin/price/gugupack",
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
                setPrice(data.price.gugupackPrice);
            } else {
                console.log("setGugupackPrice invalid");
                alert("수정 실패");
            }
        } catch (error) {
            console.log("setGugupackPrice error : ", error);
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
                                            구구팩 할인 금액
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

export default Gugupack;
