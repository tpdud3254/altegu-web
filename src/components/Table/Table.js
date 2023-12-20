import styled from "styled-components";
import { useTable, usePagination, useRowSelect } from "react-table";
import React, { useEffect } from "react";

const Styles = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    table {
        width: 100%;
        margin-bottom: 15px;
        border-spacing: 0;
        border: 1px solid grey;

        tr {
            :last-child {
                td {
                    border-bottom: 0;
                }
            }
        }

        th,
        td {
            margin: 0;
            padding: 0.5rem;
            border-bottom: 1px solid grey;
            border-right: 1px solid grey;
            vertical-align: middle;
            text-align: center;
        }

        th {
            font-weight: 600;
            background-color: lightgrey;
        }
    }
`;

const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef();
        const resolvedRef = ref || defaultRef;

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate;
        }, [resolvedRef, indeterminate]);

        return (
            <>
                <input type="checkbox" ref={resolvedRef} {...rest} />
            </>
        );
    }
);

function Table({
    columns,
    data,
    selectMode = false,
    selectedArr,
    pagenationMode = true,
}) {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
        rows,
        selectedFlatRows,
        state: { selectedRowIds },
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 10 },
        },
        usePagination,
        useRowSelect,
        (hooks) => {
            if (!selectMode) return;
            hooks.columns.push((columns) => [
                // Let's make a column for selection
                {
                    id: "selection",
                    // The header can use the table's getToggleAllRowsSelectedProps method
                    // to render a checkbox
                    Header: ({ getToggleAllRowsSelectedProps }) => (
                        <div>
                            <IndeterminateCheckbox
                                {...getToggleAllRowsSelectedProps()}
                            />
                        </div>
                    ),
                    // The cell can use the individual row's getToggleRowSelectedProps method
                    // to the render a checkbox
                    Cell: ({ row }) => (
                        <div>
                            <IndeterminateCheckbox
                                {...row.getToggleRowSelectedProps()}
                            />
                        </div>
                    ),
                },
                ...columns,
            ]);
        }
    );

    useEffect(() => {
        if (!selectedArr) return;
        selectedArr(selectedFlatRows);
    }, [selectedFlatRows]);

    return (
        <Styles>
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th {...column.getHeaderProps()}>
                                    {column.render("Header")}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell) => {
                                    return (
                                        <td {...cell.getCellProps()}>
                                            {cell.render("Cell")}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
            {pagenationMode ? (
                <div
                    className="pagination"
                    style={{ width: "100%", textAlign: "center" }}
                >
                    <button
                        type="button"
                        onClick={() => gotoPage(0)}
                        disabled={!canPreviousPage}
                    >
                        {"<<"}
                    </button>{" "}
                    <button
                        type="button"
                        onClick={() => previousPage()}
                        disabled={!canPreviousPage}
                    >
                        {"<"}
                    </button>{" "}
                    {Array.from(Array(pageOptions.length), (x, index) => (
                        <span key={index}>
                            {" "}
                            <button
                                type="button"
                                onClick={() => gotoPage(index)}
                                style={{
                                    backgroundColor:
                                        pageIndex === index ? "grey" : "unset",
                                    color:
                                        pageIndex === index ? "white" : "unset",
                                }}
                            >
                                {index + 1}
                            </button>{" "}
                        </span>
                    ))}
                    <button
                        type="button"
                        onClick={() => nextPage()}
                        disabled={!canNextPage}
                    >
                        {">"}
                    </button>{" "}
                    <button
                        type="button"
                        onClick={() => gotoPage(pageCount - 1)}
                        disabled={!canNextPage}
                    >
                        {">>"}
                    </button>{" "}
                    {/*
                <span>
                    Page{" "}
                    <strong>
                        {pageIndex + 1} / {pageOptions.length}
                    </strong>{" "}
                </span>
                
                <span>
                    | Go to page:{" "}
                    <input
                        type="number"
                        defaultValue={pageIndex + 1}
                        onChange={(e) => {
                            const page = e.target.value
                                ? Number(e.target.value) - 1
                                : 0;
                            gotoPage(page);
                        }}
                        style={{ width: "100px" }}
                    />
                </span>{" "}
                
                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select> */}
                </div>
            ) : null}
        </Styles>
    );
}

export default Table;
