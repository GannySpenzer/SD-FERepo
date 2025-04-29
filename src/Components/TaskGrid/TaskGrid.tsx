import React, { useState, useEffect, useRef } from 'react';
import { getTaskGridData, createMigrationTask } from '../../Service/TaskService';
import { Pagination } from '@mui/material';
import { imageLinks, arrow, noRecordsImage } from '../../Common/Constant';
import { TaskItem, LocalFilter, PayloadData } from '../../Common/Interface';
import { useNavigate } from 'react-router-dom';
import Loader from '../PopUps/Loader';
import Header from '../Header/Header';
import { convertLength } from '@mui/material/styles/cssUtils';

const TaskGridComponent: React.FC = () => {
  const [gridItems, setGridItems] = useState<TaskItem[]>([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [pageNumber, setPageNumber] = useState(1);
  const [taskId, setTaskId] = useState(null); // State to hold task_id
  const [totalCount, setTotalCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageLoading, setPageLoading] = useState<boolean>(true)
  const [modalState, setModalState] = useState('')
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [payloadData, setPayloadData] = useState<PayloadData>({
    searchTitle: '',
    sortColumn: 'created_date',
    sortOrder: 'desc',
    pagination: 0,
    filter: {
      inventoryDateFrom: '',
      inventoryDateTo: '',
      migrationStartDateFrom: '',
      migrationStartDateTo: '',
      status: [], // This will hold numbers corresponding to the statuses
    },
  });

  // Local state to manage filter inputs before applying
  const [localFilter, setLocalFilter] = useState<LocalFilter>({
    inventoryDateFrom: '',
    inventoryDateTo: '',
    migrationStartDateFrom: '',
    migrationStartDateTo: '',
    status: [],
  });

  // Mapping of status names to their corresponding numbers
  const statusMap: any = {
    'In Progress': 2,
    'Completed': 3,
    'Failed': 5,
    'Draft': 7,
    'Cancelled': 8,
  };

  const statusClassMap: any = {
    'In Progress': 'inprogress-status',
    'Completed': 'completed-status',
    'Failed': 'failed-status',
    'Draft': 'draft-status',
    'Cancelled': 'cancelled-status',
    'Warning': 'warning-status',
    'Yet to Start': 'yet-status'
  };
  const [popup, setPopup] = useState(false);
  const [sortState, setSortState] = useState(false)
  const [sortColumnState, setSortColumnState] = useState({ column: 'created_date', direction: 'desc' });
  const [newMigrationName, setNewMigrationName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('cid_t')
    if (!token) {
      navigate('/')
    }
    getInitialData(payloadData)
  }, [payloadData]);

  const getInitialData = async (payload: PayloadData) => {
    try {
      sessionStorage.removeItem('taskId');
      setIsLoading(true);
      const response = await getTaskGridData(payload);
      setIsLoading(false);
      setGridItems(response.task_details ?? []);
      if (response.total_count > 0) {
        setTotalCount(response.total_count); // Assuming total_count is the same for all tasks
      } else {
        setTotalCount(0); // Reset total count if no tasks are found
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false); // Set loading state to false after data is fetched
    }
  };
  const itemsPerPage = 10;
  const startItemIndex = (pageNumber - 1) * itemsPerPage + 1; // Start index is inclusive
  const endItemIndex = Math.min(pageNumber * itemsPerPage, totalCount);
  const specialCharRegex = /[^a-zA-Z0-9 ]/;

  const formatDate = (dateString: string): string => {
    if (!dateString) {
      return '--';  // Return an empty string if no date is provided
    }
    const date = new Date(dateString);

    if (isNaN(date.getTime()) || dateString === "0001-01-01T00:00:00Z" || dateString === "1900-01-01T00:00:00Z") {
      return '--'; // Return "--" if the date is invalid or is the "zero" date
    }
    const month = date.getMonth() + 1; // Months are zero-based, so add 1
    const day = date.getDate();
    const year = date.getFullYear();

    // Format the date as MM-DD-YYYY
    const formattedDate = `${month.toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}-${year}`;
    return formattedDate;
  };
  const handleTitleClick = (item: TaskItem) => {
    let taskID = String(item.task_id);
    sessionStorage.setItem('taskId', taskID);
    navigate(`/${item.last_activity}`);
  };
  const bindTaskGrid = () => {
    if (gridItems.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-center p-4">
            <div className="col-md-12 d-flex justify-content-center align-items-center h-100">
              <div className="text-center p-5">
                <img src={noRecordsImage} className="no-record-icon mb-4" style={{ width: '270px' }} alt="No Records Found" />
                <p className='no-record-font'>No Records Found</p>
              </div>
            </div>
          </td>
        </tr>
      );
    }
    return (
      <>
        {gridItems.map((item: TaskItem) => (
          <tr key={item.task_id}>
            <td>
              <a href="" onClick={() => handleTitleClick(item)}>
                {item.title}
              </a>
            </td>
            <td>
              {/* Display image for source */}
              {item.source && (
                <>
                  <img
                    src={imageLinks[item.source] || 'path/to/default-image.png'} // Default image if not found
                    alt={item.source}
                    style={{ width: '30px', height: '30px', marginRight: '5px' }} // Adjust size as needed
                  />
                </>
              )}
              {/* Display image for target */} <img src={arrow} className='m-3' />
              {item.target && (
                <>
                  <img
                    src={imageLinks[item.target] || 'path/to/default-image.png'} // Default image if not found
                    alt={item.target}
                    style={{ width: '30px', height: '30px', marginRight: '15px' }} // Adjust size as needed
                  />
                </>
              )}
            </td>
            <td>{formatDate(item.inventory_date)}</td> {/* Display inventory date */}
            <td>{formatDate(item.migration_start_date)}</td> {/* Display migration start date */}
            <td>
              <div className='status-container'>

                <span className={`dot ${statusClassMap[item.status]} me-2`}></span>
                {item.status}
              </div>
            </td>                    {/* Source and Target Column */}
            <td>{item.activity}</td> {/* Display last activity */}
          </tr>
        ))}
      </>
    );
  };
  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const inputValue = (event.target as HTMLInputElement).value;
    if (event.key === 'Enter') {
      const isValidInput = /^[a-zA-Z0-9\s]*$/.test(inputValue);
      if (isValidInput) {
        setPayloadData(prev => ({ ...prev, searchTitle: inputValue }));
      } else {
        console.error('Invalid input');
      }
    }
  };
  const handleSearchIcon = () => {
    const inputValue = searchInputRef.current?.value || '';
    const isValidInput = /^[a-zA-Z0-9\s]*$/.test(inputValue);
    if (isValidInput) {
      setPayloadData(prev => ({ ...prev, searchTitle: inputValue }));
    } else {
      console.error('Invalid input');
    }
  };
  const handleSort = (column: string) => {
    // initially false and updated to true
    setSortState(!sortState)
    const newDirection = sortColumnState.direction === 'asc' ? 'desc' : 'asc';

    setSortColumnState({ column, direction: newDirection });
    setPayloadData(prev => ({
      ...prev,
      sortColumn: column,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc"
    }));
  };


  const openFilterPopup = () => {
    setPopup(false);
  };

  // Function to handle checkbox changes
  const handleStatusChange = (event: any) => {
    const { id, checked } = event.target;
    const statusNumber = statusMap[id]; // Get the corresponding number for the status

    setLocalFilter((prev: any) => {
      const newStatusArray = checked
        ? [...prev.status, statusNumber] // Add number if checked
        : prev.status.filter((status: any) => status !== statusNumber); // Remove number if unchecked

      return {
        ...prev,
        status: newStatusArray, // Update the local status array
      };
    });
  };

  // Function to handle date changes for Inventory From Date
  const handleInventoryFromDateChange = (event: any) => {
    setLocalFilter((prev) => ({
      ...prev,
      inventoryDateFrom: event.target.value, // Update the From Date
    }));
  };

  // Function to handle date changes for Inventory To Date
  const handleInventoryToDateChange = (event: any) => {
    setLocalFilter((prev) => ({
      ...prev,
      inventoryDateTo: event.target.value, // Update the To Date
    }));
  };

  // Function to handle date changes for Migration Start Date From
  const handleMigrationStartFromDateChange = (event: any) => {
    setLocalFilter((prev) => ({
      ...prev,
      migrationStartDateFrom: event.target.value, // Update the From Date
    }));
  };

  // Function to handle date changes for Migration Start Date To
  const handleMigrationStartToDateChange = (event: any) => {
    setLocalFilter((prev) => ({
      ...prev,
      migrationStartDateTo: event.target.value, // Update the To Date
    }));
  };

  // Function to apply filters and update payloadData
  const applyFilters = () => {
    setPayloadData((prev: any) => ({
      ...prev,
      filter: localFilter, // Update payload with local filter values
    }));

    setPopup(true)

  };


  const handlePageChange = (event: any, newPage: any) => {
    setPageNumber(newPage);
    setPayloadData(prev => ({ ...prev, pagination: (newPage - 1) * 10 }));
  };

  const handleNewMigrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setNewMigrationName(value);

    if (!value) {
      setErrorMessage('Title Cannot be empty');
      setIsSaveDisabled(true)
    } else if (value.length > 50) {
      setErrorMessage('Character count exceeded');
      setIsSaveDisabled(true)
    } else if (value.length < 5 || specialCharRegex.test(value)) {
      setErrorMessage('Please Enter a valid title Name');
      setIsSaveDisabled(true)
    } else {
      setErrorMessage('');
      setIsSaveDisabled(false)
    }
  };

  const handleSaveMigration = async () => {
    setIsLoading(true);
    if (!newMigrationName) {
      setErrorMessage('Title Cannot be empty');
      return;
    }
    if (newMigrationName.length > 50) {
      setErrorMessage('Character count exceeded');
      return;
    }
    if (newMigrationName.length < 5 || specialCharRegex.test(newMigrationName)) {
      setErrorMessage('Please Enter a valid title Name');
      return;
    }
    setIsLoading(true);
    setIsDisabled(true);
    try {
      const response = await createMigrationTask(newMigrationName);
      setIsLoading(false);
      var taskId = response.task_id
      const modalElement = document.getElementById('confirmation');
      if (modalElement) {
        modalElement.style.display = 'none'; // Hide the modal
        document.body.style.overflow = "auto";
        // Optionally remove 'show' class if present
        modalElement.classList.remove('show');
        // Optionally remove backdrop if needed
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
      }
      navigate('/source'); // Passing
      sessionStorage.setItem('taskId', response.task_id);

    } catch (error: any) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.error);
      } else if (error.message && error.message.includes("task name already exists")) {
        setErrorMessage('Task name already exists');
      } else {
        console.error(error);
        setErrorMessage('Task name already exists');
      }
      setIsDisabled(false);

    } finally {
      setIsLoading(false)
    }
  };

  const handleModalClose = () => {
    setNewMigrationName('');
    setErrorMessage('');
    setIsSaveDisabled(true);
    setIsDisabled(false);
  };

  return (
    <>

      <div className="container-fluid migrate-bg">
        <div className="row justify-content-center">
          <Header />
          <div className="col-md-11 mt-3">
            <div className="d-flex justify-content-between mb-4 align-items-center">
              <div>
                <p className="font-20 font-semibold mb-0">Migration<span className="ms-1">{"(" + totalCount + ")"}</span></p>
              </div>
              <div className="d-flex">
                <div className="input-group">
                  <input type="text" className="form-control border-end-0 migrate-form-ui" onKeyPress={handleSearch} ref={searchInputRef}
                    placeholder="Search" />
                  <button className="input-group-text input-field bg-white migrate-form-ui" onClick={handleSearchIcon}><img src="images/search-icon.svg" alt="search-icon" /></button>
                </div>

                {/* filters */}
                <button type="button"
                  className="migrate-form-ui bg-white ms-3 me-3"
                  data-bs-toggle="dropdown"
                  id="dropdownMenuLink"
                  data-bs-auto-close="outside" onClick={openFilterPopup}>
                  <img src="images/filter-icon.svg" alt="filter-icon" />
                </button>
                <div hidden={popup} className="dropdown-menu dropdown-menu-end border-0 px-4 py-3 migrate-container custom-filter-width" aria-labelledby="dropdownMenuLink">
                  <h5 className="font-semibold font-16 mb-0 color-black mb-4">Filter</h5>

                  {/* Status Filter */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label font-14 font-medium" htmlFor="Status">Status</label>
                    <div className="dropdown active-check">
                      <button type="button" className="btn form-select migrate-form-ui" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        <span className="d-flex font-14 font-regular black-v2">Select Status</span>
                      </button>
                      <ul className="dropdown-menu w-100" aria-labelledby="dropdownMenuButton1">
                        {Object.keys(statusMap).map((status: any) => (
                          <li key={status} className="font-regular color-black font-14 p-2 custom-list">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input custom-checkbox me-2"
                                id={status}
                                onChange={handleStatusChange}
                                checked={localFilter.status.includes(statusMap[status])}
                              />
                              <label className="form-check-label font-14 font-regular cursor-pointer" htmlFor={status}>
                                {status}
                              </label>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Migration Date Range */}
                  <p className="mb-2 font-15 font-semibold">Migration Date Range</p>
                  <div className='row'>
                    <div className="col-md-6 mb-3">
                      <label className="form-label font-14 font-medium" htmlFor="Migration-fdate">From Date</label>
                      <input
                        type="date"
                        className="w-100 form-control migrate-form-ui"
                        id="migration-fdate"
                        value={localFilter.migrationStartDateFrom}
                        onChange={handleMigrationStartFromDateChange}
                        max={localFilter.migrationStartDateTo}

                      />
                    </div>

                    <div className="col-md-6 mb-4">
                      <label className="form-label font-14 font-medium" htmlFor="Migration-tdate">To Date</label>
                      <input
                        type="date"
                        className="w-100 form-control migrate-form-ui"
                        id="migration-tdate"
                        value={localFilter.migrationStartDateTo}
                        onChange={handleMigrationStartToDateChange}
                        min={localFilter.migrationStartDateFrom}


                      />
                    </div>
                  </div>

                  {/* Inventory Date Range */}
                  <p className="mb-2 font-15 font-semibold">Inventory Date Range</p>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label className="form-label font-14 font-medium" htmlFor="Inventory-fdate">From Date</label>
                      <input
                        type="date"
                        className="w-100 form-control migrate-form-ui"
                        id="Inventory-fdate"
                        value={localFilter.inventoryDateFrom}
                        onChange={handleInventoryFromDateChange}
                        max={localFilter.inventoryDateTo}
                      />
                    </div>

                    <div className="col-md-6 mb-4">
                      <label className="form-label font-14 font-medium" htmlFor="Inventory-tdate">To Date</label>
                      <input
                        type="date"
                        className="w-100 form-control migrate-form-ui"
                        id="Inventory-tdate"
                        value={localFilter.inventoryDateTo}
                        onChange={handleInventoryToDateChange}
                        min={localFilter.inventoryDateFrom}

                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="col-md-12">
                    <div className="d-flex justify-content-end align-items-center pt-3 pb-2 gap-3">
                      <button
                        type='button'
                        onClick={() => setLocalFilter({
                          inventoryDateFrom: '',
                          inventoryDateTo: '',
                          migrationStartDateFrom: '',
                          migrationStartDateTo: '',
                          status: [] // Clear all statuses in local state
                        })

                        }
                        className='outline-button'
                        data-bs-auto-close="outside"
                      >
                        Clear All
                      </button>
                      <button
                        type='button'
                        onClick={applyFilters}
                        className='primary-btn white-color'
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
                {/* start migration */}
                <button className="btn primary-btn font-semibold font-14" type="button" data-bs-toggle="modal" data-bs-target="#confirmation">Start New Migration</button>
              </div>
            </div>
            <div className="table-responsive">
              {isLoading ? <Loader /> :
                <table className="table migration-table">
                  <thead>
                    <tr>
                      <th>Title
                        {sortColumnState.column === 'title' ? (
                          sortColumnState.direction === 'asc' ? (
                            <img key="title-asc" className="cursor-pointer ms-1 mb-1" src="images/sort-up.svg" alt="sort" onClick={() => handleSort('title')} />
                          ) : (
                            <img key="title-desc" className="cursor-pointer ms-1 mb-1" src="images/sort-down.svg" alt="sort" onClick={() => handleSort('title')} />
                          )
                        ) : (
                          <img className="cursor-pointer ms-1 mb-1" src="images/sort-down.svg" alt="sort" onClick={() => handleSort('title')} />
                        )}
                      </th>
                      <th>Source and Target</th>
                      <th>Inventory Date
                        {sortColumnState.column === 'inventory_date' ? (
                          sortColumnState.direction === 'asc' ? (
                            <img key="inventory_date-asc" className="cursor-pointer ms-1 mb-1" src="images/sort-up.svg" alt="sort" onClick={() => handleSort('inventory_date')} />
                          ) : (
                            <img key="inventory_date-desc" className="cursor-pointer ms-1 mb-1" src="images/sort-down.svg" alt="sort" onClick={() => handleSort('inventory_date')} />
                          )
                        ) : (
                          <img className="cursor-pointer ms-1 mb-1" src="images/sort-down.svg" alt="sort" onClick={() => handleSort('inventory_date')} />
                        )}
                      </th>
                      <th>Migration Started Date
                        {sortColumnState.column === 'migration_start_date' ? (
                          sortColumnState.direction === 'asc' ? (
                            <img key="migration_start_date-asc" className="cursor-pointer ms-1 mb-1" src="images/sort-up.svg" alt="sort" onClick={() => handleSort('migration_start_date')} />
                          ) : (
                            <img key="migration_start_date-desc" className="cursor-pointer ms-1 mb-1" src="images/sort-down.svg" alt="sort" onClick={() => handleSort('migration_start_date')} />
                          )
                        ) : (
                          <img className="cursor-pointer ms-1 mb-1" src="images/sort-down.svg" alt="sort" onClick={() => handleSort('migration_start_date')} />
                        )}
                      </th>
                      <th>Status
                        {sortColumnState.column === 'status' ? (
                          sortColumnState.direction === 'asc' ? (
                            <img key="status-asc" className="cursor-pointer ms-1 mb-1" src="images/sort-up.svg" alt="sort" onClick={() => handleSort('status')} />
                          ) : (
                            <img key="status-desc" className="cursor-pointer ms-1 mb-1" src="images/sort-down.svg" alt="sort" onClick={() => handleSort('status')} />
                          )
                        ) : (
                          <img className="cursor-pointer ms-1 mb-1" src="images/sort-down.svg" alt="sort" onClick={() => handleSort('status')} />
                        )}
                      </th>
                      <th>Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bindTaskGrid()}
                  </tbody>
                </table>
              }
            </div>
            <div className="modal fade" id="confirmation" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header custom-modal-header">
                    <h1 className="modal-title font-16 font-semibold" id="exampleModalLabel">New Migration</h1>
                    <button type="button" className="btn-close close-btn-custom" data-bs-dismiss="modal" disabled={isDisabled} onClick={handleModalClose} aria-label="Close"></button>
                  </div>
                  <div className="modal-body font-14 font-grey">
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label className="form-label font-14 font-medium" htmlFor="migrationName">Migration Name</label>
                        <input type="text" className="form-control migrate-form-ui" placeholder="Enter Migration Name" id="migrationName" value={newMigrationName} disabled={isDisabled} onChange={handleNewMigrationChange} />
                        {errorMessage && <div className="error-message text-danger">{errorMessage}</div>}
                      </div>
                      {/* <div className="col-md-12 mb-3">
                  <label className="form-label font-14 font-medium" htmlFor="organizationName">Organization Name</label>
                  <select className="form-select migrate-form-ui" id="organizationName" value={newMigrationData.organizationName} onChange={handleNewMigrationChange}>
                    <option selected>Select</option>
                    <option value="Mode">Mode</option>
                    <option value="RAC">RAC</option>
                    <option value="Danella">Danella</option>
                  </select>
                </div> */}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn outline-button" data-bs-dismiss="modal" disabled={isDisabled} onClick={handleModalClose}>Cancel</button>
                    <button type="button" className="btn primary-btn" disabled={isDisabled || isSaveDisabled} onClick={handleSaveMigration}>Save</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {totalCount > 10 && (
            <div className="col-md-11 d-flex justify-content-between align-items-center">
              <p className="font-regular font-14 font-grey mb-0">Showing <span className="me-1">{startItemIndex}-{endItemIndex}</span> of <span className="ms-1">{totalCount}</span></p>
              {/* <nav aria-label="Page navigation example">
            <ul className="pagination mb-0">
              <li className="page-item"><a className="pagination-button" href="#"><img className="mb-1" src="images/pagination-arrow.svg" alt="pagination" /></a></li>
              <li className="page-item"><a className="pagination-button pagination-button-active" href="#">1</a></li>
              <li className="page-item"><a className="pagination-button" href="#">2</a></li>
              <li className="page-item"><a className="pagination-button" href="#">3</a></li>
              <li className="page-item"><a className="pagination-button" href="#">3</a></li>
              <li className="page-item"><a className="pagination-button pagintion-arrow-right" href="#"><img className="mb-1" src="images/pagination-arrow.svg" alt="pagination" /></a></li>
            </ul>
          </nav> */}

              <Pagination
                count={Math.ceil(totalCount / 10)} // Total number of pages
                page={pageNumber}
                onChange={handlePageChange}
                variant="outlined"
                color="primary"
                defaultPage={1}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '10px', // Make buttons square
                    border: '1px solid black', // Square outline
                    color: 'black', // Default text color
                  },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    backgroundColor: 'black', // Active background color
                    color: 'white', // Active text color
                  },
                }}
              />
            </div>)}
        </div>
      </div >
    </>
  );
};

export default TaskGridComponent;