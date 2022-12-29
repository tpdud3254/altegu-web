import styled from "styled-components";

export const HorizontalTable = styled.table`
    width: 100%;
    margin-top: 5px;
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
    }

    td {
        padding: 5px 50px 5px 5px;
        text-align: left;
    }
    th {
        padding: 0 20px 0 20px;
        font-weight: 600;
        background-color: lightgrey;
        text-align: center;
    }
`;
