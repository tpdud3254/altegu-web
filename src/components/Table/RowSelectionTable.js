import { forwardRef, useEffect, useRef } from "react";
import styled from "styled-components";
import { useTable, usePagination, useRowSelect } from "react-table";

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

const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef();
    const resolvedRef = ref || defaultRef;

    useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
        <>
            <input type="checkbox" ref={resolvedRef} {...rest} />
        </>
    );
});

function RowSelectionTable({ columns, data }) {
    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page, // Instead of using 'rows', we'll use page,
        // which has only the rows for the active page

        // The rest of these things are super handy, too ;)
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        selectedFlatRows,
        state: { pageIndex, pageSize, selectedRowIds },
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 5 },
        },
        usePagination,
        useRowSelect,
        (hooks) => {
            hooks.visibleColumns.push((columns) => [
                // Let's make a column for selection
                {
                    id: "selection",
                    // The header can use the table's getToggleAllRowsSelectedProps method
                    // to render a checkbox
                    Header: ({ getToggleAllPageRowsSelectedProps }) => (
                        <div>
                            <IndeterminateCheckbox
                                {...getToggleAllPageRowsSelectedProps()}
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

    // Render the UI for your table
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
            <div className="pagination">
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    {"<<"}
                </button>{" "}
                <button
                    onClick={() => previousPage()}
                    disabled={!canPreviousPage}
                >
                    {"<"}
                </button>{" "}
                {Array.from(Array(pageOptions.length), (x, index) => (
                    <span key={index}>
                        {" "}
                        <button
                            onClick={() => gotoPage(index)}
                            style={{
                                backgroundColor:
                                    pageIndex === index ? "grey" : "unset",
                                color: pageIndex === index ? "white" : "unset",
                            }}
                        >
                            {index + 1}
                        </button>{" "}
                    </span>
                ))}
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {">"}
                </button>{" "}
                <button
                    onClick={() => gotoPage(pageCount - 1)}
                    disabled={!canNextPage}
                >
                    {">>"}
                </button>{" "}
                {/* <span>
                    Page{" "}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
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
                <pre>
                    <code>
                        {JSON.stringify(
                            {
                                selectedRowIds: selectedRowIds,
                                "selectedFlatRows[].original":
                                    selectedFlatRows.map((d) => d.original),
                            },
                            null,
                            2
                        )}
                    </code>
                </pre>
            </div>
        </Styles>
    );
}

export default RowSelectionTable;
