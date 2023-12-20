import styled from "styled-components";
import PropTypes from "prop-types";
import { useState } from "react";
import Modal from "../../components/Modal";
import { HorizontalTable } from "../../components/Table/HorizontalTable";

function ManageUser() {
    const [showModal, setShowModal] = useState(false);

    const openModal = () => {
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
    };

    const SampleModal = () => (
        <Modal open={showModal} close={closeModal} header="상세정보">
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
    );

    return (
        <div>
            <button onClick={openModal}>open</button>
            {showModal ? <SampleModal /> : null}
        </div>
    );
}

export default ManageUser;
