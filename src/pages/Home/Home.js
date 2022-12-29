import styled from "styled-components";
import PropTypes from "prop-types";
import MainLayout from "../../components/Layout/MainLayout";
import PageTitle from "../../components/PageTitle";
import { MENU } from "../../utils/menus";
import Calendar from "../../components/Calendar/Calendar";
import { useMemo } from "react";
import Table from "../../components/Table/Table";

const table1Col = [
    {
        accessor: "num",
        Header: "No.",
    },
    {
        accessor: "registDate",
        Header: "등록 일시",
    },
    {
        accessor: "registrant",
        Header: "등록자",
    },
    {
        accessor: "address",
        Header: "작업 주소",
    },
    {
        accessor: "workDate",
        Header: "작업 일시",
    },
    {
        accessor: "workType",
        Header: "작업 종류",
    },
    {
        accessor: "charge",
        Header: "작업 비용",
    },
    {
        accessor: "commission",
        Header: "수수료",
    },
    {
        accessor: "workStatus",
        Header: "작업 상태",
    },
    {
        accessor: "worker",
        Header: "작업자",
    },
    {
        accessor: "workTime",
        Header: "작업 소요 시간",
    },
    {
        accessor: "memo",
        Header: "추가사항",
    },
];

const table1Data = [
    {
        num: "text",
        registDate: "text",
        registrant: "text",
        address: "text",
        workDate: "text",
        workType: "text",
        charge: "text",
        commission: "text",
        workStatus: "text",
        worker: "text",
        workTime: "text",
        memo: "text",
    },
    {
        num: "text",
        registDate: "text",
        registrant: "text",
        address: "text",
        workDate: "text",
        workType: "text",
        charge: "text",
        commission: "text",
        workStatus: "text",
        worker: "text",
        workTime: "text",
        memo: "text",
    },
    {
        num: "text",
        registDate: "text",
        registrant: "text",
        address: "text",
        workDate: "text",
        workType: "text",
        charge: "text",
        commission: "text",
        workStatus: "text",
        worker: "text",
        workTime: "text",
        memo: "text",
    },
];

const Row = styled.div`
    display: flex;
    width: 100%;
`;
const Column = styled.div`
    width: 350px;
`;

const Styles = styled.div`
    table {
    }
`;

const STable = styled.table`
    width: 100%;
    margin: 20px 10px;
    border-spacing: 0;
    border: 1px solid grey;

    tr {
        :last-child {
            td {
                border-bottom: 0;
            }
        }
    }

    th,
    td {
        margin: 0;
        padding: 0.5rem;
        border-bottom: 1px solid grey;
        border-right: 1px solid grey;
        vertical-align: middle;
        text-align: center;
    }

    th {
        font-weight: 600;
        background-color: lightgrey;
    }
`;
function Home() {
    const columns = useMemo(() => table1Col, []);
    const data = useMemo(() => table1Data, []);

    return (
        <MainLayout menu={MENU.HOME}>
            <PageTitle title="홈" />
            <Styles>
                <Row>
                    <Calendar />
                    <Column>
                        <STable>
                            <thead>
                                <tr>
                                    <th colSpan={2}>신규회원</th>
                                    <th colSpan={1}>전체회원</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>일반회원</td>
                                    <td>1,000명</td>
                                    <td rowSpan={2}>50,000명</td>
                                </tr>
                                <tr>
                                    <td>기사회원</td>
                                    <td>1,000명</td>
                                </tr>
                            </tbody>
                        </STable>
                        <STable>
                            <thead>
                                <tr>
                                    <th colSpan={3}>작업 현황</th>
                                    <th colSpan={1}>전체 작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>작업 완료</td>
                                    <td>11,800</td>
                                    <td>10%</td>
                                    <td rowSpan={3}>250,000건</td>
                                </tr>
                                <tr>
                                    <td>작업 예약</td>
                                    <td>70,000</td>
                                    <td>60%</td>
                                </tr>
                                <tr>
                                    <td>작업 요청</td>
                                    <td>65,555</td>
                                    <td>30%</td>
                                </tr>
                            </tbody>
                        </STable>
                        <STable>
                            <thead>
                                <tr>
                                    <th colSpan={3}>최다 작업 등록 회원</th>
                                    <th colSpan={1}>전체 작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>고길동</td>
                                    <td>골드</td>
                                    <td>30건</td>
                                    <td rowSpan={3}>250,000건</td>
                                </tr>
                                <tr>
                                    <td>홍길동</td>
                                    <td>실버</td>
                                    <td>20건</td>
                                </tr>
                                <tr>
                                    <td>박길동</td>
                                    <td>골드</td>
                                    <td>10건</td>
                                </tr>
                            </tbody>
                        </STable>
                    </Column>
                </Row>
                <Row>
                    <Table columns={columns} data={data} />
                </Row>
            </Styles>
        </MainLayout>
    );
}

Home.propTypes = {};
export default Home;
