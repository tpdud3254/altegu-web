import styled from "styled-components";
import PropTypes from "prop-types";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import Table from "../../components/Table/Table";
import { useMemo } from "react";

const table1Col = [
    //TODOS: Member.js 랑 겹침
    {
        accessor: "num",
        Header: "고유번호",
    },
    {
        accessor: "name",
        Header: "이름",
    },
    {
        accessor: "signUpDate",
        Header: "가입일",
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
        accessor: "workCategory",
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
        accessor: "password",
        Header: "비밀번호",
    },
    {
        accessor: "point",
        Header: "포인트",
    },
    {
        accessor: "status",
        Header: "상태",
    },
];

const table1Data = [
    {
        num: "text",
        name: "text",
        signUpDate: "text",
        age: "text",
        sex: "text",
        phone: "text",
        workCategory: "text",
        region: "text",
        workRegion: "text",
        password: "text",
        point: "text",
        status: "text",
    },
];

const table2Col = [
    {
        accessor: "num",
        Header: "번호",
    },
    {
        accessor: "registDate",
        Header: "등록 일시",
    },
    {
        accessor: "address",
        Header: "작업 주소",
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
        accessor: "workeCategory",
        Header: "작업 종류",
    },
    {
        accessor: "memo",
        Header: "추가사항",
    },
    {
        accessor: "workStatus",
        Header: "작업 상태",
    },
    {
        accessor: "workTime",
        Header: "작업 소요 시간",
    },
];

const table2Data = [
    {
        num: "text",
        registDate: "text",
        address: "text",
        charge: "text",
        commission: "text",
        workeCategory: "text",
        memo: "text",
        workStatus: "text",
        workTime: "text",
    },
];

const table3Col = [
    {
        accessor: "date",
        Header: "날짜",
    },
    {
        accessor: "type",
        Header: "종류",
    },
    {
        accessor: "point",
        Header: "포인트",
    },
    {
        accessor: "curPoint",
        Header: "잔여 포인트",
    },
    {
        accessor: "etc",
        Header: "기타",
    },
];

const table3Data = [
    {
        date: "text",
        type: "text",
        point: "text",
        curPoint: "text",
        etc: "text",
    },
];

const BackButton = styled.span`
    cursor: pointer;
    text-decoration: underline;
`;

const Wrapper = styled.div`
    margin-top: 50px;
`;
const TableTitle = styled.div`
    font-weight: 600;
    margin-bottom: 5px;
    font-size: 20px;
`;
function MemberDetail({ close }) {
    const columns = useMemo(() => table1Col, []);
    const data = useMemo(() => table1Data, []);
    const columns2 = useMemo(() => table2Col, []);
    const data2 = useMemo(() => table2Data, []);
    const columns3 = useMemo(() => table3Col, []);
    const data3 = useMemo(() => table3Data, []);

    return (
        <div>
            <div>
                <BackButton onClick={close}>회원정보 검색</BackButton> &gt;
                회원상세정보
            </div>

            <Wrapper>
                <TableTitle>기본 정보</TableTitle>
                <HorizontalTable>
                    <thead></thead>
                    <tbody>
                        <tr>
                            <th>고유번호</th>
                            <td></td>
                            <th>신청일</th>
                            <td>2019.02.22</td>
                        </tr>
                        <tr>
                            <th>상태</th>
                            <td>정상</td>
                            <th>회원 구분</th>
                            <td>기사회원</td>
                        </tr>
                        <tr>
                            <th>회원 ID</th>
                            <td>01011112222</td>
                            <th>사업자 등록증</th>
                            <td>
                                <span>image.jpg</span>
                                <button>보기</button>
                            </td>
                        </tr>
                        <tr>
                            <th>비밀번호</th>
                            <td>*****</td>
                            <th>비밀번호 초기화</th>
                            <td>
                                <button>초기화</button>
                            </td>
                        </tr>
                        <tr>
                            <th>이름(실명)</th>
                            <td>홍길동</td>
                            <th>생년월일</th>
                            <td>2019.02.22 (52세)</td>
                        </tr>
                        <tr>
                            <th>전화번호</th>
                            <td>010-2222-3333</td>
                            <th>성별</th>
                            <td>남</td>
                        </tr>
                        <tr>
                            <th>은행/예금주</th>
                            <td>국민은행 / 홍길동</td>
                            <th>작업지역</th>
                            <td>경기 북부, 서울</td>
                        </tr>
                        <tr>
                            <th>보유 포인트</th>
                            <td>130,000P</td>
                            <th>계좌번호</th>
                            <td>234-123413-2354235</td>
                        </tr>
                    </tbody>
                </HorizontalTable>
            </Wrapper>

            <Wrapper>
                <TableTitle>프로필 정보</TableTitle>
                <HorizontalTable>
                    <thead></thead>
                    <tbody>
                        <tr>
                            <th rowSpan={2}>프로필 사진</th>
                            <td rowSpan={2}></td>
                            <th>이름/상호명</th>
                            <td>알싸</td>
                        </tr>
                        <tr>
                            <th>작업 지역</th>
                            <td>경기 북서부, 경기 남서부, 인천</td>
                        </tr>
                        <tr>
                            <th>인사말</th>
                            <td colSpan={3}>안녕하세요</td>
                        </tr>
                        <tr>
                            <th>회원등급</th>
                            <td colSpan={3}>골드</td>
                        </tr>
                    </tbody>
                </HorizontalTable>
            </Wrapper>

            <Wrapper>
                <TableTitle>추천 회원</TableTitle>
                <Table columns={columns} data={data} />
            </Wrapper>

            <Wrapper>
                <TableTitle>작업 등록 내역</TableTitle>
                <Table columns={columns2} data={data2} />
            </Wrapper>
            <Wrapper>
                <div>
                    &lt; 2023년 1월 &gt;
                    <span>
                        <button>달력</button>
                    </span>
                </div>
                <TableTitle>포인트 사용내역</TableTitle>
                <Table columns={columns3} data={data3} />
            </Wrapper>
        </div>
    );
}

MemberDetail.propTypes = {
    close: PropTypes.func.isRequired,
};
export default MemberDetail;
