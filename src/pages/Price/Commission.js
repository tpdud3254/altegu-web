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
import { Reload } from "../../utils/utils";

const Container = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;

function Commission() {
    const location = useLocation();
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const [loading, setLoading] = useState(true);
    const [commission, setCommission] = useState([]);
    const [modifyValue, setModifyValue] = useState("");

    useEffect(() => {
        getCommission();
    }, []);

    useEffect(() => {
        if (commission.length > 0) setLoading(false);
        else setLoading(true);
    }, [commission]);

    useEffect(() => {
        if (loading) return;

        commission.map((value) => setValue(value.name, null));
    }, [modifyValue]);

    const getCommission = async () => {
        try {
            const response = await axios.get(SERVER + "/commission/", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
            });
            const {
                data: {
                    result,
                    data: { list },
                },
            } = response;
            if (result === VALID) {
                setCommission(list);
            } else {
                console.log("getCommission invalid");
                setCommission([]);
            }
        } catch (error) {
            console.log("getCommission error : ", error);
            setCommission([]);
        }
    };

    const onValid = async (data) => {
        const percent = getValues(modifyValue);

        if (percent < 0 || percent > 100) {
            alert("0~100 사이의 숫자를 입력해주세요.");
            return;
        }

        const decimal = percent / 100;

        try {
            const response = await axios.patch(SERVER + "/commission/", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
                name: modifyValue,
                decimal,
            });

            const {
                data: { result, data },
            } = response;

            console.log(response);
            if (result === VALID) {
                Reload();
            } else {
                console.log("onValid invalid");
                alert("수정 실패");
            }
        } catch (error) {
            console.log("onValid error : ", error);
        } finally {
        }
    };

    return (
        <>
            {!loading ? (
                <MainLayout path={location.pathname}>
                    <PageTitle title="금액 관리" />
                    <MainContentLayout show={true}>
                        <form onSubmit={handleSubmit(onValid)}>
                            <>
                                <Container>
                                    <HorizontalTable style={{ width: 500 }}>
                                        <thead></thead>
                                        <tbody>
                                            {commission.map((value, index) => (
                                                <tr key={index}>
                                                    <th style={{ width: 200 }}>
                                                        {value.description}
                                                    </th>
                                                    <td>
                                                        {modifyValue.length >
                                                            0 &&
                                                        value.name ===
                                                            modifyValue ? (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    placeholder="0~100 사이의 숫자 입력"
                                                                    {...register(
                                                                        value.name
                                                                    )}
                                                                />
                                                                <Blank />
                                                                <DefaultButton type="submit">
                                                                    저장
                                                                </DefaultButton>
                                                                <Blank />
                                                                <DefaultButton
                                                                    onClick={() =>
                                                                        setModifyValue(
                                                                            ""
                                                                        )
                                                                    }
                                                                >
                                                                    취소
                                                                </DefaultButton>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div>
                                                                    <span>
                                                                        {value.commission *
                                                                            100}
                                                                        %
                                                                    </span>
                                                                    <Blank />
                                                                    <DefaultButton
                                                                        onClick={() =>
                                                                            setModifyValue(
                                                                                value.name
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
                                            ))}
                                        </tbody>
                                    </HorizontalTable>
                                </Container>
                            </>
                        </form>
                    </MainContentLayout>
                </MainLayout>
            ) : null}
        </>
    );
}

export default Commission;
