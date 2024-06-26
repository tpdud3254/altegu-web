import { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import {
    GetAge,
    GetDateTime,
    GetUserType,
    NumberWithComma,
    Reload,
} from "../../../utils/utils";
import { useMemo } from "react";
import { SUBTRACT_TABLE_COL } from "./table";
import Table from "../../../components/Table/Table";
import { Blank } from "../../../components/Blank";
import { PointButton } from "../../../components/Button/PointButton";
import { DefaultButton } from "../../../components/Button/DefaultButton";
import axios from "axios";
import { SERVER, VALID } from "../../../constant";

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;
`;

const Wrapper = styled.div`
    width: 90%;
`;
const SubtractPoint = styled.div`
    color: orange;
    font-weight: 600;
`;

const RestPoint = styled.div`
    color: ${(props) => (props.block ? "red" : "black")};
    font-weight: 600;
`;

const Buttons = styled.div`
    padding-top: 30px;
`;

function SubtractScreen({ data, onClose }) {
    const [tableData, setTableData] = useState(null);
    const [block, setBlock] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [price, setPrice] = useState(0);

    useEffect(() => {
        getMembershipPrice();
    }, []);

    useEffect(() => {
        const init = async () => {
            setTableData(await getTableData(data));
        };

        if (price > 0) init();
    }, [price]);

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
            console.log(response);
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

    const getTableData = async (data) => {
        const result = [];

        data.map((value, index) => {
            result.push({
                num: index + 1,
                userId: value.id,
                name: value.name,
                signUpDate: GetDateTime(value.createdAt),
                age: GetAge(value.birth),
                gender: value.gender,
                phone: value.phone,
                userType:
                    value.userTypeId === 3
                        ? GetUserType(value.userTypeId) +
                          ">" +
                          value.workCategory.name
                        : GetUserType(value.userTypeId),
                curPoint: value.point
                    ? NumberWithComma(value.point.curPoint) + "AP"
                    : "0AP",
                subtractPoint: (
                    <SubtractPoint>{NumberWithComma(price)}AP</SubtractPoint>
                ),
                restPoint: getRestPoint(value),
            });
        });

        return result;
    };

    const getRestPoint = (value) => {
        let isBlock = false;

        if (value.point) {
            if (value.point.curPoint - Number(price) < 0) {
                setBlock(true);
                isBlock = true;
            }
        } else {
            setBlock(true);
            isBlock = true;
        }
        return (
            <RestPoint block={isBlock}>
                {value.point
                    ? NumberWithComma(value.point.curPoint - Number(price)) +
                      "AP"
                    : "-33,000AP"}
            </RestPoint>
        );
    };

    const onSubtract = async () => {
        setProcessing(true);
        if (block) {
            alert("보유 포인트가 부족한 회원이 있습니다.");
            return;
        }

        try {
            const pointList = [];

            data.map((user, index) => {
                const obj = {
                    userId: user.id,
                    pointId: user.point.id,
                    point: Number(user.point.curPoint) - Number(price),
                    subtractPoint: Number(price),
                    text: "회비 차감",
                };
                pointList.push(obj);
            });

            console.log(pointList);

            const response = await axios.patch(
                SERVER + "/admin/points/subtract",
                {
                    pointList,
                }
            );

            const {
                data: {
                    data: { points },
                    result,
                    msg,
                },
            } = response;

            console.log(points);

            if (result === VALID) {
                alert("회비 차감에 성공하였습니다.");
                Reload();
            } else {
                console.log("onModifyPoint invalid");
                alert("회비 차감에 실패하였습니다.");
            }
        } catch (error) {
            alert("회비 차감에 실패하였습니다.");
            console.log("onModifyPoint error : ", error);
        } finally {
            setProcessing(false);
        }
    };

    const columns = useMemo(() => SUBTRACT_TABLE_COL, []);

    return (
        <Container>
            <Wrapper>
                {tableData !== null ? (
                    <Table columns={columns} data={tableData} />
                ) : null}
            </Wrapper>
            <Buttons>
                <PointButton
                    type="button"
                    onClick={onSubtract}
                    style={{ backgroundColor: "red", color: "white" }}
                    disabled={processing}
                >
                    {processing ? "차감 중" : "차감 진행"}
                </PointButton>
                <Blank />
                <Blank />
                <DefaultButton type="button" onClick={onClose}>
                    취소
                </DefaultButton>
            </Buttons>
        </Container>
    );
}

export default SubtractScreen;
