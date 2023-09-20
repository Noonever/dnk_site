import { Component } from 'react';
import type { MultiFormConfig } from "~/components/MultiForm";
import MultiForm from "~/components/MultiForm";

type tableData = { [key: string]: any }[]

interface Sorting {
    column: string;
    reverse: boolean;
}

interface ColumnConfig {
    name: string;
    alias: string;
    filterable: boolean;
    visible?: boolean;
    type?: 'string' | 'number' | 'date' | 'list';
}

interface TableProps {
    data: tableData;
    columns: ColumnConfig[];
    pageSize: number;
    multiFormConfig: MultiFormConfig;
}

interface TableState {
    currentPage: number;
    sorting: Sorting;
    filters: { [key: string]: string };
    selectedIndices: number[];
    modalIndex: number | null;
}

class Table extends Component<TableProps, TableState> {

    constructor(props: TableProps) {
        super(props);
        this.state = {
            currentPage: 1,
            filters: {},
            selectedIndices: [],
            modalIndex: null,
            sorting: {
                column: '',
                reverse: false,
            }
        };
    }

    handlePageChange = (page: number) => {
        this.setState({ currentPage: page });
    }

    handleSortingChange = (column: string) => {
        const sorting = this.state.sorting;

        if (column === sorting.column) {
            sorting.reverse = !sorting.reverse;
        } else {
            sorting.column = column;
            sorting.reverse = false;
        }

        this.setState({ sorting })
    }

    handleFilterChange = (column: string, value: string) => {
        const filters = this.state.filters;
        filters[column] = value;
        console.log('filters', filters)
        this.setState({ filters });
    }

    handleRowSelection = (index: number) => {
        const { selectedIndices } = this.state;

        const selectedIndex = selectedIndices.indexOf(index);

        if (selectedIndex === -1) {
            // If not already selected, add it to the selectedIndices
            selectedIndices.push(index);
        } else {
            // If already selected, remove it from selectedIndices
            selectedIndices.splice(selectedIndex, 1);
        }
        this.setState({ selectedIndices });
    }

    handleAllSelection = () => {
        const { selectedIndices } = this.state;

        const filteredIndices = this.getFilteredIndices();

        if (selectedIndices.length === 0) {
            this.setState({ selectedIndices: filteredIndices });
        } else {
            this.setState({ selectedIndices: [] });
        }
    }

    handleOpenModal = (index: number) => {
        this.setState({ modalIndex: index });
    }

    handleCloseModal = () => {
        this.setState({ modalIndex: null });
    }

    getIndexedData = (): { index: number, value: { [key: string]: any } }[] => {
        const { data } = this.props;
        const indexedData = data.map((entry, index) => ({ index, value: entry }));
        // console.log('indexedData', indexedData)
        return indexedData
    }

