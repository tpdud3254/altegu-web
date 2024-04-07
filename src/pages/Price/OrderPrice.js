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

const Tabs = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
`;

const Tab = styled.div`
    background-color: ${(props) => (props.current ? "#00000033" : "white")};
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 20px;
    padding-right: 20px;
    margin-left: 2px;
    margin-right: 2px;
    margin-bottom: 2px;
    cursor: pointer;
`;

const Line = styled.div`
    width: 1px;
    height: 44px;
    background-color: grey;
`;

const Container = styled.div`
    width: 100%;
    border: 1px solid grey;
    padding-top: 20px;
    padding-bottom: 20px;
`;

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;

const Buttons = styled.div`
    display: flex;
    justify-content: center;
    padding-bottom: 20px;
`;
const Table = styled.table`
    margin-bottom: 8px;
    border-spacing: 0;
    border: 1px solid grey;

    th,
    td {
        margin: 0;
        border-bottom: 1px solid grey;
        border-right: 1px solid grey;
        vertical-align: middle;
        height: 35px;
        width: 100px;
    }

    td {
        padding: 5px 50px 5px 5px;
        text-align: left;
    }
    th {
        font-weight: 600;
        background-color: lightgrey;
        text-align: center;
    }
    input {
        width: 100px;
    }

    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox  */
    input[type="number"] {
        -moz-appearance: textfield;
    }
