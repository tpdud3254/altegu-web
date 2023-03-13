import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table/Table";
import Modal from "../../components/Modal";
import { HorizontalTable } from "../../components/Table/HorizontalTable";
import MemberDetail from "./MemberDetail";
import axios from "axios";
import { SERVER, VALID } from "../../contant";
import {
  getAge,
  getDateTime,
  getWorkRegion,
  numberWithComma,
} from "../../utils/utils";
import { useForm } from "react-hook-form";

const tableCol = [
  { accessor: "num", Haeder: "" },
  {
    accessor: "userId",
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
    accessor: "gender",
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
    accessor: "recommendUser",
    Header: "추천인",
  },
  {
    accessor: "status",
    Header: "상태",
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

function SearchMembers() {
  const { register, handleSubmit, setValue } = useForm();

  const [modalOpen, setModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [showPointModal, setShowPointModal] = useState(false);
  const [showRecommendUserModal, setShowRecommendUserModal] = useState(false);

  const [userData, setUserData] = useState([]);
  const [userIndex, setUserIndex] = useState(null);

  const tableData = (data) => {
    const result = [];
    data.map((value, index) => {
      result.push({
        num: index + 1,
        userId: value.userId,
        name: value.userName,
        signUpDate: getDateTime(value.createdAt),
        age: getAge(value.birth),
        gender: value.gender,
        phone: value.phone,
        workCategory: value.userType.category,
        region: value.accessedRegion,
        workRegion: getWorkRegion(value.workRegion),
        password: <button>초기화</button>,
        point: (
          <button onClick={() => openPointModal(index)}>
            {numberWithComma(value.point.curPoint) + "AP"}
          </button>
        ),
        recommendUser: (
          <button onClick={() => openRecommendUserModal(index)}>
            {value.recommendUser
              ? `${value.recommendUser.userName} (${value.recommendUser.userId})`
              : "없음"}
          </button>
        ),
        status: value.status,
      });
    });
    return result;
  };

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      const response = await axios.get(SERVER + "/admin/users");

      const {
        data: {
          data: { users },
          result,
          msg,
        },
      } = response;

      console.log(users);
      if (result === VALID) setUserData(users);
      else alert(msg);
    } catch (error) {
      alert(error);
    }
  };

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

  const openPointModal = (index) => {
    setShowPointModal(true);
    setUserIndex(index);
  };
  const closePointModal = () => {
    setShowPointModal(false);
    setUserIndex(null);
    setValue("pointsData", "");
  };

  const openRecommendUserModal = (index) => {
    setShowRecommendUserModal(true);
    setUserIndex(index);
  };
  const closeRecommendUserModal = () => {
    setShowRecommendUserModal(false);
    setUserIndex(null);
    setValue("recommendUserData", "");
  };

  const onValid = async ({ pointsData, recommendUserData }) => {
    if (pointsData && pointsData.length > 0) {
      try {
        const response = await axios.patch(SERVER + "/admin/points", {
          pointId: userData[userIndex].point.id,
          points: Number.parseInt(pointsData),
        });

        const {
          data: {
            data: { points },
            result,
            msg,
          },
        } = response;

        console.log(points);

        if (result === VALID) {
          await getUsers();
          closePointModal();
        } else alert(msg);
      } catch (error) {
        console.log(error);
      }
    }
    console.log(recommendUserData);
    if (recommendUserData && recommendUserData.length > 0) {
      try {
        const response = await axios.patch(SERVER + "/admin/recommend", {
          id: userData[userIndex].id,
          userId: recommendUserData,
        });

        console.log(response.data);

        const {
          data: { result },
        } = response;

        if (result === VALID) {
          const {
            data: {
              data: { user },
            },
          } = response;
          console.log(user);

          await getUsers();
          closeRecommendUserModal();
        } else {
          const {
            data: { msg },
          } = response;

          alert(msg);
        }
      } catch (error) {
        console.log(error);
        alert("error");
      }
      //TODO: 예외처리 이렇게 바꾸기
    }
  };

  const columns = useMemo(() => tableCol, []);
  const data = tableData(userData);

  const PointModal = () => (
    <Modal open={openPointModal} close={closePointModal} header="포인트 변경">
      <HorizontalTable>
        <thead></thead>
        <tbody>
          <tr>
            <th>현재 포인트</th>
            <td>
              {numberWithComma(userData[userIndex].point.curPoint) + "AP"}
            </td>
          </tr>
          <tr>
            <th>포인트 변경</th>
            <td>
              <input type="number" {...register("pointsData")}></input>
            </td>
          </tr>
        </tbody>
        <button type="submit">포인트 변경</button>
      </HorizontalTable>
    </Modal>
  );

  const RecommendUserModal = () => (
    <Modal
      open={openRecommendUserModal}
      close={closeRecommendUserModal}
      header="추천인 변경"
    >
      <HorizontalTable>
        <thead></thead>
        <tbody>
          <tr>
            <th>현재 추천인</th>
            <td>
              {userData[userIndex].recommendUser
                ? `${userData[userIndex].recommendUser.userName} (${userData[userIndex].recommendUser.userId})`
                : "없음"}
            </td>
          </tr>
          <tr>
            <th>추천인 변경</th>
            <td>
              <input
                type="text"
                {...register("recommendUserData")}
                placeholder="추천인 고유번호 입력"
              ></input>
            </td>
          </tr>
        </tbody>
        <button type="submit">추천인 변경</button>
      </HorizontalTable>
    </Modal>
  );

  return (
    <>
      <form onSubmit={handleSubmit(onValid)}>
        {!showDetail ? (
          <>
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
                        <option value="orange">이용정지</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <th>구분</th>
                    <td>
                      <select name="choice">
                        <option value="all">가구업</option>
                        <option value="apple">인테리어</option>
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
                  <button>엑셀 다운로드</button>
                </div>
              </ResultWrapper>
              <Table columns={columns} data={data} />
            </ResultContainer>
            {showPointModal ? <PointModal /> : null}
            {showRecommendUserModal ? <RecommendUserModal /> : null}
            <Modal open={modalOpen} close={closeModal} header="상세정보">
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
      </form>
    </>
  );
}

SearchMembers.propTypes = {};
export default SearchMembers;