    getSortedIndices = (): number[] => {
        const { sorting } = this.state;
        const indexedData = this.getIndexedData();
        console.log('indexedData', indexedData)
        const sortedData = indexedData.sort((a, b) => {
            const aVal = a.value[sorting.column];
            const bVal = b.value[sorting.column];

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sorting.reverse ? bVal - aVal : aVal - bVal;
            } else if (sorting.column === 'date') {
                const dateA = new Date(aVal);
                const dateB = new Date(bVal);

                if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) {
                    return 0; // Both values are not valid dates, treat as equal
                } else if (isNaN(dateA.getTime())) {
                    return sorting.reverse ? 1 : -1; // Invalid date should come last
                } else if (isNaN(dateB.getTime())) {
                    return sorting.reverse ? -1 : 1; // Invalid date should come last
                } else {
                    return sorting.reverse ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
                }
            } else {
                const aStr = aVal?.toString().toLowerCase();
                const bStr = bVal?.toString().toLowerCase();

                if (aStr < bStr) {
                    return sorting.reverse ? 1 : -1;
                } else if (aStr > bStr) {
                    return sorting.reverse ? -1 : 1;
                } else {
                    return 0;
                }
            }
        });

        const sortedIndices = sortedData.map((item) => item.index);
        return sortedIndices;
    };

    getFilteredIndices = (): number[] => {
        const { filters } = this.state;
        const indexedData = this.getIndexedData();

        const filteredData = indexedData.filter((entry) => {
            for (const column in filters) {
                const filter = filters[column];
                if (!entry.value[column].toString().toLowerCase().includes(filter.toString().toLowerCase())) {
                    return false;
                }
            }
            return true;
        })

        const filteredIndices = filteredData.map((item) => item.index);
        // console.log('filteredData', filteredData)
        // console.log('filteredIndices', filteredIndices)
        return filteredIndices
    }

    getDisplayedIndices = (): number[] => {
        const { currentPage } = this.state;
        const { pageSize } = this.props;

        const filteredIndices = this.getFilteredIndices();
        const sortedIndices = this.getSortedIndices();

        let displayedIndices = sortedIndices.filter((index) => {
            return filteredIndices.includes(index);
        })

        displayedIndices = displayedIndices.slice((currentPage - 1) * pageSize, currentPage * pageSize);
        console.log('displayedIndices', displayedIndices)

        return displayedIndices
    };

    renderHeader() {
        const { sorting, selectedIndices } = this.state;
        const { columns } = this.props;

        return (
            <thead>
                <tr className="header-row">
                    {columns.map((col) => {
                        if (col.visible === false) {
                            return <></>
                        }  
                        return <th key={col.name}>
                            {col.alias}
                            {col.filterable ? (
                                <div className='column-controls'>
                                    <input className='filter-input' type="text" onChange={(e) => this.handleFilterChange(col.name, e.target.value)} placeholder='🔍' />
                                    <div className='sorting-controls' onClick={() => this.handleSortingChange(col.name)}>
                                        {sorting.column === col.name ? (
                                            <span>{sorting.reverse ? "▼" : "▲"}</span>
                                        ) : <span>*</span>}
                                    </div>
                                </div>
                            ) : <div></div>}
                        </th>
                    })}
                    <th onClick={() => this.handleAllSelection()}>
                        <input
                            className='select-input'
                            type="checkbox"
                            checked={selectedIndices.length === this.getFilteredIndices().length}
                            onChange={() => this.handleAllSelection()}
                        />
                    </th>
                </tr>
            </thead>
        );
    }

    renderDataCell = (index: number, col: ColumnConfig) => {
        if (col?.visible === false) return <></>

        const { data } = this.props;
        const onClick = () => {
            this.handleOpenModal(index);
        }
        const item = data[index];

        switch (col.type) {
            case 'number':
                return <td onClick={onClick} key={col.name}>{parseFloat(item[col.name]).toFixed(2)}</td>;
            case 'date':
                return <td onClick={onClick} key={col.name}>{new Date(item[col.name]).toLocaleDateString()}</td>;
            default:
                return <td onClick={onClick} key={col.name}>{item[col.name]?.toString()}</td>;
        }
    };

    renderBody() {
        const { selectedIndices } = this.state;
        const { columns } = this.props;
        const displayedIndices = this.getDisplayedIndices();

        return (
            <tbody>
                {displayedIndices.map((index) => (
                    <tr key={index} className={"data-row" + (selectedIndices.includes(index) ? " selected" : "")}>
                        {columns.map((col) => this.renderDataCell(index, col))}
                        <td onClick={() => this.handleRowSelection(index)}>
                            <input
                                className='select-input'
                                type="checkbox"
                                checked={selectedIndices.includes(index)}
                                onChange={() => this.handleRowSelection(index)}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        );
    }

    renderPagination() {
        const { currentPage } = this.state;
        const maxPages = Math.ceil(this.getFilteredIndices().length / this.props.pageSize);

        return (
            <div className="pagination">
                {currentPage > 1 && (
                    <button onClick={() => this.handlePageChange(currentPage - 1)}>Previous</button>
                )}
                <a>{currentPage} из {maxPages}</a>
                {currentPage < maxPages && (
                    <button onClick={() => this.handlePageChange(currentPage + 1)}>Next</button>
                )}
            </div>
        );
    }

    renderSelectedData() {
        const { selectedIndices } = this.state;
        const { data } = this.props;

        return (
            <div className="selected-data-container">
                <h2>Selected Data</h2>
                <ul>
                    {selectedIndices.map((index) => (
                        <li key={index}>{JSON.stringify(data[index])}</li>
                    ))}
                </ul>
            </div>
        );
    }

    renderModal() {
        const { modalIndex } = this.state;
        if (modalIndex !== null) {
            return (
                <div className="modalBackground">
                    <div className="modalContainer">
                        <div className="titleCloseBtn">
                            <button
                                onClick={() => {
                                    this.handleCloseModal();
                                }}
                            >
                                X
                            </button>
                        </div>
                        <div className="body">
                            {this.renderEntryUpdateForm(modalIndex)}
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    renderEntryUpdateForm(index: number) {
        const { data, multiFormConfig: formConfig } = this.props;
        const entry = data[index];
        const filledFormConfig = { ...formConfig };
        const fields = filledFormConfig.formConfigurations['main'].fields;
        for (const key in fields) {
            fields[key].defaultValue = entry[key];
        }

        return <MultiForm
            formConfigurations={filledFormConfig.formConfigurations}
            submitButtonText={formConfig.submitButtonText}
            addButtonText='Add'
            deleteButtonText='Delete'
            onSubmitCallback={formConfig.onSubmitCallback}
        />
    }

    render() {
        return (
            <>
                {this.renderModal()}
                <div className="component-container">
                    <div className="table-container">
                        <table className="table">
                            {this.renderHeader()}
                            {this.renderBody()}
                        </table>
                        {this.renderPagination()}
                    </div>
                    <div className='select-control-container'>
                        {this.renderSelectedData()} {/* Render the selected data div */}
                    </div>
                </div>
            </>
        );
    }
}

export default Table;
export type { TableProps, tableData };