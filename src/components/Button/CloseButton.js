import styled from "styled-components";

const Button = styled.div`
    z-index: 10;
    position: absolute;
`;

function CloseButton({ onClick }) {
    return <Button>X</Button>;
}

export default CloseButton;