`;

function OrderPrice() {
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(1);
    const [modifyMode, setModifyMode] = useState(false);

    const [ladderQuantityOptions, setLadderQuantityOptions] = useState([]);
    const [ladderQuantityTable, setLadderQuantityTable] = useState([]);
    const [modifyingLadderQuantityData, setModifyingLadderQuantityData] =
        useState([]);

    const [ladderTimeOptions, setLadderTimeOptions] = useState([[]]);
    const [ladderTimeTable, setLadderTimeTable] = useState([]);
    const [modifyingLadderTimeData, setModifyingLadderTimeData] = useState([]);

    const [skyTimeOptions, setSkyTimeOptions] = useState([]);
    const [skyTimeWeight, setSkyTimeWeight] = useState([]);
    const [skyTimeTable, setSkyTimeTable] = useState([]);
    const [modifyingSkyTimeData, setModifyingSkyTimeData] = useState([]);

    useEffect(() => {
        getAllPrice();
    }, []);

    useEffect(() => {
        if (
            ladderQuantityTable.length > 0 &&
            ladderQuantityOptions.length > 0 &&
            ladderTimeTable.length > 0 &&
            ladderTimeOptions.length > 0 &&
            skyTimeTable.length > 0 &&
            skyTimeOptions.length > 0 &&
            skyTimeWeight.length > 0
        )
            setLoading(false);
        else setLoading(true);
    }, [
        ladderQuantityTable,
        ladderQuantityOptions,
        ladderTimeTable,
        ladderTimeOptions,
        skyTimeTable,
        skyTimeOptions,
        skyTimeWeight,
    ]);

    const moveTab = (index) => {
        setTab(index);
        if (tab === 1) setModifyingLadderQuantityData([...ladderQuantityTable]);
        else if (tab === 2) setModifyingLadderTimeData([...ladderTimeTable]);
        else if (tab === 3) setModifyingSkyTimeData([...skyTimeTable]);
        setModifyMode(false);
    };

    const onCancel = (e) => {
        e.preventDefault();
        if (tab === 1) setModifyingLadderQuantityData([...ladderQuantityTable]);
        else if (tab === 2) setModifyingLadderTimeData([...ladderTimeTable]);
        else if (tab === 3) setModifyingSkyTimeData([...skyTimeTable]);
        setModifyMode(false);
    };

    const getAllPrice = async () => {
        try {
            const response = await axios.get(SERVER + "/admin/price/order", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
                params: {
                    type: "all",
                },
            });
            const {
                data: {
                    result,
                    data: { priceTable },
                },
            } = response;

            console.log(response);

            if (result === VALID) {
                saveLadderQuantityTable(
                    priceTable.ladderQuantity.options,
                    priceTable.ladderQuantity.datas
                );

                saveLadderTimeTable(
                    priceTable.ladderTime.options,
                    priceTable.ladderTime.datas
                );

                saveSkyTimeTable(
                    priceTable.skyTime.options,
                    priceTable.skyTime.weight,
                    priceTable.skyTime.datas
                );
            } else {
                console.log("getAllPrice invalid");
            }
        } catch (error) {
            console.log("getAllPrice error : ", error);
        }
    };

    const saveLadderQuantityTable = (options, data) => {
        const newArr = [];
        const optionsArr = [];

        options.map((value) => {
            const strIndex = value.title.indexOf("톤");
            optionsArr.push(value.title.substring(0, strIndex + 1));
        });

        let curOptionIndex = 1;
        let arr = [];

        data.map((value, index) => {
            if (value.optionId > curOptionIndex) {
                newArr.push(arr);
                curOptionIndex = curOptionIndex + 1;
                arr = [];
            } else if (
                value.optionId === optionsArr.length &&
                curOptionIndex === optionsArr.length &&
                index === data.length - 1
            ) {
                newArr.push(arr);
            }
            arr.push(value.price);
        });

        const resultArr = [];
        for (let x = 0; x < optionsArr.length; x++) {
            resultArr[x] = [];
            for (let y = 0; y < newArr[0].length; y++) {
                resultArr[x].push(newArr[x][y]);
            }
        }

        console.log("saveLadderQuantityTable : ", resultArr);
        setLadderQuantityOptions(optionsArr);
        setLadderQuantityTable(resultArr);
        setModifyingLadderQuantityData(resultArr);
    };

    const saveLadderTimeTable = (options, data) => {
        const newArr = [];
        const optionsArr = [];

        options.map((value) => {
            const strIndex = value.title.indexOf("(");
            if (strIndex === -1) optionsArr.push(value.title);
            else optionsArr.push(value.title.substring(0, strIndex));
        });

        let curOptionIndex = 1;
        let arr = [];

        data.map((value, index) => {
            if (value.optionId > curOptionIndex) {
                newArr.push(arr);
                curOptionIndex = curOptionIndex + 1;
                arr = [];
            } else if (
                value.optionId === optionsArr.length &&
                curOptionIndex === optionsArr.length &&
                index === data.length - 1
            ) {
                newArr.push(arr);
            }
            arr.push(value.price);
        });

        const resultArr = [];
        for (let x = 0; x < optionsArr.length; x++) {
            resultArr[x] = [];
            for (let y = 0; y < newArr[0].length; y++) {
                resultArr[x].push(newArr[x][y]);
            }
        }

        console.log("saveLadderTimeTable : ", resultArr);
        setLadderTimeOptions(optionsArr);
        setLadderTimeTable(resultArr);
        setModifyingLadderTimeData(resultArr);
    };

    const saveSkyTimeTable = (options, weight, data) => {
        const newArr = [];
        const optionsArr = [];
        const weightArr = [];

        options.map((value) => {
            optionsArr.push(value.title);
        });

        weight.map((value) => {
            weightArr.push(value.weightTitle);
        });

        let curOptionIndex = 1;
        let arr = [];

        data.map((value, index) => {
            if (value.optionId > curOptionIndex) {
                newArr.push(arr);
                curOptionIndex = curOptionIndex + 1;
                arr = [];
            } else if (
                value.optionId === optionsArr.length &&
                curOptionIndex === optionsArr.length &&
                index === data.length - 1
            ) {
                newArr.push(arr);
            }
            arr.push(value.price);
        });

        const resultArr = [];
        for (let x = 0; x < optionsArr.length; x++) {
            resultArr[x] = [];
            for (let y = 0; y < newArr[0].length; y++) {
                resultArr[x].push(newArr[x][y]);
            }
        }

        console.log("saveSkyTimeTable : ", resultArr);
        setSkyTimeOptions(optionsArr);
        setSkyTimeWeight(weightArr);
        setSkyTimeTable(resultArr);
        setModifyingSkyTimeData(resultArr);
    };

    const onChangeLadderQuantity = (e, floorIndex, optionsIndex) => {
        console.log(
            e.target.value,
            floorIndex + 2 + "층",
            ladderQuantityOptions[optionsIndex]
        );

        const prev1 = [...modifyingLadderQuantityData];
        const prev2 = [...prev1[optionsIndex]];

        prev2[floorIndex] = Number(e.target.value);
        prev1[optionsIndex] = prev2;

        setModifyingLadderQuantityData([...prev1]);
    };

    const onChangeLadderTime = (e, floorIndex, optionsIndex) => {
        console.log(
            e.target.value,
            floorIndex + 2 + "층",
            ladderTimeOptions[optionsIndex]
        );

        const prev1 = [...modifyingLadderTimeData];
        const prev2 = [...prev1[optionsIndex]];

        prev2[floorIndex] = Number(e.target.value);
        prev1[optionsIndex] = prev2;

        setModifyingLadderTimeData([...prev1]);
    };

    const onChangeSkyTime = (e, weightIndex, optionsIndex) => {
        console.log(
            e.target.value,
            skyTimeWeight[weightIndex],
            skyTimeOptions[optionsIndex]
        );

        const prev1 = [...modifyingSkyTimeData];
        const prev2 = [...prev1[optionsIndex]];

        prev2[weightIndex] = Number(e.target.value);
        prev1[optionsIndex] = prev2;

        setModifyingSkyTimeData([...prev1]);
    };

    const onValid = async (e) => {
        e.preventDefault();
        const sendData = [];

        if (tab === 1) {
            modifyingLadderQuantityData.map((option, optionIndex) => {
                option.map((floor, floorIndex) => {
                    if (
                        modifyingLadderQuantityData[optionIndex][floorIndex] !==
                        ladderQuantityTable[optionIndex][floorIndex]
                    )
                        sendData.push({
                            floor: floorIndex + 2,
                            optoin: optionIndex + 1,
                            price: modifyingLadderQuantityData[optionIndex][
                                floorIndex
                            ],
                        });
                });
            });
        } else if (tab === 2) {
            modifyingLadderTimeData.map((option, optionIndex) => {
                option.map((floor, floorIndex) => {
                    if (
                        modifyingLadderTimeData[optionIndex][floorIndex] !==
                        ladderTimeTable[optionIndex][floorIndex]
                    )
                        sendData.push({
                            floor: floorIndex + 2,
                            optoin: optionIndex + 1,
                            price: modifyingLadderTimeData[optionIndex][
                                floorIndex
                            ],
                        });
                });
            });
        } else if (tab === 3) {
            modifyingSkyTimeData.map((option, optionIndex) => {
                option.map((weight, weightIndex) => {
                    if (
                        modifyingSkyTimeData[optionIndex][weightIndex] !==
                        skyTimeTable[optionIndex][weightIndex]
                    )
                        sendData.push({
                            weight: weightIndex + 1,
                            optoin: optionIndex + 1,
                            price: modifyingSkyTimeData[optionIndex][
                                weightIndex
                            ],
                        });
                });
            });
        }

        try {
            const response = await axios.patch(SERVER + "/admin/price/order", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
                data: sendData,
                type:
                    tab === 1
                        ? "ladderQuantity"
                        : tab === 2
                        ? "ladderTime"
                        : "skyTime",
            });

            const {
                data: { result, data },
            } = response;

            console.log(response);
            if (result === VALID) {
                if (tab === 1)
                    setLadderQuantityTable([...modifyingLadderQuantityData]);
                else if (tab === 2)
                    setLadderTimeTable([...modifyingLadderTimeData]);
                else if (tab === 3) setSkyTimeTable([...modifyingSkyTimeData]);
            } else {
                console.log("onValid invalid");
                alert("수정 실패");
            }
        } catch (error) {
            console.log("onValid error : ", error);
        } finally {
            setModifyMode(false);
        }
    };

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="금액 관리" />
            <Tabs>
                <Tab current={tab === 1} onClick={() => moveTab(1)}>
                    사다리 (물량)
                </Tab>
                <Line />
                <Tab current={tab === 2} onClick={() => moveTab(2)}>
                    사다리 (시간)
                </Tab>
                <Line />
                <Tab current={tab === 3} onClick={() => moveTab(3)}>
                    스카이
                </Tab>
            </Tabs>
            {!loading ? (
                <MainContentLayout show>
                    <form onSubmit={onValid}>
                        <>
                            <Container>
                                <Buttons>
                                    {!modifyMode ? (
                                        <DefaultButton
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setModifyMode(true);
                                            }}
                                        >
                                            수정
                                        </DefaultButton>
                                    ) : (
                                        <>
                                            <DefaultButton type="submit">
                                                저장
                                            </DefaultButton>
                                            <Blank />
                                            <Blank />
                                            <DefaultButton onClick={onCancel}>
                                                취소
                                            </DefaultButton>
                                        </>
                                    )}
                                </Buttons>
                                <Wrapper>
                                    {tab === 1 ? (
                                        <Table>
                                            <tbody>
                                                <tr>
                                                    <th></th>
                                                    {Object.keys(
                                                        ladderQuantityOptions
                                                    ).map((value, index) => {
                                                        return (
                                                            <th key={index}>
                                                                {
                                                                    ladderQuantityOptions[
                                                                        value
                                                                    ]
                                                                }
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                                {ladderQuantityTable[0].map(
                                                    (_, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <th>
                                                                    {index + 2 <
                                                                    25
                                                                        ? index +
                                                                          2 +
                                                                          "층"
                                                                        : index +
                                                                          2 +
                                                                          "층 이상"}
                                                                </th>
                                                                {ladderQuantityTable.map(
                                                                    (
                                                                        _,
                                                                        optionIndex
                                                                    ) => (
                                                                        <td
                                                                            key={
                                                                                optionIndex
                                                                            }
                                                                        >
                                                                            {!modifyMode ? (
                                                                                ladderQuantityTable[
                                                                                    optionIndex
                                                                                ][
                                                                                    index
                                                                                ] ===
                                                                                0 ? (
                                                                                    "협의"
                                                                                ) : (
                                                                                    NumberWithComma(
                                                                                        ladderQuantityTable[
                                                                                            optionIndex
                                                                                        ][
                                                                                            index
                                                                                        ]
                                                                                    )
                                                                                )
                                                                            ) : (
                                                                                <input
                                                                                    type="number"
                                                                                    defaultValue={
                                                                                        modifyingLadderQuantityData[
                                                                                            optionIndex
                                                                                        ][
                                                                                            index
                                                                                        ]
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        onChangeLadderQuantity(
                                                                                            e,
                                                                                            index,
                                                                                            optionIndex
                                                                                        )
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </td>
                                                                    )
                                                                )}
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                            </tbody>
                                        </Table>
                                    ) : null}
                                    {tab === 2 ? (
                                        <Table>
                                            <tbody>
                                                <tr>
                                                    <th></th>
                                                    {Object.keys(
                                                        ladderTimeOptions
                                                    ).map((value, index) => {
                                                        return (
                                                            <th key={index}>
                                                                {
                                                                    ladderTimeOptions[
                                                                        value
                                                                    ]
                                                                }
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                                {ladderTimeTable[0].map(
                                                    (_, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <th>
                                                                    {index + 2 <
                                                                    26
                                                                        ? index +
                                                                          2 +
                                                                          "층"
                                                                        : index +
                                                                          2 +
                                                                          "층 이상"}
                                                                </th>
                                                                {ladderTimeTable.map(
                                                                    (
                                                                        _,
                                                                        optionIndex
                                                                    ) => (
                                                                        <td
                                                                            key={
                                                                                optionIndex
                                                                            }
                                                                        >
                                                                            {!modifyMode ? (
                                                                                ladderTimeTable[
                                                                                    optionIndex
                                                                                ][
                                                                                    index
                                                                                ] ===
                                                                                0 ? (
                                                                                    "협의"
                                                                                ) : (
                                                                                    NumberWithComma(
                                                                                        ladderTimeTable[
                                                                                            optionIndex
                                                                                        ][
                                                                                            index
                                                                                        ]
                                                                                    )
                                                                                )
                                                                            ) : (
                                                                                <input
                                                                                    type="number"
                                                                                    defaultValue={
                                                                                        modifyingLadderTimeData[
                                                                                            optionIndex
                                                                                        ][
                                                                                            index
                                                                                        ]
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        onChangeLadderTime(
                                                                                            e,
                                                                                            index,
                                                                                            optionIndex
                                                                                        )
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </td>
                                                                    )
                                                                )}
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                            </tbody>
                                        </Table>
                                    ) : null}
                                    {tab === 3 ? (
                                        <Table curTab={3}>
                                            <tbody>
                                                <tr>
                                                    <th></th>
                                                    {Object.keys(
                                                        skyTimeOptions
                                                    ).map((value, index) => {
                                                        return (
                                                            <th key={index}>
                                                                {
                                                                    skyTimeOptions[
                                                                        value
                                                                    ]
                                                                }
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                                {skyTimeWeight.map(
                                                    (weight, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <th>
                                                                    {weight}
                                                                </th>
                                                                {skyTimeTable.map(
                                                                    (
                                                                        _,
                                                                        optionIndex
                                                                    ) => (
                                                                        <td
                                                                            key={
                                                                                optionIndex
                                                                            }
                                                                        >
                                                                            {!modifyMode ? (
                                                                                skyTimeTable[
                                                                                    optionIndex
                                                                                ][
                                                                                    index
                                                                                ] ===
                                                                                0 ? (
                                                                                    "협의"
                                                                                ) : (
                                                                                    NumberWithComma(
                                                                                        skyTimeTable[
                                                                                            optionIndex
                                                                                        ][
                                                                                            index
                                                                                        ]
                                                                                    )
                                                                                )
                                                                            ) : (
                                                                                <input
                                                                                    type="number"
                                                                                    defaultValue={
                                                                                        modifyingSkyTimeData[
                                                                                            optionIndex
                                                                                        ][
                                                                                            index
                                                                                        ]
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        onChangeSkyTime(
                                                                                            e,
                                                                                            index,
                                                                                            optionIndex
                                                                                        )
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </td>
                                                                    )
                                                                )}
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                            </tbody>
                                        </Table>
                                    ) : null}
                                </Wrapper>
                            </Container>
                        </>
                    </form>
                </MainContentLayout>
            ) : null}
        </MainLayout>
    );
}

export default OrderPrice;
