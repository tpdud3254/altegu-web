import styled from "styled-components";

const Layout = styled.div`
    width: 100%;
`;

function DetailContentLayout({ children }) {
    return <Layout>{children}</Layout>;
}

export default DetailContentLayout;
