import styled from "styled-components";
import React, { useState } from "react";
import { PointButton } from "../../../components/Button/PointButton";
import { Blank } from "../../../components/Blank";
import { HorizontalTable } from "../../../components/Table/HorizontalTable";
import {
    ADMIN_POSITION,
    BANK_LIST,
    SERVER,
    TELECOM,
    VALID,
} from "../../../constant";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useEffect } from "react";
import { LinkText } from "../../../components/Text/LinkText";
import { MENUS, SUB_MENUS } from "../../../utils/menus";
import { Reload } from "../../../utils/utils";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const Wrapper = styled.div`
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
`;

const PageTitle = styled.div`
    width: 100%;
`;

const Title = styled.div`
    width: 100%;
    font-weight: 600;
    font-size: larger;
    padding-bottom: 3px;
`;
const Buttons = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    padding-top: 10px;
`;

const Line = styled.div`
    width: 50%;
    height: 1px;
    background-color: grey;
    margin: 20px 0px;
`;

function ModifyAdmin({ onClose, data }) {
    const { register, handleSubmit, watch } = useForm();

    const [loading, setLoading] = useState(true);
    const [originalData, setOriginalData] = useState(null);
    const [permission, setPermission] = useState(null);

    useEffect(() => {
        const json = JSON.parse(data.permission);
        setPermission(json);
        setOriginalData({
            ...data?.original,
            bankAccountName: data?.bankAccountName,
        });
    }, []);

    useEffect(() => {
        if (!permission || !originalData) setLoading(true);
        else setLoading(false);
    }, [permission, originalData]);

    const onValidUserInfo = async (data) => {
        const {
            bank,
            bankAccountName,
            bankAccountNumber,
            idNumber1,
            idNumber2,
            name,
            password,
            position,
            telecom,
            verifiedPassword,
        } = data;

        const prevData = {
            bank: BANK_LIST.indexOf(
                originalData.bankAccount.split(" ")[0]
            ).toString(),
            bankAccountName: originalData.bankAccountName,
            bankAccountNumber: originalData.bankAccount.split(" ")[1],
            idNumber1: originalData.idNumber.substring(0, 6),
            idNumber2: originalData.idNumber.substring(7, 13),
            name: originalData.name,
            position: ADMIN_POSITION.indexOf(originalData.position).toString(),
            telecom: TELECOM.indexOf(originalData.telecom).toString(),
        };

        if (password.length > 0)
            if (verifiedPassword.length === 0) {
                alert("수정할 비밀번호란을 확인해주세요.");
                return;
            }

        if (verifiedPassword.length > 0)
            if (password.length === 0) {
                alert("수정할 비밀번호란을 확인해주세요.");
                return;
            }

        if (password !== verifiedPassword) {
            alert("비밀번호가 일치 하지 않습니다.");
            return;
        }

        if (idNumber1.length > 0)
            if (idNumber2.length === 0) {
                alert("주민등록번호를 확인해주세요.");
                return;
            }

        if (idNumber2.length > 0)
            if (idNumber1.length === 0) {
                alert("주민등록번호를 확인해주세요.");
                return;
            }

        const bankId = bank === prevData.bank ? null : Number(bank);
        const telecomId = telecom === prevData.telecom ? null : Number(telecom);
        const positionId =
            position === prevData.position ? null : Number(position);

        if (bankId === 0) {
            alert("은행을 선택해주세요.");
            return;
        }

        if (telecomId === 0) {
            alert("통신사를 선택해주세요.");
            return;
        }

        if (positionId === 0) {
            alert("직책을 선택해주세요.");
            return;
        }

        const userId = originalData.phone.replace(/-/g, "");

        const sendData = {
            userId,
            password: password.length > 0 ? password : null,
            name: name.length > 0 ? name : null,
            idNumber: idNumber1.length > 0 ? idNumber1 + "-" + idNumber2 : null,
            bank: bankId,
            bankAccountName:
                bankAccountName.length > 0 ? bankAccountName : null,
            bankAccountNumber:
                bankAccountNumber.length > 0 ? bankAccountNumber : null,
            telecomId,
            positionId,
        };

        try {
            const response = await axios.post(SERVER + `/admin/update`, {
                ...sendData,
            });

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                console.log("admin update account valid");
                alert("회원정보 수정에 성공하였습니다.");
                Reload();
            }
        } catch (error) {
            alert("회원정보 수정에 실패하였습니다.");
            console.log("admin update account invalid");
            console.log(error);
        }
    };

    const onValidPermission = async (data) => {
        const { permission } = data;

        const sendData = {
            funtionPermissions: [],
            menuPermissions: [],
            submenuPermissions: [],
        };

        Object.keys(MENUS).map((menu) => {
            const submenuPermission =
                permission.submenuPermissions[MENUS[menu].id];

            let result = false;

            Object.keys(submenuPermission).map((submenu) => {
                if (submenuPermission[submenu]) {
                    result = true;
                    sendData.submenuPermissions.push(submenu);
                }
            });

            if (result) sendData.menuPermissions.push(MENUS[menu].id);

            const functionPermissions =
                permission.functionPermissions[MENUS[menu].id];

            if (functionPermissions) {
                Object.keys(functionPermissions).map((fn) => {
                    if (functionPermissions[fn])
                        sendData.funtionPermissions.push(fn);
                });
            }
        });

        const userId = originalData.phone.replace(/-/g, "");

        try {
            const response = await axios.post(SERVER + `/admin/update`, {
                userId,
                permission: JSON.stringify(sendData),
            });

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                console.log("admin update account valid");
                alert("회원권한 수정에 성공하였습니다.");
                Reload();
            }
        } catch (error) {
            alert("회원권한 수정에 실패하였습니다.");
            console.log("admin update account invalid");
            console.log(error);
        }
    };

    const getSubmenuPermission = (menuId, submenuId) => {
        return permission?.menuPermissions?.find((id) => id === menuId) &&
            permission?.submenuPermissions?.find((id) => id === submenuId)
            ? true
            : false;
    };

    const getFunctionPermission = (menuId, fnId) => {
        return permission?.menuPermissions?.find((id) => id === menuId) &&
            permission?.funtionPermissions?.find((id) => id === fnId)
            ? true
            : false;
    };

    return (
        <>
            {loading ? null : (
                <Container>
                    <PageTitle>
                        <LinkText onClick={() => onClose()}>
                            {" "}
                            관리자 관리
                        </LinkText>{" "}
                        {">"} 관리자 수정
                    </PageTitle>

                    <Wrapper>
                        <Title>기본 정보</Title>
                        <form onSubmit={handleSubmit(onValidUserInfo)}>
                            <HorizontalTable>
                                <thead></thead>
                                <tbody>
                                    <tr>
                                        <th>아이디 (연락처)</th>
                                        <td>{originalData.phone}</td>
                                    </tr>
                                    <tr>
                                        <th>비밀번호</th>
                                        <td>
                                            <input
                                                type="password"
                                                {...register("password")}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>비밀번호 확인</th>
                                        <td>
                                            <input
                                                type="password"
                                                {...register(
                                                    "verifiedPassword"
                                                )}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>이름</th>
                                        <td>
                                            <input
                                                {...register("name")}
                                                placeholder={originalData.name}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>주민번호</th>
                                        <td>
                                            <input
                                                type="number"
                                                style={{ width: 80 }}
                                                placeholder={originalData.idNumber.substring(
                                                    0,
                                                    6
                                                )}
                                                {...register("idNumber1")}
                                            />
                                            <Blank />
                                            -
                                            <Blank />
                                            <input
                                                type="number"
                                                style={{ width: 80 }}
                                                placeholder={originalData.idNumber?.substring(
                                                    7,
                                                    13
                                                )}
                                                {...register("idNumber2")}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>예금주</th>
                                        <td>
                                            <input
                                                {...register("bankAccountName")}
                                                placeholder={
                                                    originalData.bankAccountName
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>계좌번호</th>
                                        <td>
                                            <select
                                                name="bank"
                                                {...register("bank", {
                                                    value: BANK_LIST.indexOf(
                                                        originalData.bankAccount.split(
                                                            " "
                                                        )[0]
                                                    ).toString(),
                                                })}
                                            >
                                                {BANK_LIST.map(
                                                    (bank, index) => (
                                                        <option
                                                            value={index}
                                                            key={index}
                                                            defaultValue={watch(
                                                                "bank",
                                                                BANK_LIST.indexOf(
                                                                    originalData.bankAccount.split(
                                                                        " "
                                                                    )[0]
                                                                ).toString()
                                                            )}
                                                        >
                                                            {bank}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                            <Blank />
                                            <input
                                                type="number"
                                                placeholder={
                                                    originalData.bankAccount.split(
                                                        " "
                                                    )[1]
                                                }
                                                {...register(
                                                    "bankAccountNumber"
                                                )}
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <th>통신사</th>
                                        <td>
                                            <select
                                                name="telecom"
                                                {...register("telecom", {
                                                    value: TELECOM.indexOf(
                                                        originalData.telecom
                                                    ).toString(),
                                                })}
                                            >
                                                {TELECOM.map(
                                                    (telecom, index) => (
                                                        <option
                                                            value={index}
                                                            key={index}
                                                            defaultValue={watch(
                                                                "telecom",
                                                                TELECOM.indexOf(
                                                                    data
                                                                        ?.original
                                                                        ?.telecom
                                                                ).toString()
                                                            )}
                                                        >
                                                            {telecom}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>직책</th>
                                        <td>
                                            <select
                                                name="position"
                                                {...register("position", {
                                                    value: ADMIN_POSITION.indexOf(
                                                        originalData.position
                                                    ).toString(),
                                                })}
                                            >
                                                {ADMIN_POSITION.map(
                                                    (position, index) => (
                                                        <option
                                                            value={index}
                                                            key={index}
                                                            defaultValue={watch(
                                                                "position",
                                                                ADMIN_POSITION.indexOf(
                                                                    data
                                                                        ?.original
                                                                        ?.position
                                                                ).toString()
                                                            )}
                                                        >
                                                            {position}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </HorizontalTable>
                            <Buttons>
                                <PointButton type="submit">
                                    기본정보 수정
                                </PointButton>
                                <Blank />
                                <Blank />
                                <Blank />
                            </Buttons>
                        </form>
                    </Wrapper>
                    <Line />
                    <Wrapper>
                        <Title>권한 설정</Title>
                        <form onSubmit={handleSubmit(onValidPermission)}>
                            <HorizontalTable>
                                <thead></thead>
                                <tbody>
                                    {Object.keys(MENUS).map(
                                        (menu, menuIndex) => (
                                            <tr key={menuIndex}>
                                                <th>{MENUS[menu].name}</th>
                                                <td>
                                                    {SUB_MENUS[menu].map(
                                                        (
                                                            submenu,
                                                            submenuIndex
                                                        ) => (
                                                            <div
                                                                key={
                                                                    submenuIndex
                                                                }
                                                                style={{
                                                                    paddingTop: 2,
                                                                    paddingBottom: 2,
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    {...register(
                                                                        "permission.submenuPermissions." +
                                                                            MENUS[
                                                                                menu
                                                                            ]
                                                                                .id +
                                                                            "." +
                                                                            submenu.id,
                                                                        {
                                                                            value: getSubmenuPermission(
                                                                                MENUS[
                                                                                    menu
                                                                                ]
                                                                                    .id,
                                                                                submenu.id
                                                                            ),
                                                                        }
                                                                    )}
                                                                />
                                                                {submenu.name}
                                                                {submenu.func?.map(
                                                                    (
                                                                        func,
                                                                        funcIndex
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                funcIndex
                                                                            }
                                                                            style={{
                                                                                marginLeft: 15,
                                                                            }}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                {...register(
                                                                                    "permission.functionPermissions." +
                                                                                        MENUS[
                                                                                            menu
                                                                                        ]
                                                                                            .id +
                                                                                        "." +
                                                                                        func.id,
                                                                                    {
                                                                                        value: getFunctionPermission(
                                                                                            MENUS[
                                                                                                menu
                                                                                            ]
                                                                                                .id,
                                                                                            func.id
                                                                                        ),
                                                                                    }
                                                                                )}
                                                                            />
                                                                            {
                                                                                func.name
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </HorizontalTable>
                            <Buttons>
                                <PointButton type="submit">
                                    권한 수정
                                </PointButton>
                                <Blank />
                                <Blank />
                                <Blank />
                            </Buttons>
                        </form>
                    </Wrapper>
                </Container>
            )}
        </>
    );
}

export default ModifyAdmin;
