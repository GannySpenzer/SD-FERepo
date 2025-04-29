import React, { useEffect, useState } from 'react';
import { getInventory, getInventoryStatus, getFullInventoryDetails } from '../../Service/InventoryService';
import { statusMap } from '../../Common/Constant';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Header from '../Header/Header';
import StripLineConnection from '../WizardStatus/StipLineConnection';
import Loader from '../PopUps/Loader';
import {SummaryPayload} from '../../Common/Interface'

const InventoryScreen = () => {
  //PS_02 - Declaring the necessary state variables
  const navigate = useNavigate();
  const [summaryPayload, setSummaryPayload] = useState<SummaryPayload>({
    taskId: 0,
  });
  const [inventoryPayload, setInventoryPayload] = useState({
    taskId: 0,
    applicationId: 0,
    isCheckedUser: true,
    isCheckedTicket: false,
    isCheckedKb: false,
    isCheckedSolution: false,
    isCheckedProblem: false,
    isCheckedIncident: false,
    isCheckedChange: false,
    startDate: null,
    endDate: null,
  });
  const [inventoryCounts, setInventoryCounts] = useState({
    userCount: 0,
    ticketCount: 0,
    kbCount: 0,
    attachmentCount: 0,
    attachmentSize: 0,
    solutionCount: 0,
    problemCount: 0,
    incidentCount: 0,
    changeCount: 0,
    userPercentage: 0,
    ticketPercentage: 0,
    kbPercentage: 0,
    solutionPercentage: 0,
    problemPercentage: 0,
    incidentPercentage: 0,
    changePercentage: 0,
    inventoryStartDate: null,  // Add this line
    inventoryEndDate: null     // Add this line
  });
  const [isExactCount, setIsExactCount] = useState(false);
  const [dateRange, showDateRange] = useState(false);
  const [connectionState, setConnectionState] = useState("");
  const [isInventoryStarted, setIsInventoryStarted] = useState(false);
  const [isCardsVisible, setIsCardsVisible] = useState(false);
  const [isInventoryCompleted, setIsInventoryCompleted] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [showInventorySummary, setShowInventorySummary] = useState(false); // Add a new state variable
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [summaryData, setSummaryData] = useState({
    requestAttachmentCount: 0,
    requestInternalLinkCount: 0,
    requestTotalSize: 0,
    articleAttachmentCount: 0,
    articleInternalLinkCount: 0,
    articleTotalSize: 0,
    ticketAttachmentCount: 0,
    ticketInternalLinkCount: 0,
    ticketTotalSize: 0,
    problemAttachmentCount: 0,
    problemInternalLinkCount: 0,
    problemTotalSize: 0,
    solutionAttachmentCount: 0,
    solutionInternalLinkCount: 0,
    solutionTotalSize: 0,
    incidentInternalLinkCount: 0,
    incidentAttachmentCount: 0,
    incidentTotalSize: 0,
    changeAttachmentCount: 0,
    changeInternalLinkCount: 0,
    changeTotalSize: 0,
  });

  const [isToastMessage, setIsToastMessage] = useState(false)
  const [isInventoryFailed, setIsInventoryFailed] = useState(false);
  const [isInventorywizard, setIsInventorywizard] = useState(0)

  // PS_03,04,17-28 - use Effect for the initial page load and fetch taskId from localStorage and then get Status for every 3 seconds
  useEffect(() => {
    
    const token = localStorage.getItem('cid_t')
    if (!token) {
        navigate('/')
    }
    const storedTaskId: any = sessionStorage.getItem("taskId");
    const taskId = parseInt(storedTaskId, 10);
    setSummaryPayload({
      taskId: taskId,
    });
  }, []);
  useEffect(() => {
    const token = localStorage.getItem('cid_t')
    if(!token){
      navigate('/')
    }
    const fetchInventoryStatus = async () => {
      setIsLoadingInitial(true)
      try {
        const currentStatusResponse = await getInventory(summaryPayload);

        if (currentStatusResponse.overall_status === statusMap['In Progress']) {
          setIsInventoryStarted(true);
          setIsCardsVisible(true);
          setShowInventorySummary(true);
        } else if (currentStatusResponse.overall_status === statusMap['Completed']) {
          setIsInventoryCompleted(true);
          setIsCardsVisible(true);
          setShowInventorySummary(true);
        } else {
          setIsInventoryStarted(false);
          setIsCardsVisible(false);
          setShowInventorySummary(false);
        }

        setConnectionState(currentStatusResponse.source_tenant_name);


   setSummaryData({
                requestAttachmentCount: currentStatusResponse.request_attachment_count || 0,
                requestInternalLinkCount: currentStatusResponse.request_internal_link_count || 0,
                requestTotalSize: currentStatusResponse.request_total_size || 0,
                articleAttachmentCount: currentStatusResponse.article_attachment_count || 0,
                articleInternalLinkCount: currentStatusResponse.article_internal_link_count || 0,
                articleTotalSize: currentStatusResponse.article_total_size || 0,
                ticketAttachmentCount: currentStatusResponse.ticket_attachment_count || 0,
                ticketInternalLinkCount: currentStatusResponse.ticket_internal_link_count || 0,
                ticketTotalSize: currentStatusResponse.ticket_total_size || 0,
                problemAttachmentCount: currentStatusResponse.problem_attachment_count || 0,
                problemInternalLinkCount: currentStatusResponse.problem_internal_link_count || 0,
                problemTotalSize: currentStatusResponse.problem_total_size || 0,
                solutionAttachmentCount: currentStatusResponse.solution_attachment_count || 0,
                solutionInternalLinkCount: currentStatusResponse.solution_internal_link_count || 0,
                solutionTotalSize: currentStatusResponse.solution_total_size || 0,
                incidentAttachmentCount:currentStatusResponse.request_attachment_count || 0,
                incidentInternalLinkCount:currentStatusResponse.request_internal_link_count || 0,
                incidentTotalSize:currentStatusResponse.request_total_size || 0,
                changeAttachmentCount: currentStatusResponse.change_attachment_count || 0,
                changeInternalLinkCount: currentStatusResponse.change_internal_link_count || 0,
                changeTotalSize: currentStatusResponse.change_total_size || 0,
            });

        setInventoryCounts({
          userCount: currentStatusResponse.user_count || 0,
          ticketCount: currentStatusResponse.tickets_count || 0,
          kbCount: currentStatusResponse.articles_count || 0,
          attachmentCount: currentStatusResponse.attachment_count || 0,
          attachmentSize: 0,
          solutionCount: currentStatusResponse.solution_count || 0,
          problemCount: currentStatusResponse.problem_count || 0,
          incidentCount: currentStatusResponse.incident_count || 0,
          changeCount: currentStatusResponse.change_count || 0,
          userPercentage: currentStatusResponse.user_percentage || 0,
          ticketPercentage: currentStatusResponse.tickets_percentage || 0,
          kbPercentage: currentStatusResponse.articles_percentage || 0,
          solutionPercentage: currentStatusResponse.solution_percentage || 0,
          problemPercentage: currentStatusResponse.problem_percentage || 0,
          incidentPercentage: currentStatusResponse.incident_percentage || 0,
          changePercentage: currentStatusResponse.change_percentage || 0,
          inventoryStartDate: currentStatusResponse.inventory_start_date || null,  // Add this line
          inventoryEndDate: currentStatusResponse.inventory_end_date || null
        });

         setInventoryPayload((prev) => ({
           ...prev,
           taskId: currentStatusResponse.task_id,
           applicationId: currentStatusResponse.source_tenant_id,
           isCheckedTicket: currentStatusResponse.is_checked_ticket || false,
           isCheckedKb: currentStatusResponse.is_checked_kb || false,
           isCheckedSolution: currentStatusResponse.is_checked_solution || false,
           isCheckedChange: currentStatusResponse.is_checked_change || false,
           isCheckedIncident: currentStatusResponse.is_checked_incident || false,
           isCheckedProblem: currentStatusResponse.is_checked_problem || false,
           startDate: currentStatusResponse.start_date || null, // Add start date
           endDate: currentStatusResponse.end_date || null     // Add end date
         }));
         showDateRange(!!currentStatusResponse.start_date || !!currentStatusResponse.end_date);


      } catch (error) {
        console.error('Error fetching inventory status', error);
      } finally {
        setIsLoadingInitial(false); // Set loading to false when fetch is done
      }
    };

    fetchInventoryStatus();
  }, [summaryPayload]);

  // ... rest of your component
  const handleDateCheck = () => {
    showDateRange(!dateRange);
  };
  //PS_29,30 it is for handling the checkbox change event.
  const handleCheckboxChange = (event: any) => {
    const { id, checked } = event.target;
    setInventoryPayload((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };
  //PS_77 -80 this function is for showing the exact count or the basic counts
  const toggleExactCount = () => {
    setIsExactCount(!isExactCount);
    // numeral(100).format('$0,0.00')        // Re-render cards
  };
//PS_32,33 the handleDateChange is for handling the date change values and stored in the states
const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = event.target;
  const formattedDate = new Date(value).toISOString().split('T')[0] + "T00:00:00Z";
  
  setInventoryPayload((prevPayload) => {
    let updatedPayload: any = {
      ...prevPayload,
      [name]: formattedDate,
    };

    // Automatically set endDate to today if startDate is selected
    if (name === 'startDate' && !prevPayload.endDate) {
      updatedPayload.endDate = new Date().toISOString().split('T')[0] + "T00:00:00Z";
    }

    return updatedPayload;
  });
};


const getTodayDate = () => {
  
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const todayDate = getTodayDate();

  //PS_35 - StartInventory which triggers the start Inventory process in the backend.
  const startInventory = async () => {
    setIsLoadingInventory(true);
    try {

      const startInventoryResponse = await getInventoryStatus(inventoryPayload);

      if (startInventoryResponse.status === 200) {      
        setIsInventoryStarted(true);
        setIsCardsVisible(true);
        setShowInventorySummary(true)
      }

    } catch (error) {
      console.error('Error starting inventory', error);
    } finally {
      setIsLoadingInventory(false);
    }
  };
  //PS_52,53 - useEffect for Every 3 seconds

  useEffect(() => {
    if (isInventoryStarted && isCardsVisible && !isInventoryCompleted) {

      const intervalId = setInterval(async () => {
        try {
          const inventorySummaryResponse = await getInventory(summaryPayload);

          if (inventorySummaryResponse.overall_status === statusMap['In Progress']) {
            setIsInventoryStarted(true);
            setIsCardsVisible(true);
            setShowInventorySummary(true);

          } else if (inventorySummaryResponse.overall_status === statusMap['Completed']) {
            clearInterval(intervalId);
            setIsInventoryCompleted(true);
            setShowInventorySummary(true)
            setIsToastMessage(true)
            setIsInventorywizard(3)
            setTimeout(() => {
              setIsToastMessage(false);
            }, 3000); // Adjust duration as needed
          }

          setInventoryCounts({
            userCount: inventorySummaryResponse.user_count,
            ticketCount: inventorySummaryResponse.tickets_count,
            kbCount: inventorySummaryResponse.articles_count,
            attachmentCount: inventorySummaryResponse.attachment_count,
            attachmentSize: 0,
            solutionCount: inventorySummaryResponse.solution_count,
            problemCount: inventorySummaryResponse.problem_count,
            incidentCount: inventorySummaryResponse.incident_count,
            changeCount: inventorySummaryResponse.change_count,
            userPercentage: inventorySummaryResponse.user_percentage,
            ticketPercentage: inventorySummaryResponse.tickets_percentage,
            kbPercentage: inventorySummaryResponse.articles_percentage,
            solutionPercentage: inventorySummaryResponse.solution_percentage,
            problemPercentage: inventorySummaryResponse.problem_percentage,
            incidentPercentage: inventorySummaryResponse.incident_percentage,
            changePercentage: inventorySummaryResponse.change_percentage,
            inventoryStartDate: inventorySummaryResponse.inventory_start_date,  // Add this line
            inventoryEndDate: inventorySummaryResponse.inventory_end_date
          });

          setSummaryData({
            requestAttachmentCount: inventorySummaryResponse.request_attachment_count || 0,
            requestInternalLinkCount: inventorySummaryResponse.request_internal_link_count || 0,
            requestTotalSize: inventorySummaryResponse.request_total_size || 0,
            articleAttachmentCount: inventorySummaryResponse.article_attachment_count || 0,
            articleInternalLinkCount: inventorySummaryResponse.article_internal_link_count || 0,
            articleTotalSize: inventorySummaryResponse.article_total_size || 0,
            ticketAttachmentCount: inventorySummaryResponse.ticket_attachment_count || 0,
            ticketInternalLinkCount: inventorySummaryResponse.ticket_internal_link_count || 0,
            ticketTotalSize: inventorySummaryResponse.ticket_total_size || 0,
            problemAttachmentCount: inventorySummaryResponse.problem_attachment_count || 0,
            problemInternalLinkCount: inventorySummaryResponse.problem_internal_link_count || 0,
            problemTotalSize: inventorySummaryResponse.problem_total_size || 0,
            solutionAttachmentCount: inventorySummaryResponse.solution_attachment_count || 0,
            solutionInternalLinkCount: inventorySummaryResponse.solution_internal_link_count || 0,
            solutionTotalSize: inventorySummaryResponse.solution_total_size || 0,
            incidentAttachmentCount: inventorySummaryResponse.request_attachment_count || 0,
            incidentInternalLinkCount: inventorySummaryResponse.request_internal_link_count || 0,
            incidentTotalSize: inventorySummaryResponse.request_total_size || 0,
            changeAttachmentCount: inventorySummaryResponse.change_attachment_count || 0,
            changeInternalLinkCount: inventorySummaryResponse.change_internal_link_count || 0,
            changeTotalSize: inventorySummaryResponse.change_total_size || 0,
          });
        } catch (error) {
          console.error('Error fetching current inventory counts', error);
        }
      }, 3000);

    }
  }, [isInventoryStarted, isCardsVisible, isInventoryCompleted, summaryPayload]);

  const renderFreshdeskCheckboxes = () => (
    <div className="d-flex gap-5 mb-3">
      <div className="form-check">
        <input className="form-check-input custom-checkbox" type="checkbox" id="isCheckedUser" disabled checked={inventoryPayload.isCheckedUser} onChange={handleCheckboxChange} />
        <label className="form-check-label font-14" htmlFor="isCheckedUser">User</label>
      </div>
      <div className="form-check">
        <input className="form-check-input custom-checkbox" type="checkbox" id="isCheckedTicket" disabled={isInventoryStarted || isInventoryCompleted}
 checked={inventoryPayload.isCheckedTicket} onChange={handleCheckboxChange} />
        <label className="form-check-label font-14" htmlFor="isCheckedTicket">Ticket</label>
      </div>
      <div className="form-check">
        <input className="form-check-input custom-checkbox" type="checkbox" id="isCheckedKb" disabled={isInventoryStarted || isInventoryCompleted} checked={inventoryPayload.isCheckedKb} onChange={handleCheckboxChange} />
        <label className="form-check-label font-14" htmlFor="isCheckedKb">Knowledge Base</label>
      </div>
    </div>
  );
  const renderManageEngineCheckboxes = () => (
    <div className="d-flex gap-5 mb-3">
      <div className="form-check">
        <input className="form-check-input custom-checkbox" type="checkbox" id="isCheckedUser" disabled checked={inventoryPayload.isCheckedUser} onChange={handleCheckboxChange} />
        <label className="form-check-label font-14" htmlFor="isCheckedUser">User</label>
      </div>
      <div className="form-check">
        <input className="form-check-input custom-checkbox" type="checkbox" id="isCheckedProblem" disabled={isInventoryStarted || isInventoryCompleted} checked={inventoryPayload.isCheckedProblem} onChange={handleCheckboxChange} />
        <label className="form-check-label font-14" htmlFor="isCheckedProblem">Problem</label>
      </div>
      <div className="form-check">
        <input className="form-check-input custom-checkbox" type="checkbox" id="isCheckedChange" disabled={isInventoryStarted || isInventoryCompleted} checked={inventoryPayload.isCheckedChange} onChange={handleCheckboxChange} />
        <label className="form-check-label font-14" htmlFor="isCheckedChange">Change</label>
      </div>
      <div className="form-check">
        <input className="form-check-input custom-checkbox" type="checkbox" id="isCheckedIncident" disabled={isInventoryStarted || isInventoryCompleted} checked={inventoryPayload.isCheckedIncident} onChange={handleCheckboxChange} />
        <label className="form-check-label font-14" htmlFor="isCheckedIncident">Incident</label>
      </div>
      <div className="form-check">
        <input className="form-check-input custom-checkbox" type="checkbox" id="isCheckedSolution" disabled={isInventoryStarted || isInventoryCompleted} checked={inventoryPayload.isCheckedSolution} onChange={handleCheckboxChange} />
        <label className="form-check-label font-14" htmlFor="isCheckedSolution">Solution</label>
      </div>
    </div>
  );

  //PS_65 - The export to excel is for exporting the detials in the excel sheet.
  const exportToExcel = async () => {

    try {
      const fullInventoryDetailsResponse = await getFullInventoryDetails(summaryPayload);
      generateExcelSheet(summaryPayload.taskId, fullInventoryDetailsResponse);
    } catch (error) {
      console.error('Error exporting to excel', error);
      // Handle error
    }
  };
  const parseDateFields = (data:any) => {
    const dateFields = ['created_date', 'modified_date']; // Add more fields if needed

    return data.map((item:any) => {
      let newItem = { ...item };
      dateFields.forEach(field => {
        if (item[field]) {
          newItem[field] = new Date(item[field]);
        }
      });
      return newItem;
    });
  };  
  
  const generateExcelSheet = (taskId:any, fullInventory:any) => {
    // Create a new workbook object
    const wb = XLSX.utils.book_new();

    // Iterate through each top-level key in fullInventory (ex: Users, Tickets, etc.)
    for (const [sheetName, sheetData] of Object.entries(fullInventory)) {
      // Convert each sheet's data to a worksheet if it's an array
      if (Array.isArray(sheetData)) {
        // Parse date fields
        const parsedData = parseDateFields(sheetData);

        const ws = XLSX.utils.json_to_sheet(parsedData);

        // Append the sheet to the workbook with the corresponding key as the sheet's name
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
    }

    // Generate the filename
    const exportFileName = `Task${taskId}_Inventory.xlsx`;

    // Write workbook and force a download
    XLSX.writeFile(wb, exportFileName);
  };

  const renderProgressLoader = (label: any, percentage: any) => {

    const validPercentage = Math.round(Math.max(0, Math.min(percentage, 100)));
    
    return (
      <div className="inventory-summary-v2 col-md-6 col-lg-4 col-xl-4 col-sm-12 col-xxl-3">
        <div className="w-100">
          <div className="d-flex justify-content-between">
            <p className="inventory-type mb-1">{label}</p>
            <label className="font-12 text-grey-100 font-regular">
              <span></span>
              {validPercentage}% completed
            </label>
          </div>
          <div className="progress progress-loader">
            <div
              className="progress-bar inventory-progress-loader"
              role="progressbar"
              style={{ width: `${validPercentage}%` }}
              aria-valuenow={validPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderInventoryCard = (label: string, count: number, hasAttachment = true, attachmentCount = 0, attachmentSize = 0) => {
    let internalLinks = 0;
    let attachments = 0;
    let size = 0;

    switch (label) {
      case 'Tickets':
        internalLinks = summaryData.ticketInternalLinkCount;
        attachments = summaryData.ticketAttachmentCount;
        size = summaryData.ticketTotalSize;
        break;
      case 'KB’s':
        internalLinks = summaryData.articleInternalLinkCount;
        attachments = summaryData.articleAttachmentCount;
        size = summaryData.articleTotalSize;
        break;
      case 'Solutions':
        internalLinks = summaryData.solutionInternalLinkCount;
        attachments = summaryData.solutionAttachmentCount;
        size = summaryData.solutionTotalSize;
        break;
      case 'Problems':
        internalLinks = summaryData.problemInternalLinkCount;
        attachments = summaryData.problemAttachmentCount;
        size = summaryData.problemTotalSize;
        break;
      case 'Incidents':
        internalLinks = summaryData.incidentInternalLinkCount;
        attachments = summaryData.incidentAttachmentCount;
        size = summaryData.incidentTotalSize;
        break;
      case 'Changes':
        internalLinks = summaryData.changeInternalLinkCount;
        attachments = summaryData.changeAttachmentCount;
        size = summaryData.changeTotalSize;
        break;

      default:
        break;
    }
    const formattedCount = formatCount(count, isExactCount);
    const formattedSize = formatFileSize(size, isExactCount);
    const formattedInternalLinks = formatCount(internalLinks, isExactCount); // Format internal links
    const formattedAttachments = formatCount(attachments, isExactCount); // Format attachments
       return (
        <div className={`inventory-summary-v2 col-md-6 col-lg-4 col-xl-4 col-sm-12 col-xxl-3`}>
            <div>
                <p className="inventory-type mb-1">{label}</p>
                <p className="inventory-value mb-0">{formattedCount}</p> {/* Display the actual count */}
            </div>
            {hasAttachment && (
                <div className="attachement-counts">
                    <p className="mb-1 font-12 font-medium">
                        <img src="images/inv-attachments-icon.svg" className="attachments-icons" alt="attachment-icon" />
                        <span>{formattedInternalLinks}</span> Internal Links
                    </p>
                    <p className="mb-1 font-12 font-medium">
                        <img src="images/internal-link.svg" className="attachments-icons" alt="internal-link" />
                        <span>{formattedAttachments}</span> Attachments
                    </p>
                    <p className="mb-1 font-12 font-medium">
                        <img src="images/file-size-icon.svg" className="attachments-icons" alt="file-size" />
                        <span>{formattedSize}</span> Links
                    </p>
                </div>
            )}
        </div>
    );
};

const formatCount = (count: number, isExactCount: boolean): string => {
  if (isExactCount) {
      return count.toLocaleString(); // Use toLocaleString for adding thousand separators
  }

  if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
  } else {
      return count.toString();
  }
};

// Helper function to format file sizes (e.g., 1024 -> 1KB, 1048576 -> 1MB)
const formatFileSize = (sizeInBytes: number, isExactCount: boolean): string => {
  if (isExactCount) {
      return sizeInBytes.toLocaleString() + ' bytes'; // Return exact bytes with unit
  }

  const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);
  if (sizeInGB >= 1) {
      return sizeInGB.toFixed(1) + ' GB';
  } else {
      const sizeInMB = sizeInBytes / (1024 * 1024);
      if (sizeInMB >= 1) {
          return sizeInMB.toFixed(1) + ' MB';
      } else {
          const sizeInKB = sizeInBytes / 1024;
          if(sizeInKB >= 1){
              return sizeInKB.toFixed(1) + ' KB';
          } else {
              return sizeInBytes.toFixed(1) + ' bytes';
          }

      }
  }
};

  const renderInventorySummary = () => {
    if (!isCardsVisible) return null;
    const isCompleted = isInventoryCompleted;

  const renderContent = (label: any, count: any, percentage: any) => (
    !isCompleted ? renderProgressLoader(label, percentage) : renderInventoryCard(label, count)
  );

  // Separate the User rendering logic
  const renderUserContent = () => {
    return (
          isCompleted ?  renderInventoryCard('Users', inventoryCounts.userCount, false, 0,0) : renderProgressLoader('Users', inventoryCounts.userPercentage)
    
    );
  };

  return (
    <div className="row gap-3">
      {connectionState === 'Freshdesk' ? (
        <>
          {renderUserContent()}
          {renderContent('Tickets', inventoryCounts.ticketCount, inventoryCounts.ticketPercentage)}
          {renderContent('KB’s', inventoryCounts.kbCount, inventoryCounts.kbPercentage)}
        </>
      ) : (
        <>
          {renderUserContent()}
          {renderContent('Solutions', inventoryCounts.solutionCount, inventoryCounts.solutionPercentage)}
          {renderContent('Problems', inventoryCounts.problemCount, inventoryCounts.problemPercentage)}
          {renderContent('Incidents', inventoryCounts.incidentCount, inventoryCounts.incidentPercentage)}
          {renderContent('Changes', inventoryCounts.changeCount, inventoryCounts.changePercentage)}
        </>
      )}
    </div>
  );
};

  //PS_81 ,82 moving to the next page
  const nextStep = () => {
    navigate('/migrationScreen');
  };
  //PS_83,84 Navigating to the previous screen target
  const goToPreviousScreen = () => {
    navigate('/target');
  };
  //PS_85,86 - Navigating to the Task page if the operation cancels
  const cancelOperation = () => {
    navigate('/task');
  };

  const dateOptions:Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };

   return (
     <>
       {isLoadingInitial ? (
           <Loader />
       ) : (
         <div className="container-fluid migrate-bg">
           <div className="row justify-content-center">
             <Header />
             <StripLineConnection isInventoryWizardStatus={isInventorywizard}/>
             <div className="col-md-12 col-lg-11 col-sm-12 col-xl-10">
               <div className="source-connection">
                 <div className="migrate-container px-4 py-4">
                   <p className="font-18 font-bold text-black mb-2">Select Inventory Types</p>
                   <p className="font-12 font-regular text-grey-100 mb-4">Access the Inventory module to get precise details about all tickets and knowledge bases (KBs) within your workspace</p>
                   {connectionState === 'Freshdesk' && renderFreshdeskCheckboxes()}
                   {connectionState === 'Manage Engine' && renderManageEngineCheckboxes()}
                   <div className="form-check mb-4">
                     <input className="form-check-input custom-checkbox" type="checkbox" value="" id="inventory-date" checked={dateRange} disabled={isInventoryStarted || isInventoryCompleted}

 onChange={handleDateCheck} />
                     <label className="form-check-label font-semibold font-14" htmlFor="inventory-date">Take Inventory based on Inventory date</label>
                   </div>
                   {dateRange && (
  <div>
    <p className="font-14 font-medium mb-1">Inventory Modified Dates</p>
    <div className="row">
      <div className="col-md-2 mb-4">
        <label className="form-label font-12 font-medium" htmlFor="from-date">From</label>
        <input 
          className="form-control date-type" 
          type="date" 
          name="startDate" 
          disabled={isInventoryStarted || isInventoryCompleted} 
          id="from-date" 
          max={inventoryPayload.endDate ? new Date(inventoryPayload.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} 
          value={inventoryPayload.startDate ? new Date(inventoryPayload.startDate).toISOString().split('T')[0] : ''}
          onChange={handleDateChange} 
        />
      </div>
      <div className="col-md-2 mb-4">
        <label className="form-label font-12 font-medium" htmlFor="to-date">To</label>
        <input 
          className="form-control date-type" 
          type="date" 
          disabled={isInventoryStarted || isInventoryCompleted} 
          name="endDate" 
          id="to-date" 
          min={inventoryPayload.startDate ? new Date(inventoryPayload.startDate).toISOString().split('T')[0] : ''} 
          max={new Date().toISOString().split('T')[0]} 
          value={inventoryPayload.endDate ? new Date(inventoryPayload.endDate).toISOString().split('T')[0] : ''}
          onChange={handleDateChange} 
        />
      </div>
    </div>
  </div>
)}
                   <button   className={`btn small-primary-btn btn-dark`}
                        onClick={startInventory}   
                        disabled={isInventoryStarted || isInventoryCompleted}
                   >
                     {isLoadingInventory ? <Loader /> : 'Start Inventory'}
                   </button>
                 </div>
               </div>
             </div>
             {showInventorySummary && (
               <div className="col-md-12 col-lg-11 col-sm-12 col-xl-10">
                 <div className="mt-4">
                   <div className="migrate-container px-4 py-4">
                     <div className="d-md-flex justify-content-between mb-4">
                       <div>
                         <p className="font-18 font-bold text-black mb-2">List of Inventory</p>
                         <p className="font-12 font-regular text-grey-100 mb-0">
    Inventory Start Date: {inventoryCounts.inventoryStartDate ? new Date(inventoryCounts.inventoryStartDate).toLocaleDateString(undefined, dateOptions) : 'N/A'}{' '} 
     and{' '} End Date: {inventoryCounts.inventoryEndDate ? new Date(inventoryCounts.inventoryEndDate).toLocaleDateString(undefined, dateOptions) : 'N/A'}
  </p>
                       </div>
                       <div className="d-flex align-items-center">
                         <div className="form-check form-switch me-3">
                           <input className="form-check-input custom-toggle" type="checkbox" role="switch" onChange={toggleExactCount} id="Exact-values" disabled={isInventoryStarted && !isInventoryCompleted}
 />
                           <label className="form-check-label font-14" htmlFor="Exact-values">Show Exact Values</label>
                         </div>
                         <button className="export-button font-medium font-14" disabled={isInventoryStarted && !isInventoryCompleted}
                         >
                           <span>
                             <img className="me-2" src="images/excel-icon.svg" alt="excel-icon" onClick={exportToExcel}  />
                           </span>Export
                         </button>
                       </div>
                     </div>
                     {renderInventorySummary()}
                   </div>
                 </div>
               </div>
             )}
              {isToastMessage && (
        <div className="position-absolute toast-message font-14 font-semibold py-0">
          <p className="mb-0 mt-1">
            Inventory Taken Successfully!
            <img className="popper-styles" src="images/Confetti.gif" alt="Popper" />
          </p>
        </div>
      )}
             <div className="col-md-12 col-lg-11 col-sm-12 col-xl-10">
               <div className="wizard-footer-border d-flex justify-content-between mt-5">
                 <div className="mt-3">
                   <button className="outline-primary-button me-3 font-14" onClick={goToPreviousScreen}>
                     <span className="me-2">
                       <img src="images/previous-arrow-footer.svg" alt="Previous" />
                     </span>Previous
                   </button>
                   <button className="outline-primary-button me-3 font-14" onClick={cancelOperation}>Cancel</button>
                 </div>
                 <div className="mt-3">
                   <button className="primary-btn me-3 font-14" disabled={!isInventoryCompleted}  onClick={nextStep}>
                     Next<span><img className="ms-2" src="images/next-footer-icon.svg" alt="Next" /></span>
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
     </>
   );
 };

export default InventoryScreen;














// https://www.asami.ai/chat?chatID=6A85BD91-FB2C-44F3-B113-698A65B4F563