import {DataGrid} from '@material-ui/data-grid';
import React from 'react';
import Status from "../Status";
// @ts-ignore
import stylesheet from '../KanbanBoard/styles.scss';

// @ts-ignore
const ListView = ({cards, messagesClickHandler, onNotesClick}) => {
    const columns = [
        { field: 'name', headerName: 'Full Name', flex: 1, sortable: true, filterable: true, headerClassName: 'job-column job-table-heading', headerAlign: 'center', align: 'left',
            renderCell: (params) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={params.row.profileImg} alt="img" width={30} height={30} style={{ borderRadius: '100%' }} />
                    <span style={{ padding: '4%', fontSize: '12px' }}>{params.row.name}</span>
                </div>
            )
        },
        { field: 'designation', headerName: 'Position', flex: 1, sortable: true, filterable: true, headerClassName: 'job-column job-table-heading', headerAlign: 'center', align: 'left' },
        { field: 'companyName', headerName: 'Company Name', flex: 1, sortable: true, filterable: true, headerClassName: 'job-column job-table-heading', headerAlign: 'center', align: 'left' },
        { field: 'status', headerName: 'Status', flex: 1, sortable: true, filterable: false, headerClassName: 'job-column job-table-heading th-status', headerAlign: 'center', align: 'left',
            renderCell: (params) => (
                <Status card={params.row}/>
            )
        },
        {
            field: 'action', headerName: 'Action', flex: 2, sortable: false, filterable: false, headerClassName: 'job-column job-table-heading th-action', headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <>
                    <button className="btn action-btn-color" onClick={(event)=>messagesClickHandler(event,params.row.conversationUrn)}>
                        <svg className="icon-color" width="16" height="17" viewBox="0 0 16 17" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.3332 8H5.6665C5.39317 8 5.1665 7.77333 5.1665 7.5C5.1665 7.22667 5.39317 7 5.6665 7H10.3332C10.6065 7 10.8332 7.22667 10.8332 7.5C10.8332 7.77333 10.6065 8 10.3332 8Z" fill="#585858"/>
                            <path d="M10.6668 15.3799C10.4402 15.3799 10.2135 15.3133 10.0202 15.1866L7.18016 13.2933H4.66683C2.3735 13.2933 0.833496 11.7533 0.833496 9.45992V5.45992C0.833496 3.16659 2.3735 1.62659 4.66683 1.62659H11.3335C13.6268 1.62659 15.1668 3.16659 15.1668 5.45992V9.45992C15.1668 11.5799 13.8468 13.0599 11.8335 13.2666V14.2133C11.8335 14.6466 11.6002 15.0399 11.2202 15.2399C11.0468 15.3332 10.8535 15.3799 10.6668 15.3799ZM4.66683 2.61991C2.94683 2.61991 1.8335 3.73325 1.8335 5.45325V9.45325C1.8335 11.1732 2.94683 12.2866 4.66683 12.2866H7.3335C7.4335 12.2866 7.52684 12.3132 7.61351 12.3733L10.5802 14.3466C10.6535 14.3933 10.7202 14.3733 10.7535 14.3533C10.7868 14.3333 10.8402 14.2932 10.8402 14.2066V12.7866C10.8402 12.5132 11.0668 12.2866 11.3402 12.2866C13.0602 12.2866 14.1735 11.1732 14.1735 9.45325V5.45325C14.1735 3.73325 13.0602 2.61991 11.3402 2.61991H4.66683Z" fill="#585858"/>
                        </svg>
                        <span style={{paddingLeft: "3px"}}>Message</span>
                    </button>
                    <button className="btn action-btn-color" onClick={()=>onNotesClick(params.row.userId, params.row.profileId)}>
                        <svg className="icon-color" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.6665 15.1667H5.33317C3.31984 15.1667 2.1665 14.0134 2.1665 12V5.50004C2.1665 3.40004 3.23317 2.33337 5.33317 2.33337C5.6065 2.33337 5.83317 2.56004 5.83317 2.83337C5.83317 3.10004 5.93984 3.35337 6.12651 3.54004C6.31317 3.72671 6.5665 3.83337 6.83317 3.83337H9.1665C9.71984 3.83337 10.1665 3.38671 10.1665 2.83337C10.1665 2.56004 10.3932 2.33337 10.6665 2.33337C12.7665 2.33337 13.8332 3.40004 13.8332 5.50004V12C13.8332 14.0134 12.6798 15.1667 10.6665 15.1667ZM4.89982 3.34671C3.84649 3.43338 3.1665 3.90671 3.1665 5.50004V12C3.1665 13.48 3.85317 14.1667 5.33317 14.1667H10.6665C12.1465 14.1667 12.8332 13.48 12.8332 12V5.50004C12.8332 3.90671 12.1532 3.44004 11.0999 3.34671C10.8732 4.20004 10.0932 4.83337 9.1665 4.83337H6.83317C6.29984 4.83337 5.79984 4.6267 5.41984 4.2467C5.16651 3.99337 4.99315 3.68671 4.89982 3.34671Z" fill="#585858"/>
                            <path d="M9.16683 4.83337H6.8335C6.30016 4.83337 5.80017 4.6267 5.42017 4.2467C5.04017 3.8667 4.8335 3.36671 4.8335 2.83337C4.8335 1.73337 5.7335 0.833374 6.8335 0.833374H9.16683C9.70016 0.833374 10.2002 1.04004 10.5802 1.42004C10.9602 1.80004 11.1668 2.30004 11.1668 2.83337C11.1668 3.93337 10.2668 4.83337 9.16683 4.83337ZM6.8335 1.83337C6.28016 1.83337 5.8335 2.28004 5.8335 2.83337C5.8335 3.10004 5.94016 3.35337 6.12683 3.54004C6.3135 3.72671 6.56683 3.83337 6.8335 3.83337H9.16683C9.72016 3.83337 10.1668 3.38671 10.1668 2.83337C10.1668 2.56671 10.0602 2.31338 9.87349 2.12671C9.68683 1.94004 9.4335 1.83337 9.16683 1.83337H6.8335Z" fill="#585858"/>
                            <path d="M8.00016 9.16663H5.3335C5.06016 9.16663 4.8335 8.93996 4.8335 8.66663C4.8335 8.39329 5.06016 8.16663 5.3335 8.16663H8.00016C8.2735 8.16663 8.50016 8.39329 8.50016 8.66663C8.50016 8.93996 8.2735 9.16663 8.00016 9.16663Z" fill="#585858"/>
                            <path d="M10.6668 11.8334H5.3335C5.06016 11.8334 4.8335 11.6067 4.8335 11.3334C4.8335 11.06 5.06016 10.8334 5.3335 10.8334H10.6668C10.9402 10.8334 11.1668 11.06 11.1668 11.3334C11.1668 11.6067 10.9402 11.8334 10.6668 11.8334Z" fill="#585858"/>
                        </svg>
                        <span style={{paddingLeft: "3px"}}>Notes</span>
                    </button>
                </>
            )
        }
    ];

    // @ts-ignore
    const getRowClassName = (params) => {
        return params.index % 2 === 0 ? 'stripe-row' : '';
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="table rounded table-striped list-table table-custom" style={{ height: '100%', width: '100%' }}>
                <DataGrid
                    columns={columns}
                    rows={cards}
                    autoHeight
                    rowHeight={90}
                    checkboxSelection
                    disableSelectionOnClick={false}
                    getRowClassName={getRowClassName}
                />
            </div>
        </>
    );
};

export default ListView;