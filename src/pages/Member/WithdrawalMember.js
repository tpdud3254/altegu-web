import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/Table/Table";
import Modal from "../../components/Modal";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import MemberDetail from "./MemberDetail";
import RowSelectionTable from "../../components/Table/RowSelectionTable";

const tableCol = [
    {
        accessor: "num",
        Header: "고유번호",
    },
    {
        accessor: "name",
        Header: "이름",
    },
    {
        accessor: "withdrawalDate",
        Header: "탈퇴일",
    },
    {
        accessor: "age",
        Header: "나이",
    },
    {
        accessor: "sex",
        Header: "성별",
    },
    {
        accessor: "phone",
        Header: "연락처",
    },
    {
        accessor: "userType",
        Header: "구분",
    },
    {
        accessor: "region",
        Header: "접속 지역",
    },
    {
        accessor: "workRegion",
        Header: "작업 지역",
    },
    {
        accessor: "point",
        Header: "잔여 포인트",
    },
    {
        accessor: "status",
        Header: "상태",
    },
];

const tableData = [
    {
        num: "text",
        name: "text",
        withdrawalDate: "text",
        age: "text",
        sex: "text",
        phone: "text",
        workCategory: "text",
        region: "text",
        workRegion: "text",
        point: "text",
        status: "text",
    },
];

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

function WithdrawalMember() {
    const columns = useMemo(() => tableCol, []);
    const data = useMemo(() => tableData, []);
    const [modalOpen, setModalOpen] = useState(false);
    const [showDetail, setShowDetail] = useState(false);

    const openModal = () => {
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
    };

    const openDetail = () => {
        setShowDetail(true);
    };

    const closeDetail = () => {
        setShowDetail(false);
    };

    return (
        <>
            {!showDetail ? (
                <>
                    {" "}
                    <SearchContainer>
                        <SearchText>검색 조건 입력</SearchText>
                        <HorizontalTable>
                            <thead></thead>
                            <tbody>
                                <tr>
                                    <th>회원명</th>
                                    <td>
                                        <input />
                                    </td>
                                    <th>사업자번호</th>
                                    <td>
                                        <input />
                                    </td>
                                </tr>
                                <tr>
                                    <th>연락처</th>
                                    <td>
                                        <input />
                                    </td>
                                    <th>성별</th>
                                    <td>
                                        <input type="radio" />
                                        남성
                                        <input type="radio" />
                                        여성
                                    </td>
                                </tr>
                                <tr>
                                    <th>가입일자</th>
                                    <td>
                                        <input />
                                        <button>달력</button>~
                                        <input />
                                        <button>달력</button>
                                    </td>
                                    <th>상태</th>
                                    <td>
                                        <select name="choice">
                                            <option value="all">전체</option>
                                            <option value="apple">정상</option>
                                            <option value="orange">탈퇴</option>
                                            <option value="orange">
                                                이용정지
                                            </option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th>구분</th>
                                    <td>
                                        <select name="choice">
                                            <option value="all">가구업</option>
                                            <option value="apple">
                                                인테리어
                                            </option>
                                            <option value="orange">인력</option>
                                            <option value="orange">청소</option>
                                        </select>
                                    </td>
                                    <th>접속지역</th>
                                    <td>
                                        <input />
                                    </td>
                                </tr>
                            </tbody>
                        </HorizontalTable>
                        <button onClick={openModal}>검색하기</button>
                        <button onClick={openDetail}>초기화</button>
                    </SearchContainer>
                    <ResultContainer>
                        <ResultWrapper>
                            <div>총: 15,000명</div>
                            <div>
                                <button>데이터 삭제</button>
                                <button>엑셀 다운로드</button>
                            </div>
                        </ResultWrapper>
                        <RowSelectionTable columns={columns} data={data} />
                    </ResultContainer>
                    <Modal
                        open={modalOpen}
                        close={closeModal}
                        header="상세정보"
                    >
                        <HorizontalTable>
                            <thead></thead>
                            <tbody>
                                <tr>
                                    <th>은행</th>
                                    <td>국민은행</td>
                                </tr>
                                <tr>
                                    <th>예금주</th>
                                    <td>홍길동</td>
                                </tr>
                                <tr>
                                    <th>계좌번호</th>
                                    <td>1000-111-1111</td>
                                </tr>
                                <tr>
                                    <th>잔여포인트</th>
                                    <td>10,000p</td>
                                </tr>
                            </tbody>
                        </HorizontalTable>
                    </Modal>
                </>
            ) : (
                <MemberDetail close={closeDetail} />
            )}
        </>
    );
}

WithdrawalMember.propTypes = {};
export default WithdrawalMember;
