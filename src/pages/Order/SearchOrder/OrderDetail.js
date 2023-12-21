import styled from "styled-components";
import { LinkText } from "../../../components/Text/LinkText";
import {
    GetDate,
    GetDateTime,
    GetMinusDateTime,
    GetPhoneNumberWithDash,
    NumberWithComma,
    Reset,
    numberWithZero,
} from "../../../utils/utils";
import { HorizontalTable } from "../../../components/Table/HorizontalTable";
import { PointButton } from "../../../components/Button/PointButton";
import { Blank } from "../../../components/Blank";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar as ReactCalendar } from "react-calendar";
import moment from "moment";

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const Wrapper = styled.div`
    width: 100%;
    padding-top: 15px;
    padding-bottom: 15px;
`;

const Title = styled.div`
    width: 100%;
    font-weight: 600;
`;

const CalendarComponent = styled.div`
    background-color: white;
    position: absolute;
    border: 1px black solid;
    padding-top: 10px;
`;

const Buttons = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;

function OrderDetail({ onClose, data: order }) {
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const [modifyMode, setModifyMode] = useState(false);

    const [showWorkDateCalendar, setShowWorkDateCalendar] = useState(false);
    const [showRegistDateCalendar, setShowRegistDateCalendar] = useState(false);

    useEffect(() => {
        register("originalWorkDate");
        register("originalRegistDate");
    }, []);

    const getOrderId = (value) => {
        const datetime = GetMinusDateTime(value.dateTime);

        return (
            datetime.getFullYear().toString().substring(2, 4) +
            numberWithZero(datetime.getMonth() + 1) +
            numberWithZero(datetime.getDate()) +
            value.id
        );
    };

    const getOrderType = (value) => {
        return (
            <div style={{ wordBreak: "break-all" }}>
                [{value.vehicleType}] {value.direction},{" "}
                {value.direction === "양사"
                    ? "올림 : " + value.upFloor + ", 내림 : " + value.downFloor
                    : value.floor}
                , {value.volume === "시간" ? value.time : value.quantity}
            </div>
        );
    };

    const getOrderStatus = (value) => {
        switch (value.orderStatusId) {
            case 1:
                return "작업 요청"; //1
            case 2:
                return "작업 예약"; //2
            case 3:
                return "작업 예약"; //2
            case 4:
                return "작업 중"; //3
            case 5:
                return "작업 완료"; //4
            case 6:
                return "작업 완료 확인"; //5
            case 7:
                return "작업 취소"; //6
            case 8:
                return "작업 취소"; //6
            default:
                break;
        }
    };

    const WorkDateCalendar = ({ value }) => {
        const onChange = (data) => {
            console.log("selected date : ", data);
            const now = new Date();

            if (now > data) {
                alert("현재 날짜 이후의 날짜를 골라주세요.");
                return;
            }

            setValue("originalWorkDate", data);
            setValue("workDate", GetDate(data));
            setShowWorkDateCalendar(false);
        };

        return (
            <CalendarComponent>
                <ReactCalendar
                    calendarType="US"
                    onChange={onChange}
                    value={getValues("originalWorkDate")}
                    showNeighboringMonth={true}
                    formatDay={(locale, date) => moment(date).format("DD")}
                    tileContent={({ date, view }) => {
                        let html = [];

                        return (
                            <div key={date} className="contents">
                                {html}
                            </div>
                        );
                    }}
                />
            </CalendarComponent>
        );
    };
    return (
        <>
            {true ? (
                <Container>
                    <div style={{ width: "100%" }}>
                        <LinkText onClick={Reset}>작업정보 검색</LinkText> {">"}{" "}
                        작업상세정보
                    </div>
                    <Wrapper>
                        <Title>세부정보</Title>
                        <HorizontalTable>
                            <thead></thead>
                            <tbody>
                                <tr>
                                    <th>작업번호</th>
                                    <td>{getOrderId(order)}</td>
                                    <th>
                                        {modifyMode
                                            ? "작업 등록자 회원코드"
                                            : "작업 등록자"}
                                    </th>
                                    <td>
                                        {modifyMode ? (
                                            <input
                                                style={{ width: "100%" }}
                                                type="number"
                                                placeholder={
                                                    "숫자만 입력 가능 (기존 : " +
                                                    order.registUser.name +
                                                    ")"
                                                }
                                                {...register("registUser")}
                                            />
                                        ) : (
                                            order.registUser.name
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>작업일시</th>
                                    <td>
                                        {modifyMode ? (
                                            <>
                                                {" "}
                                                <input
                                                    style={{ width: "9vw" }}
                                                    disabled
                                                    {...register("workDate")}
                                                />
                                                <Blank />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setShowWorkDateCalendar(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    달력
                                                </button>
                                                <Blank />
                                                <input
                                                    placeholder="예시) 17:04"
                                                    style={{ width: "9vw" }}
                                                    {...register("workTime")}
                                                />
                                                {showWorkDateCalendar ? (
                                                    <WorkDateCalendar />
                                                ) : null}
                                            </>
                                        ) : (
                                            GetDateTime(order.dateTime)
                                        )}
                                    </td>
                                    <th>등록일시</th>
                                    <td>
                                        {modifyMode ? (
                                            <>
                                                {" "}
                                                <input
                                                    style={{ width: "9vw" }}
                                                    disabled
                                                    {...register("workDate")}
                                                />
                                                <Blank />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setShowWorkDateCalendar(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    달력
                                                </button>
                                                <Blank />
                                                <input
                                                    placeholder="예시) 17:04"
                                                    style={{ width: "9vw" }}
                                                    {...register("workTime")}
                                                />
                                                {showWorkDateCalendar ? (
                                                    <WorkDateCalendar />
                                                ) : null}
                                            </>
                                        ) : (
                                            GetDateTime(order.createdAt)
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>1차 작업 주소</th>
                                    <td>
                                        {modifyMode ? (
                                            <input
                                                style={{ width: "100%" }}
                                                placeholder={
                                                    order.address1 +
                                                    " " +
                                                    order.detailAddress1
                                                }
                                            />
                                        ) : (
                                            order.address1 +
                                            " " +
                                            order.detailAddress1
                                        )}
                                    </td>
                                    <th>2차 작업 주소</th>
                                    <td>
                                        {order.address2 ? (
                                            modifyMode ? (
                                                <input
                                                    style={{ width: "100%" }}
                                                    placeholder={
                                                        order.address2 +
                                                        " " +
                                                        order.detailAddress2
                                                    }
                                                />
                                            ) : (
                                                order.address2 +
                                                " " +
                                                order.detailAddress2
                                            )
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>작업 종류</th>
                                    <td>
                                        {!modifyMode ? (
                                            getOrderType(order)
                                        ) : (
                                            <>
                                                <select
                                                    name="orderType"
                                                    {...register("orderType")}
                                                >
                                                    <option value="1">
                                                        사다리
                                                    </option>
                                                    <option value="2">
                                                        스카이
                                                    </option>
                                                </select>
                                                <Blank />
                                                {watch("orderType") === 1 ? (
                                                    <>
                                                        <select
                                                            name="direction"
                                                            {...register(
                                                                "direction"
                                                            )}
                                                        >
                                                            <option value="1">
                                                                올림
                                                            </option>
                                                            <option value="2">
                                                                내림
                                                            </option>
                                                        </select>
                                                        <Blank />
                                                    </>
                                                ) : null}
                                                <input
                                                    type="number"
                                                    placeholder="층 수"
                                                    style={{ width: "4vw" }}
                                                />
                                                <Blank />
                                                <select
                                                    name="volume"
                                                    {...register("volume")}
                                                >
                                                    <option value="1">
                                                        시간
                                                    </option>
                                                    <option value="2">
                                                        물량
                                                    </option>
                                                </select>
                                                \<Blank />
                                                {watch("volume") === "1" ? (
                                                    <input
                                                        type="number"
                                                        placeholder="시간"
                                                    />
                                                ) : null}
                                                {watch("volume") === "2" ? (
                                                    <input
                                                        type="number"
                                                        placeholder="물량 (톤수)"
                                                    />
                                                ) : null}
                                            </>
                                        )}
                                    </td>
                                    <th>작업상태</th>
                                    <td>
                                        {modifyMode ? (
                                            <select
                                                name="orderStatus"
                                                {...register("orderStatus")}
                                            >
                                                <option value="0">전체</option>
                                                <option value="1">
                                                    작업 요청
                                                </option>
                                                <option value="2">
                                                    작업 예약
                                                </option>
                                                <option value="3">
                                                    작업 진행
                                                </option>
                                                <option value="4">
                                                    작업 완료
                                                </option>
                                                <option value="5">
                                                    작업 완료 확인
                                                </option>
                                                <option value="6">
                                                    작업 취소
                                                </option>
                                            </select>
                                        ) : (
                                            getOrderStatus(order)
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>작업 비용</th>
                                    <td>
                                        {modifyMode ? (
                                            <input
                                                type="number"
                                                {...register("price")}
                                                placeholder={order.orderPrice}
                                            />
                                        ) : (
                                            NumberWithComma(order.orderPrice)
                                        )}
                                        AP
                                    </td>
                                    <th>특이사항</th>
                                    <td>
                                        {modifyMode ? (
                                            <input
                                                style={{ width: "100%" }}
                                                {...register("memo")}
                                            />
                                        ) : order.memo ? (
                                            order.memo
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>전화번호</th>
                                    <td>
                                        {modifyMode ? (
                                            <input
                                                type="number"
                                                placeholder={order.phone}
                                            />
                                        ) : (
                                            GetPhoneNumberWithDash(order.phone)
                                        )}
                                    </td>
                                    <th>현장 전화번호</th>
                                    <td>
                                        {modifyMode ? (
                                            <input
                                                type="number"
                                                placeholder={order.directPhone}
                                            />
                                        ) : order.directPhone ? (
                                            GetPhoneNumberWithDash(
                                                order.directPhone
                                            )
                                        ) : (
                                            "-"
                                        )}
                                        {}
                                    </td>
                                </tr>
                            </tbody>
                        </HorizontalTable>
                    </Wrapper>
                    {modifyMode ? (
                        <Buttons>
                            <PointButton>완료</PointButton>
                            <Blank />
                            <Blank />
                            <PointButton
                                type="button"
                                onClick={() => setModifyMode(false)}
                            >
                                취소
                            </PointButton>
                        </Buttons>
                    ) : (
                        <Buttons>
                            <PointButton>삭제하기</PointButton>
                            <Blank />
                            <Blank />
                            <PointButton
                                type="button"
                                onClick={() =>
                                    order.orderStatusId === 1 ||
                                    order.orderStatusId === 2
                                        ? setModifyMode(true)
                                        : setModifyMode(false)
                                }
                            >
                                수정하기
                            </PointButton>
                            <Blank />
                            <Blank />
                            <PointButton type="button" onClick={onClose}>
                                닫기
                            </PointButton>
                        </Buttons>
                    )}
                </Container>
            ) : null}
        </>
    );
}

export default OrderDetail;
