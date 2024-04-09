import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
    border-bottom: 1px solid grey;
    margin-bottom: 15px;
    padding-bottom: 15px;
`;

const Title = styled.div`
    font-weight: 600;
    font-size: large;
    margin-bottom: 10px;
`;

const Banner = styled.div`
    display: flex;
    align-items: flex-end;
`;

const Link = styled.div`
    display: flex;
    align-items: center;
    margin-top: 10px;
    font-weight: 600;
`;

const Buttons = styled.div`
    margin-left: 10px;
`;

function ManageBanner() {
    const location = useLocation();
    const { register, handleSubmit, setValue, watch, getValues } = useForm();

    const [modifyMode, setModifyMode] = useState(false);

    const [bannerList, setBannerList] = useState([]);
    const [bannerIndex, setBannerIndex] = useState(null);
    const [bannerLinkIndex, setBannerLinkIndex] = useState(null);
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const bannerRef = useRef();

    useEffect(() => {
        getBannerList();
    }, []);

    const getBannerList = async () => {
        axios
            .get(SERVER + "/admin/banner")
            .then(({ data }) => {
                const {
                    result,
                    data: { list },
                } = data;

                console.log("banner list: ", list);

                setBannerList(list);
            })
            .catch((error) => {
                setBannerList([]);
            })
            .finally(() => {});
    };

    const openBannerModal = (index) => {
        setShowBannerModal(true);
        setBannerIndex(index);
    };
    const closeBannerModal = () => {
        setShowBannerModal(false);
        setBannerIndex(null);
    };

    const BannerModal = () => {
        return (
            <Modal
                open={openBannerModal}
                close={closeBannerModal}
                header={"배너 " + (bannerIndex + 1)}
            >
                <div>
                    <img
                        src={bannerList[bannerIndex].imageUrl}
                        style={{ width: "50vw" }}
                    />
                </div>
                <Buttons>
                    <input
                        ref={bannerRef}
                        type="file"
                        accept="image/*"
                        onChange={onModifyBanner}
                        style={{ display: "none" }}
                    />
                    <PointButton
                        type="button"
                        onClick={onClickModifyBannerButton}
                        disabled={processing}
                    >
                        {processing ? "수정 중" : "수정"}
                    </PointButton>
                </Buttons>
            </Modal>
        );
    };

    const onClickModifyBannerButton = useCallback(() => {
        if (!bannerRef.current) return;
        bannerRef.current.click();
    }, []);

    const onModifyBanner = useCallback(async (e) => {
        if (!e.target.files) return;

        setProcessing(true);

        console.log(e.target.files[0]);

        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        axios
            .post(
                SERVER + "/admin/banner",
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
                    console.log("banner url : ", location);
                    onUploadBannerUrl(location);
                }
            })
            .catch((error) => {
                console.log("onModifyBanner error : ", error);
            })
            .finally(() => {
                setProcessing(false);
            });
    });

    const onUploadBannerUrl = async (url) => {
        try {
            const response = await axios.post(SERVER + `/admin/upload/banner`, {
                id: bannerList[bannerIndex].id,
                url: url,
            });

            const {
                data: { result },
            } = response;

            if (result === VALID) {
                const {
                    data: {
                        data: { list },
                    },
                } = response;

                console.log("onUploadBannerUrl valid");
                alert("이미지 수정에 성공하였습니다.");
                Reload();
            }
        } catch (error) {
            alert("이미지 수정에 실패하였습니다.");
            console.log("onUploadBannerUrl invalid");
            console.log(error);
        } finally {
            // setUploading(false);
        }
    };

    const startModifyLink = (index) => {
        setBannerLinkIndex(index);
        setModifyMode(true);
    };

    const doneModifyLink = () => {
        setBannerLinkIndex(null);
        setModifyMode(false);
    };

    const onSaveLink = async (data) => {
        const { link } = getValues();

        try {
            const response = await axios.patch(SERVER + "/admin/banner/link", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
                id: bannerList[bannerLinkIndex].id,
                link,
            });

            const {
                data: { result, data },
            } = response;

            console.log(response);
            if (result === VALID) {
                Reload();
            } else {
                console.log("onSaveLink invalid");
                alert("수정 실패");
            }
        } catch (error) {
            console.log("onSaveLink error : ", error);
        } finally {
            setModifyMode(false);
            setBannerLinkIndex(null);
            setValue("link", "");
        }
    };

    return (
        <MainLayout path={location.pathname}>
            <PageTitle title="이미지 관리" />
            <MainContentLayout show={true}>
                <form>
                    <>
                        <Container>
                            {bannerList.map((banner, index) => (
                                <Wrapper key={index}>
                                    <Title>배너 {index + 1}</Title>
                                    <Banner>
                                        <img
                                            src={banner.imageUrl}
                                            style={{ width: "50vw" }}
                                        />
                                        <Buttons>
                                            <PointButton
                                                type="button"
                                                onClick={() =>
                                                    openBannerModal(index)
                                                }
                                            >
                                                수정하기
                                            </PointButton>
                                        </Buttons>
                                    </Banner>

                                    <Link>
                                        {modifyMode &&
                                        index === bannerLinkIndex ? (
                                            <>
                                                <div>
                                                    <input
                                                        placeholder="링크 입력"
                                                        style={{
                                                            width: "30vw",
                                                        }}
                                                        {...register("link")}
                                                    />
                                                </div>

                                                <Buttons>
                                                    <PointButton
                                                        type="button"
                                                        onClick={onSaveLink}
                                                    >
                                                        저장
                                                    </PointButton>
                                                    <Blank />
                                                    <DefaultButton
                                                        type="button"
                                                        onClick={() =>
                                                            doneModifyLink()
                                                        }
                                                    >
                                                        취소
                                                    </DefaultButton>
                                                </Buttons>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    현재 링크 :{" "}
                                                    <a
                                                        href={banner.link}
                                                        target="_new"
                                                        style={{
                                                            color: "blue",
                                                            cursor: "pointer",
                                                            textDecoration:
                                                                "underline",
                                                        }}
                                                    >
                                                        {banner.link}
                                                    </a>
                                                </div>

                                                <Buttons>
                                                    <DefaultButton
                                                        type="button"
                                                        onClick={() =>
                                                            startModifyLink(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        수정
                                                    </DefaultButton>
                                                </Buttons>
                                            </>
                                        )}
                                    </Link>
                                </Wrapper>
                            ))}
                        </Container>
                        {showBannerModal ? <BannerModal /> : null}
                    </>
                </form>
            </MainContentLayout>
        </MainLayout>
    );
}

export default ManageBanner;
