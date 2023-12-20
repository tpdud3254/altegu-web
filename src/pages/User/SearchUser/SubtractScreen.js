import { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import {
    GetAge,
    GetDateTime,
    GetUserType,
    NumberWithComma,
} from "../../../utils/utils";
import { useMemo } from "react";
import { SUBTRACT_TABLE_COL } from "./table";
import Table from "../../../components/Table/Table";
import { Blank } from "../../../components/Blank";
import { PointButton } from "../../../components/Button/PointButton";
import { DefaultButton } from "../../../components/Button/DefaultButton";

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

    useEffect(() => {
        const init = async () => {
            setTableData(await getTableData(data));
        };
        console.log(data);
        init();
    }, []);

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
                subtractPoint: <SubtractPoint> 40,000AP</SubtractPoint>,
                restPoint: getRestPoint(value),
            });
        });

        return result;
    };

    const getRestPoint = (value) => {
        let isBlock = false;

        if (value.point) {
            if (value.point.curPoint - 40000 < 0) {
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
                    ? NumberWithComma(value.point.curPoint - 40000) + "AP"
                    : "-40,000AP"}
            </RestPoint>
        );
    };

    const onSubtract = async () => {
        if (block) {
            alert("보유 포인트가 부족한 회원이 있습니다.");
            return;
        }

        console.log("ok");
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
                >
                    차감 진행
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
