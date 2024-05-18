import MainLayout from "../../../components/Layout/MainLayout";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import React, { useEffect, useMemo, useState } from "react";
import Table from "../../../components/Table/Table";
import { HorizontalTable } from "../../../components/Table/HorizontalTable";
import axios from "axios";
import { SERVER, VALID } from "../../../constant";
import {
    GetUserType,
    GetAge,
    GetDateTime,
    NumberWithComma,
    Reset,
    Reload,
} from "../../../utils/utils";
import { useForm } from "react-hook-form";
import PageTitle from "../../../components/PageTitle";
import { Blank } from "../../../components/Blank";
import MainContentLayout from "../../../components/Layout/MainContentLayout";
import { SEARCH_TABLE_COL } from "./table";
import "../../../components/Calendar/calendarStyle.css";

const SearchContainer = styled.div`
    width: 100%;
`;

const SearchText = styled.div`
    font-weight: 600;
`;

const ResultContainer = styled.div`
    width: 100%;
    margin-top: 30px;
`;

const ResultWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    align-items: flex-end;
`;

function SubscribeGugupack() {
    const location = useLocation();
    const { register, handleSubmit } = useForm();

    const [showDetail, setShowDetail] = useState(false);

    const [list, setList] = useState([]);
    const [tableData, setTableData] = useState(null);
    const [selectedArr, setSelectedArr] = useState([]);

    useEffect(() => {
        getList();
    }, []);

    const getList = async (data) => {
        try {
            const response = await axios.get(
                SERVER + "/admin/gugupack/subscribe",
                {
                    headers: {
                        "ngrok-skip-browser-warning": true,
                    },
                    ...(data && { params: { ...data } }),
                }
            );

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                const {
                    data: {
                        data: { list },
                    },
                } = response;
                console.log("getList valid : ", list);

                setList(list);
                setTableData(getTableData(list));
            } else {
                const {
                    data: { msg },
                } = response;

                console.log("getList invalid");
                setList([]);
            }
        } catch (error) {
            console.log("getList error : ", error);
        }
    };

    const getTableData = (data) => {
        const result = [];
        data.map((value, index) => {
            result.push({
                num: index + 1,
                userId: value.user.id,
                name: value.user.name,
                age: GetAge(value.user.birth),
                gender: value.user.gender,
                phone: value.user.phone,
                userType:
                    value.user.userTypeId === 3
                        ? GetUserType(value.user.userTypeId) +
                          ">" +
                          value.user.workCategory.name
                        : value.user.membership
                        ? GetUserType(value.user.userTypeId) + " (정회원)"
                        : GetUserType(value.user.userTypeId),
                subscribeDate: GetDateTime(value.createdAt),
                point: NumberWithComma(value.user.point.curPoint) + "AP",
                gugupack: value.user.gugupack ? "회원" : "승인 전",
            });
        });
        return result;
    };

    const onValid = async (data) => {
        const { name, phone } = data;

        const sendData = {
            name: name ? name : null,
            phone: phone ? phone : null,
        };

        console.log(sendData);
        await getList(sendData);
    };

    const confirmGugupack = async () => {
        if (selectedArr.length === 0) return;

        const selectedIdList = [];
        selectedArr.map((value) =>
            selectedIdList.push({ id: list[value.index].id })
        );

        const userIdList = [];
        selectedArr.map((value) =>
            userIdList.push({ id: value.original.userId })
        );

        try {
            const response = await axios.post(
                SERVER + "/admin/gugupack/confirm",
                {
                    selectedIdList,
                    userIdList,
                }
            );

            const {
                data: { result },
            } = response;

            console.log("result : ", result);
            if (result === VALID) {
                alert("승인 성공");
                Reload();
            } else alert("승인 실패");
        } catch (error) {
            console.log(error);
            alert("승인 실패");
        }
    };

    const columns = useMemo(() => SEARCH_TABLE_COL, []);

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="회원 관리" />
            <MainContentLayout show={showDetail ? false : true}>
                <form onSubmit={handleSubmit(onValid)}>
                    <>
                        <SearchContainer>
                            <SearchText>검색 조건 입력</SearchText>
                            <HorizontalTable>
                                <thead></thead>
                                <tbody>
                                    <tr>
                                        <th>회원명</th>
                                        <td>
                                            <input {...register("name")} />
                                        </td>
                                        <th>연락처</th>
                                        <td>
                                            <input
                                                {...register("phone")}
                                                placeholder="숫자만 입력"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </HorizontalTable>
                            <button type="submit">검색하기</button>
                            <Blank />
                            <button type="button" onClick={Reset}>
                                초기화
                            </button>
                        </SearchContainer>
                        <ResultContainer>
                            <ResultWrapper>
                                <div>
                                    총:{" "}
                                    {tableData !== null
                                        ? NumberWithComma(tableData.length)
                                        : "-"}
                                    명
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={confirmGugupack}
                                    >
                                        구구팩 승인
                                    </button>
                                </div>
                            </ResultWrapper>
                            {tableData !== null ? (
                                <Table
                                    columns={columns}
                                    data={tableData}
                                    selectMode={true}
                                    selectedArr={(data) => setSelectedArr(data)}
                                />
                            ) : null}
                        </ResultContainer>
                    </>
                </form>
            </MainContentLayout>
        </MainLayout>
    );
}

export default SubscribeGugupack;
