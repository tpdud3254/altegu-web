import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import MainLayout from "../../components/Layout/MainLayout";
import PageTitle from "../../components/PageTitle";
import MainContentLayout from "../../components/Layout/MainContentLayout";
import { Blank } from "../../components/Blank";
import { DefaultButton } from "../../components/Button/DefaultButton";
import axios from "axios";
import { SERVER, VALID } from "../../constant";
import { Reload } from "../../utils/utils";
import { PointButton } from "../../components/Button/PointButton";
import Modal from "../../components/Modal";

const Container = styled.div`
    width: 100%;
`;

const Wrapper = styled.div`
    margin-top: 20px;
    border-bottom: 1px solid grey;
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Buttons = styled.div`
    margin-top: 20px;
    display: flex;
    justify-content: center;
`;

function ManagePopup() {
    const location = useLocation();

    const [popupImageUrl, setPopupImageUrl] = useState("");
    const [showPopupModal, setShowPopupModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const popupRef = useRef();

    useEffect(() => {
        getPopupUrl();
    }, []);

    const getPopupUrl = async () => {
        axios
            .get(SERVER + "/admin/popup")
            .then(({ data }) => {
                const {
                    result,
                    data: { popup },
                } = data;

                console.log("popupImageUrl: ", popup[0].popupUrl);

                if (popup[0].popupUrl) setPopupImageUrl(popup[0].popupUrl);
                else setPopupImageUrl("");
            })
            .catch((error) => {
                setPopupImageUrl("");
            })
            .finally(() => {});
    };

    const openPopupModal = (index) => {
        setShowPopupModal(true);
    };
    const closePopupModal = () => {
        setShowPopupModal(false);
    };

    const PopupModal = () => {
        return (
            <Modal
                open={openPopupModal}
                close={closePopupModal}
                header="팝업 이미지 수정"
            >
                <div>
                    <img src={popupImageUrl} style={{ width: "50vw" }} />
                </div>
                <Buttons>
                    <input
                        ref={popupRef}
                        type="file"
                        accept="image/*"
                        onChange={onModifyPopup}
                        style={{ display: "none" }}
                    />
                    <PointButton
                        type="button"
                        onClick={onClickModifyPopupButton}
                        disabled={processing}
                    >
                        {processing ? "수정 중" : "수정"}
                    </PointButton>
                </Buttons>
            </Modal>
        );
    };

    const onClickModifyPopupButton = useCallback(() => {
        if (!popupRef.current) return;
        popupRef.current.click();
    }, []);

    const onModifyPopup = useCallback(async (e) => {
        if (!e.target.files) return;

        setProcessing(true);

        console.log(e.target.files[0]);

        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        axios
            .post(
                SERVER + "/admin/popup",
                {
                    formData,
                },
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    transformRequest: [
                        function () {
                            return formData;
                        },
                    ],
                }
            )
            .then(({ data }) => {
                const {
                    data: { location },
                    result,
                } = data;
                if (result === VALID) {
                    console.log("popup url : ", location);
                    onUploadPopupUrl(location);
                }
            })
            .catch((error) => {
                console.log("onModifyPopup error : ", error);
            })
            .finally(() => {
                setProcessing(false);
            });
    });

    const onUploadPopupUrl = async (url) => {
        try {
            const response = await axios.post(SERVER + `/admin/upload/popup`, {
                url: url,
            });

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                const {
                    data: {
                        data: { popup },
                    },
                } = response;

                console.log("onUploadPopupUrl valid");
                alert("이미지 수정에 성공하였습니다.");
                Reload();
            }
        } catch (error) {
            alert("이미지 수정에 실패하였습니다.");
            console.log("onUploadPopupUrl invalid");
            console.log(error);
        } finally {
        }
    };

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="이미지 관리" />
            <MainContentLayout show={true}>
                <form>
                    <>
                        <Container>
                            <Wrapper>
                                {popupImageUrl.length === 0 ? (
                                    <div>팝업 없음</div>
                                ) : (
                                    <img
                                        src={popupImageUrl}
                                        style={{ width: "30vw" }}
                                    />
                                )}

                                <Buttons>
                                    <PointButton
                                        type="button"
                                        onClick={openPopupModal}
                                    >
                                        {popupImageUrl.length === 0
                                            ? "등록하기"
                                            : "수정하기"}
                                    </PointButton>
                                    <Blank />
                                    <Blank />
                                    <DefaultButton
                                        type="button"
                                        onClick={() => onUploadPopupUrl("")}
                                    >
                                        삭제하기
                                    </DefaultButton>
                                </Buttons>
                            </Wrapper>
                        </Container>
                        {showPopupModal ? <PopupModal /> : null}
                    </>
                </form>
            </MainContentLayout>
        </MainLayout>
    );
}

export default ManagePopup;
