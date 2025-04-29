import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MigrationState, MigrationPayload } from "../../Interface/MigrationScreenInterface";
import { pageLoadMigration, postStartMigration, postStopMigration, successMigrationReport } from "../../Service/MigrationService";
import Papa, { ParseResult } from "papaparse";
import Loader from "../PopUps/Loader";
import StipLineConnection from "../WizardStatus/StipLineConnection";
import Header from "../Header/Header";
import saveAs from "file-saver";
import AlertPopup from "../PopUps/Alert";

// Define initial state based on MigrationState interface
const initialState: MigrationState = {
  invalidFileUrl: "",
  uploadFile: "",
  migrationPercentage: 0,
  uploadedFileName: undefined,
  excelData: undefined,
  errors: { file: undefined },
  isInProgress: false,
  isCompleted: false,
  migrationStarted: false,

};

const MigrationScreen = () => {

  const [migrationPayload, setMigrationPayload] = useState<MigrationPayload>({
    taskId: 0,
    isFullInventory: false,
    isCriteriaBasedMigration: false,
    criteriaBasedCheckboxes: [],
    isTicket: false,
    isKnowledgeBase: false,
    fromDate: "",
    toDate: "",
    uploadFileName: "",
    excelData: [],
    errorMessage: "",
    migrationPercentage: 0,
    ticketResult: {
      source: 0,
      target: 0,
      failed: 0,
    },
    knowledgeBaseResult: {
      source: 0,
      target: 0,
      failed: 0,
    },
    migrationStatus: "2",
    sourceConnectionAppName: "",
    targetConnectionAppName: "",
    migrationStartDate: "",
    migrationEndDate: "",
    taskName: "",

  });
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [migrationState, setMigrationState] = useState<MigrationState>(initialState);
  const [migrationStarted, setMigrationStarted] = useState(false);
  const [isContentRendered, setIsContentRendered] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showextraColumnAlert, setShowExtraColumnAlert] = useState(false)

  const navigate = useNavigate();

  useEffect(() => {
    const taskId = sessionStorage.getItem("taskId");
    const token = localStorage.getItem('cid_t')
    if (!token) {
      navigate('/')
    }
    if (!taskId) {
      navigate('/task');
    }
    pageLoadMigrations(taskId);
  }, []);

  const pageLoadMigrations = async (taskId: any) => {
    setIsLoading(true);

    try {
      const migrationData = await pageLoadMigration(taskId);
      if (migrationData) {
        const ticketSourceCount = Number(migrationData.ticket_source_count);
        const ticketTargetCount = Number(migrationData.ticket_target_count);
        const ticketFailedCount = Number(migrationData.ticket_failed_count);

        const kbSourceCount = Number(migrationData.kb_source_count);
        const kbTargetCount = Number(migrationData.kb_target_count);
        const kbFailedCount = Number(migrationData.kb_failed_count);

        let migrationPercentage = 0;
        // Calculate the percentage based on the user selections
        if (migrationData.full_inventory) {
          const totalSource = ticketSourceCount + kbSourceCount;
          const totalTarget = ticketTargetCount + kbTargetCount;
          const totalFailed = ticketFailedCount + kbFailedCount;
          migrationPercentage = calculateProgressPercentage(totalSource, totalTarget, totalFailed);
        } else if (migrationData.criteria_based_migration && migrationData.checkbox_values.includes("Ticket") && migrationData.checkbox_values.includes("Knowledge Base")) {
          const totalSource = ticketSourceCount + kbSourceCount;
          const totalTarget = ticketTargetCount + kbTargetCount;
          const totalFailed = ticketFailedCount + kbFailedCount;
          migrationPercentage = calculateProgressPercentage(totalSource, totalTarget, totalFailed);
        } else if (migrationData.criteria_based_migration && migrationData.checkbox_values.includes("Ticket")) {
          migrationPercentage = calculateProgressPercentage(ticketSourceCount, ticketTargetCount, ticketFailedCount);
        } else if (migrationData.criteria_based_migration && migrationData.checkbox_values.includes("Knowledge Base")) {
          migrationPercentage = calculateProgressPercentage(kbSourceCount, kbTargetCount, kbFailedCount);
        } else {
          const totalSource = ticketSourceCount + kbSourceCount;
          const totalTarget = ticketTargetCount + kbTargetCount;
          const totalFailed = ticketFailedCount + kbFailedCount;
          migrationPercentage = calculateProgressPercentage(totalSource, totalTarget, totalFailed);
                }

        // Update state with new values
        setMigrationPayload({
          taskId: migrationData.task_id,
          isFullInventory: migrationData.full_inventory,
          isCriteriaBasedMigration: migrationData.criteria_based_migration,
          criteriaBasedCheckboxes: migrationData.checkbox_values ? migrationData.checkbox_values.split(",") : [],
          isTicket: migrationData.checkbox_values.includes("Ticket"),
          isKnowledgeBase: migrationData.checkbox_values.includes("Knowledge Base"),
          fromDate: migrationData.from_date ? convertToInputDateFormat(migrationData.from_date) : '',
          toDate: migrationData.to_date ? convertToInputDateFormat(migrationData.to_date) : '',
          uploadFileName: "",
          excelData: [],
          errorMessage: "",
          migrationPercentage: Math.round(migrationPercentage),
          ticketResult: {
            source: ticketSourceCount,
            target: ticketTargetCount,
            failed: ticketFailedCount,
          },
          knowledgeBaseResult: {
            source: kbSourceCount,
            target: kbTargetCount,
            failed: kbFailedCount,
          },
          migrationStatus: migrationData.migration_status,
          sourceConnectionAppName: migrationData.source_application_id === 1 ? "FreshDesk" : "Manage Engine",
          targetConnectionAppName: migrationData.target_application_id === 3 ? "Jira" : "NA",
          migrationStartDate: migrationData.migration_start_date ? convertToCustomDateFormat(migrationData.migration_start_date) : '',
          migrationEndDate: migrationData.migration_end_date ? convertToCustomDateFormat(migrationData.migration_end_date) : '',
          taskName: migrationData.task_name,
        });

        // Set content as rendered if migration is active
        if ((!isContentRendered) && (migrationData.migration_status === '2' || migrationData.migration_status === '3' || migrationData.migration_status === '6' || migrationData.migration_status === '5' || migrationData.migration_status === '8')) {
          setIsContentRendered(true);
          setMigrationStarted(true); // Assuming we set migrationStarted here
        }
      }
    } catch (error) {
      console.error("Error loading migration data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to simulate progress 
  useEffect(() => {

    if (migrationPayload.isCriteriaBasedMigration || migrationPayload.isFullInventory) {
      const intervalId = setInterval(async () => {
        try {
          const taskId = sessionStorage.getItem("taskId");
          const migrationData = await pageLoadMigration(taskId);

          if (migrationData) {
            const ticketSourceCount = Number(migrationData.ticket_source_count);
            const ticketTargetCount = Number(migrationData.ticket_target_count);
            const ticketFailedCount = Number(migrationData.ticket_failed_count);

            const kbSourceCount = Number(migrationData.kb_source_count);
            const kbTargetCount = Number(migrationData.kb_target_count);
            const kbFailedCount = Number(migrationData.kb_failed_count);

            let migrationPercentage = 0;

            // Calculate the percentage based on the user selections
            if (migrationData.full_inventory) {
              const totalSource = ticketSourceCount + kbSourceCount;
              const totalTarget = ticketTargetCount + kbTargetCount;
              const totalFailed = ticketFailedCount + kbFailedCount;
              migrationPercentage = calculateProgressPercentage(totalSource, totalTarget, totalFailed);
            } else if (migrationData.criteria_based_migration && migrationData.checkbox_values.includes("Ticket") && migrationData.checkbox_values.includes("Knowledge Base")) {
              const totalSource = ticketSourceCount + kbSourceCount;
              const totalTarget = ticketTargetCount + kbTargetCount;
              const totalFailed = ticketFailedCount + kbFailedCount;
              migrationPercentage = calculateProgressPercentage(totalSource, totalTarget, totalFailed);
            } else if (migrationData.criteria_based_migration && migrationData.checkbox_values.includes("Ticket")) {
              migrationPercentage = calculateProgressPercentage(ticketSourceCount, ticketTargetCount, ticketFailedCount);
            } else if (migrationData.criteria_based_migration && migrationData.checkbox_values.includes("Knowledge Base")) {
              migrationPercentage = calculateProgressPercentage(kbSourceCount, kbTargetCount, kbFailedCount);
            }else {
              const totalSource = ticketSourceCount + kbSourceCount;
              const totalTarget = ticketTargetCount + kbTargetCount;
              const totalFailed = ticketFailedCount + kbFailedCount;
              migrationPercentage = calculateProgressPercentage(totalSource, totalTarget, totalFailed);
                    }

            // Update state with new values
            setMigrationPayload((prevState) => ({
              ...prevState,


              migrationPercentage: Math.round(migrationPercentage),
              ticketResult: {
                source: ticketSourceCount,
                target: ticketTargetCount,
                failed: ticketFailedCount,
              },
              knowledgeBaseResult: {
                source: kbSourceCount,
                target: kbTargetCount,
                failed: kbFailedCount,
              },
              migrationStatus: migrationData.migration_status,
              sourceConnectionAppName: migrationData.source_application_id === 1 ? "FreshDesk" : "Manage Engine",
              targetConnectionAppName: migrationData.target_application_id === 3 ? "Jira" : "NA",
              migrationStartDate: migrationData.migration_start_date ? convertToCustomDateFormat(migrationData.migration_start_date) : '',
              migrationEndDate: migrationData.migration_end_date ? convertToCustomDateFormat(migrationData.migration_end_date) : '',
              taskName: migrationData.task_name,
            }));
          }
        } catch (error) {
          console.error("Error loading migration data:", error);
          clearInterval(intervalId);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(intervalId);
    }

  }, [migrationPayload]);

  useEffect(() => {
    if (!isContentRendered) {
      const taskId = sessionStorage.getItem("taskId");
      pageLoadMigrations(taskId);
    }
  }, [isContentRendered]);


  const calculateProgressPercentage = (source: number, target: number, failed: number): number => {
    const totalCount = source;
    const completedCount = target + failed;
    return totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(2) as unknown as number : 0;
  };

  const handleMigrationTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isFullInventory = event.target.value === "fullInventory";
    setMigrationPayload((prevState) => ({
      ...prevState,
      isFullInventory,
      isCriteriaBasedMigration: !isFullInventory,
      criteriaBasedCheckboxes: [],
      uploadFileName: "",
      isTicket: false,
      isKnowledgeBase: false,
      fromDate: "",
      toDate: "",
      excelData: [],
      errorMessage: ""
    }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checkBoxName = event.target.id;
    const { criteriaBasedCheckboxes, isTicket, isKnowledgeBase } = migrationPayload;

    const newCheckboxValues = criteriaBasedCheckboxes.includes(checkBoxName)
      ? criteriaBasedCheckboxes.filter((value) => value !== checkBoxName)
      : [...criteriaBasedCheckboxes, checkBoxName];

    setMigrationPayload((prevState) => ({
      ...prevState,
      criteriaBasedCheckboxes: newCheckboxValues,
      isTicket: checkBoxName === "Ticket" ? !isTicket : isTicket,
      isKnowledgeBase: checkBoxName === "Knowledge Base" ? !isKnowledgeBase : isKnowledgeBase

    }));
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    const newDate = new Date(value);
    const formattedDate = newDate.toISOString().split('T')[0];
    const todayDate = new Date().toISOString().split('T')[0];

    setMigrationPayload((prevState) => {
      let updatedPayload = { ...prevState };

      if (id === "from-date") {
        updatedPayload.fromDate = formattedDate;

        // Automatically set toDate to today if fromDate is selected and toDate is not set
        if (!prevState.toDate) {
          updatedPayload.toDate = todayDate;
        } else if (formattedDate > prevState.toDate) {
          updatedPayload.toDate = formattedDate;
        }
      } else if (id === "to-date") {
        if (prevState.fromDate && formattedDate < prevState.fromDate) {
          updatedPayload.toDate = prevState.fromDate;
        } else {
          updatedPayload.toDate = formattedDate;
        }
      }

      return updatedPayload;
    });
  };
  // Function to handle template download
  const handleDownloadTemplateClick = () => {
    // Define the template headers and any initial data (as an array of arrays for simplicity)
    const headers = [
      ["Source Entity ID", "Source Entity Type"]
    ];

    // Convert header array to CSV string
    const csvContent = headers.map(row => row.join(",")).join("\n");

    // Create a Blob from the CSV string
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const anchorElement = document.createElement("a");
    anchorElement.href = url;
    anchorElement.download = "MigrationTemplate.csv"; // Desired CSV file name for download
    document.body.appendChild(anchorElement);
    anchorElement.click();
    document.body.removeChild(anchorElement);
    URL.revokeObjectURL(url);
  };

  // Function to validate the Excel data
  const validateExcelData = (data: any[]): { isValid: boolean, invalidData: any[],hasExtraColumns: boolean } => {
    let isValidOverall = true;
    let hasExtraColumns = false;
    const invalidRows: any[] = [];
  
    const validColumns = ["Source Entity ID", "Source Entity Type"];
    const validSourceEntityTypes = ['Ticket', 'Request', 'Problem', 'Change', 'Solution', 'Article'];
  
    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      for (const column of columns) {
        if (!validColumns.includes(column)) {
          hasExtraColumns = true;
          isValidOverall = false;
          break;
        }
      }
    } else {
      // No data rows available, check if the column names match
      hasExtraColumns = !validColumns.every(column => data.some(row => row.hasOwnProperty(column)));
      if (hasExtraColumns) {
        isValidOverall = false;
      }
    }

    for (const row of data) {
      let isValidRow = true;
      let comments = "";
  
      // Check for invalid columns
      for (const key in row) {
        if (!validColumns.includes(key)) {
          hasExtraColumns = true;
          isValidOverall = false;
          break;
        }
      }

      if (hasExtraColumns) {
        break;
      }

      if (!row["Source Entity ID"] && comments === "") {
        comments = "Source Entity ID can't be empty";
        isValidRow = false;
      } else if (!/^[1-9]\d*$/.test(row["Source Entity ID"]) && comments === "") {
        comments = "Invalid Source ID";
        isValidRow = false;
      }

      if (!row["Source Entity Type"] && comments === "") {
        comments = "Source Entity type can't be empty";
        isValidRow = false;
      } else if (!validSourceEntityTypes.includes(row["Source Entity Type"]) && comments === "") {
        comments = "Invalid Source Entity Type";
        isValidRow = false;
      }

      if (comments === "" && (!row["Source Entity ID"] || !/^[1-9]\d*$/.test(row["Source Entity ID"])) && (!row["Source Entity Type"] || !validSourceEntityTypes.includes(row["Source Entity Type"]))) {
        comments = "Invalid Details Provided";
        isValidRow = false;
      }

      if (!isValidRow) {
        row["Status"] = "Invalid";
        row["Comments"] = comments;
        invalidRows.push({
          "Source Entity ID": row["Source Entity ID"],
          "Source Entity Type": row["Source Entity Type"],
          "Status": row["Status"],
          "Comments": row["Comments"]
        });
        isValidOverall = false;
      }
    }

    if (!isValidOverall && invalidRows.length > 0) {
      CreateInvalidFileReport(invalidRows);
    }

    return { isValid: isValidOverall, invalidData: invalidRows, hasExtraColumns };
  };


  const CreateInvalidFileReport = (data: any[]) => {
    const columns = [
      "Source Entity ID",
      "Source Entity Type",
      "Status",
      "Comments"
    ];

    // Ensure each invalid data entry contains the necessary columns
    const formattedData = data.map(invalidData => ({
      "Source Entity ID": invalidData["Source Entity ID"],
      "Source Entity Type": invalidData["Source Entity Type"],
      "Status": invalidData.Status,
      "Comments": invalidData.Comments
    }));

    const csv = Papa.unparse({
      fields: columns,
      data: formattedData
    });

    return new Blob([csv], { type: "text/csv;charset=utf-8;" });
  };

  // New function to parse CSV files and return data
  const parseCsvFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<any>) => resolve(results.data),
        error: (error) => reject(error),
      });
    });
  };

  // Helper function to handle the file processing logic
  const processFile = async (file: File) => {
    const isCsv = file.name.toLowerCase().endsWith('.csv');
    const fileSize = file.size <= 5 * 1024 * 1024; // <= 5MB

    if (isCsv && fileSize) {
      try {
        const data = await parseCsvFile(file);
        const { isValid, invalidData, hasExtraColumns } = validateExcelData(data);

        if (hasExtraColumns) {
          setAlertTitle('Invalid file provided');
          setErrorMessage('Your file contains invalid column data. Retry Again');
          setShowExtraColumnAlert(true);
          setMigrationPayload(prevState => ({
            ...prevState,
            excelData: [], // Clear previously loaded data
          }));
          const fileInput = document.getElementById("browse-file") as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
          return; // Exit the function early if extra columns are found.
        }

        if (isValid) {
          setMigrationPayload(prevState => ({
            ...prevState,
            uploadFileName: file.name,
            errorMessage: '',
            excelData: data,
            isCriteriaBasedMigration: true, // NEW - set criteria based migration to true
            isFullInventory: false, // NEW - ensure full inventory is false
            isTicket: false,          // NEW - clear ticket flag
            isKnowledgeBase: false,
          }));
        } else {
          setAlertTitle('Invalid file provided');
          setErrorMessage('Your file contains invalid data. Click OK to download.');
          setShowAlert(true);
          setMigrationPayload(prevState => ({
            ...prevState,
            excelData: invalidData, // Clear previously loaded data
          }));
          const fileInput = document.getElementById("browse-file") as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
        }
      } catch (error) {
        setMigrationPayload(prevState => ({
          ...prevState,
          errorMessage: 'Error parsing CSV file. Please try again.',
        }));
      }
    } else {
      setMigrationPayload(prevState => ({
        ...prevState,
        errorMessage: 'Please upload a .csv file.',
      }));
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    setAlertTitle('');
    setErrorMessage('');

    // Clear the error message in the payload if it exists
    setMigrationPayload(prevState => ({
      ...prevState,
      errorMessage: '',
    }));

    const invalidFileBlob = CreateInvalidFileReport(migrationPayload.excelData);
    saveAs(invalidFileBlob, 'InvalidMigrationTemplate.csv');
  };

  const handleCloseExtraColumnAlert = () => {
    setShowExtraColumnAlert(false)
    setAlertTitle('');
    setErrorMessage('');

    // Clear the error message in the payload if it exists
    setMigrationPayload(prevState => ({
      ...prevState,
      errorMessage: '',
    }));
  };

  // Event handler for input type='file' change
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  // This function will be called to clear the uploaded file
  const clearUploadedFile = () => {
    setMigrationPayload((prevState) => ({
      ...prevState,
      uploadFileName: "",
      excelData: [],
      fileError: "",
    }));
    const fileInput = document.getElementById("browse-file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent the browser from opening the file
    const files = event.dataTransfer.files;
    if (files.length) {
      processFile(files[0]); // Use the first file if multiple files are dropped.
    }
  };

  const handleStartMigration = async () => {

    setIsLoading(true);
    const taskId = sessionStorage.getItem("taskId");

    const taskNumber = taskId ? parseInt(taskId, 10) : 0;
    setMigrationPayload((prevPayload) => ({
      ...prevPayload,
      taskId: taskNumber,
    }));

    try {
      setMigrationPayload((prev) => ({
        ...prev, migrationStatus: '2',
      }))
      const response = await postStartMigration(migrationPayload);

      if (response && response.status === 200) {
        setIsLoading(false)
        setMigrationStarted(true);
        setMigrationPayload((prevPayload) => ({
          ...prevPayload,
          migrationPercentage: response.migration_percentage,
          isInProgress: true,
          isCompleted: false,
          errorMessage: "", // Clear any previous error message
        }));
        pageLoadMigration(taskNumber);
      } else {
        setIsLoading(false)
        setMigrationStarted(false);
        setMigrationPayload((prevPayload) => ({
          ...prevPayload,
          errorMessage: "Migration failed. Please try again.",
        }));
      }
    } catch (error) {
      setIsLoading(false)
      setMigrationStarted(false);
      setMigrationPayload((prevPayload) => ({
        ...prevPayload,
        errorMessage: "Migration failed. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopMigration = async () => {
    setMigrationState(migrationState => ({
      ...migrationState,
      isStoppingMigration: true, // Indicate that the stop request is in progress
    }));
    setIsLoading(true)
    try {
      const storedTaskId: any = sessionStorage.getItem("taskId");
      const taskId = parseInt(storedTaskId, 10);
      const response = await postStopMigration(taskId);

      if (response) {
        setIsLoading(false)
        // Update state based on response from the stop migration service
        setMigrationState((migrationState) => ({
          ...migrationState,
          isMigrationRunning: false,
          migrationStatus: response.status,
        }));
      }
    } catch (error) {
      console.error('Failed to stop migration:', error);
      setIsLoading(false)
      setMigrationState(migrationState => ({
        ...migrationState,
        isStoppingMigration: false, // Stop loading indicator as process has failed
        migrationError: 'Failed to stop the migration. Please try again.',
      }));
    }
  };
  // Function to trigger CSV export
  const handleExport = async () => {
    try {
      const taskId = sessionStorage.getItem("taskId");
      const migrationData = await successMigrationReport(taskId); // Assuming this fetches the data

      if (migrationData && migrationData.details) {
        // Prepare data for CSV
        const csvData = migrationData.details
          .filter((detail: { EntityType: string }) => {
            // Include if isTicket is true and EntityType is one of Problem, Change, Request, Ticket
            if (migrationPayload.isTicket && ['Problem', 'Change', 'Request', 'Ticket'].includes(detail.EntityType)) return true;
            // Include if isKnowledgeBase is true and EntityType is Solution or Article
            if (migrationPayload.isKnowledgeBase && ['Solution', 'Article'].includes(detail.EntityType)) return true;
            // Include if both isTicket and isKnowledgeBase are true
            if (migrationPayload.isTicket && migrationPayload.isKnowledgeBase) return true;
            // Include if full inventory was selected are true
            if (migrationPayload.isFullInventory) return true
            return false;
          })
          .map((detail: { EntityID: any; EntityType: any; Status: number; IsMigrated: boolean, MigrationStatus: string }) => ({
            "Source Entity ID": `\t${detail.EntityID}`, // Prepend tab character to treat as text in Excel
            "Source Entity Type": detail.EntityType,
            "Target Entity ID": `\t${detail.EntityID}`,
            "Target Entity Type": detail.EntityType,
            "Status":
              detail.MigrationStatus === "3" ? "Completed" :
                detail.MigrationStatus === "5" ? "Failed" :
                  detail.MigrationStatus === "6" ? "Warning" :
                    detail.Status === 1 ? (detail.IsMigrated ? "Completed" : "Failed") :
                      detail.Status === 4 ? (detail.IsMigrated ? "Completed" : "Failed") :
                        detail.Status === 9 ? (detail.IsMigrated ? "Completed" : "Failed") :
                          detail.Status === 5 ? "Failed" :
                            detail.Status === 6 ? "Warning" :
                              "Yet To Start" // Default case if the status is not one of the specified values
          }));

        // Generate CSV content
        const csv = Papa.unparse({
          fields: ["Source Entity ID", "Source Entity Type", "Target Entity ID", "Target Entity Type", "Status"],
          data: csvData,
        });

        // Create a Blob and trigger download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchorElement = document.createElement("a");
        anchorElement.href = url;
        anchorElement.download = "MigrationSuccessReport.csv";
        document.body.appendChild(anchorElement);
        anchorElement.click();
        document.body.removeChild(anchorElement);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting migration data:", error);
    } finally {
      setIsLoading(false); // Assuming you have state management for loading
    }
  };

  const handlePrevious = () => {
    navigate("/inventoryScreen")
  }

  //PS_85,86 - Navigating to the Task page if the operation cancels
  const cancelOperation = () => {
    navigate('/task');
  };

  const canStartMigration = (migrationPayload.isFullInventory ||
    (migrationPayload.isCriteriaBasedMigration && (migrationPayload.isTicket || migrationPayload.isKnowledgeBase)) ||
    (migrationPayload.uploadFileName && !migrationPayload.errorMessage));

  const isFileUploadDisabled = migrationPayload.criteriaBasedCheckboxes.length > 0;
  const isSetFileUploadDisabled = migrationPayload.criteriaBasedCheckboxes.length > 0 || migrationPayload.uploadFileName !== '';
  const isCriteriaSectionDisabled = migrationPayload.uploadFileName !== '';


  const convertToInputDateFormat = (dateString: any) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const convertToCustomDateFormat = (isoDateString: any) => {
    if (!isoDateString) return ''; // Handle cases where the isoDateString is not provided

    const date = new Date(isoDateString);

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
    const hours = String(date.getUTCHours()).padStart(2, '0'); // 24-hour format
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${day}, ${month} ${hours}:${minutes}`;
  };

  const calculateMigrationTime = (totalTickets: number, migrationRatePerMinuteMin: number, migrationRatePerMinuteMax: number) => {
    const averageMigrationRatePerMinute = (migrationRatePerMinuteMin + migrationRatePerMinuteMax) / 2;
    const totalTimeInMinutes = totalTickets / averageMigrationRatePerMinute;
    const totalTimeInSeconds = totalTimeInMinutes * 60;

    const days = Math.floor(totalTimeInSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalTimeInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalTimeInSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(totalTimeInSeconds % 60);

    if (days > 0) {
      return `${days} ${days === 1 ? 'Day' : 'Days'}`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'Minute' : 'Minutes'}`;
    } else {
      return `${seconds} ${seconds === 1 ? 'Second' : 'Seconds'}`;
    }
  };

  const calculateTotalCount = (isTicket: boolean, isKnowledgeBase: boolean, isFullInventory: boolean, ticketSourceCount: number, kbSourceCount: number) => {
    if (isFullInventory) {
      return ticketSourceCount + kbSourceCount;
    }
    if (isTicket && isKnowledgeBase) {
      return ticketSourceCount + kbSourceCount;
    }
    if (isTicket) {
      return ticketSourceCount;
    }
    if (isKnowledgeBase) {
      return kbSourceCount;
    }
    return 0; // Default case if none are selected
  };

  const totalCount = calculateTotalCount(
    migrationPayload.isTicket,
    migrationPayload.isKnowledgeBase,
    migrationPayload.isFullInventory,
    migrationPayload.ticketResult.source,
    migrationPayload.knowledgeBaseResult.source
  );

  const estimatedTime = calculateMigrationTime(totalCount, 7, 10);

  return (
    <>
      {isLoading && <Loader />}
      {showAlert && (
        <AlertPopup title={alertTitle} message={errorMessage} onClose={handleCloseAlert} />
      )}
      {showextraColumnAlert && (
        <AlertPopup title={alertTitle} message={errorMessage} onClose={handleCloseExtraColumnAlert} />
      )}

      <div className="container-fluid migrate-bg">
        <div className="row justify-content-center">


          <Header />
          {!migrationStarted && (
            <div className="col-md-12 col-lg-11 col-sm-12 col-xl-10">
              <StipLineConnection />
              <div className="source-connection">
                <div className="migrate-container px-4 py-4">
                  <div className="mb-4">
                    <div className="mb-4">
                      <p className="font-18 font-bold text-black mb-2">
                        Start your Migration
                      </p>
                      <p className="font-12 font-regular text-grey-100 mb-0">
                        Start your migration by your choice
                      </p>
                    </div>

                    <div className="d-flex gap-3 mb-4">
                      <div className="col-auto">
                        <label className="card-radio w-100">
                          <input
                            type="radio"
                            name="migrationType"
                            value="fullInventory"
                            className="d-none"
                            onChange={handleMigrationTypeChange}
                            checked={migrationPayload.isFullInventory}
                          />
                          <div className="card migrate-container h-100">
                            <div className="card-body">
                              <div className="d-flex align-items-center">
                                <div className="radio-circle me-3"></div>
                                <p className="font-14 font-medium text-black mb-0">
                                  Full Inventory
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="col-auto">
                        <label className="card-radio w-100">
                          <input
                            type="radio"
                            name="migrationType"
                            value="criteriaBasedMigration"
                            className="d-none"
                            onChange={handleMigrationTypeChange}
                            checked={migrationPayload.isCriteriaBasedMigration}
                          />
                          <div className="card migrate-container h-100">
                            <div className="card-body">
                              <div className="d-flex align-items-center">
                                <div className="radio-circle me-3"></div>
                                <p className="font-14 font-medium text-black mb-0">
                                  Criteria-Based Migration
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {migrationPayload.isCriteriaBasedMigration && (
                      <div className="row">
                        <div className="col-md-4">
                          <div className="d-flex gap-5 mb-4">
                            <div className="form-check">
                              <input
                                className="form-check-input custom-checkbox"
                                type="checkbox"
                                id="Ticket"
                                onChange={handleCheckboxChange}
                                checked={migrationPayload.criteriaBasedCheckboxes.includes("Ticket")}
                                disabled={isCriteriaSectionDisabled}
                              />
                              <label
                                className="form-check-label font-14 font-medium"
                                htmlFor="ticket"
                              >
                                Ticket
                              </label>
                            </div>

                            <div className="form-check">
                              <input
                                className="form-check-input custom-checkbox"
                                type="checkbox"
                                id="Knowledge Base"
                                onChange={handleCheckboxChange}
                                checked={migrationPayload.criteriaBasedCheckboxes.includes("Knowledge Base")}
                                disabled={isCriteriaSectionDisabled}
                              />
                              <label
                                className="form-check-label font-14 font-medium"
                                htmlFor="knowledgebase"
                              >
                                Knowledge base
                              </label>
                            </div>
                          </div>

                          <div>
                            <p className="font-14 font-semibold mb-2">
                              Record Modified Dates
                            </p>
                            <div className="row">
                              <div className="col-md-6">
                                <label
                                  className="form-label font-12 font-medium"
                                  htmlFor="from-date"
                                >
                                  From Date
                                </label>
                                <input
                                  type="date"
                                  className="w-100 form-control date-type"
                                  id="from-date"
                                  onChange={handleDateChange}
                                  value={migrationPayload.fromDate ? migrationPayload.fromDate.split('T')[0] : ''}
                                  disabled={isCriteriaSectionDisabled}
                                  max={migrationPayload.toDate ? migrationPayload.toDate.split('T')[0] : new Date().toISOString().split('T')[0]}
                                />
                              </div>
                              <div className="col-md-6">
                                <label
                                  className="form-label font-12 font-medium"
                                  htmlFor="to-date"
                                >
                                  To Date
                                </label>
                                <input
                                  type="date"
                                  className="w-100 form-control date-type"
                                  id="to-date"
                                  onChange={handleDateChange}
                                  value={migrationPayload.toDate ? migrationPayload.toDate.split('T')[0] : ''}
                                  min={migrationPayload.fromDate ? migrationPayload.fromDate.split('T')[0] : ''}
                                  max={new Date().toISOString().split('T')[0]}
                                  disabled={isCriteriaSectionDisabled}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={`col-md-4 border-left ${isFileUploadDisabled ? 'disabled' : ''}`}>
                          <p className="font-14 font-semibold mb-2">
                            Migrate Specific tickets or articles
                          </p>
                          <div className="upload-file align-center"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop} // Attach drag and drop handlers here 
                          >
                            <img
                              className="mb-2"
                              src="images/file-upload-icon.svg"
                              alt="file-upload"
                            />
                            <p className="font-medium font-14 mb-1 mt-1">
                              Drag & drop your file here or
                              <label
                                htmlFor="browse-file"
                                className="choose-file ms-1 text-underline cursor-pointer"
                              >
                                Choose File
                              </label>
                              <input
                                id="browse-file"
                                type="file"
                                className="d-none"
                                accept=".csv"
                                onChange={handleFileUpload}
                                disabled={isSetFileUploadDisabled}
                              />
                            </p>
                            <a
                              className="download-template font-14 font-medium text-decoration-none cursor-pointer"
                              onClick={handleDownloadTemplateClick}
                            >
                              Download Template
                            </a>
                            {/* Display uploaded file name here */}
                            {migrationPayload.uploadFileName && (
                              <div className="uploaded-file-info">
                                <span className="font-regular font-12 ms-2 grey-text-color-light-v2">
                                  {migrationPayload.uploadFileName}
                                </span>
                                <img
                                  src="images/close-icon.svg"
                                  alt="remove-upload"
                                  className="close-icon ms-2 cursor-pointer"
                                  onClick={clearUploadedFile}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    )}
                    {migrationPayload.errorMessage && <div style={{ color: 'red' }}>{migrationPayload.errorMessage}</div>}

                    <button className="btn small-primary-btn mt-4 btn-dark" onClick={handleStartMigration} disabled={!canStartMigration}>
                      Start Migration
                    </button>



                    {migrationState.invalidFileUrl && (
                      <div>
                        <p>
                          Provided file is invalid. Please download the report,
                          correct the errors, and try again.
                        </p>
                        <a
                          href={migrationState.invalidFileUrl}
                          download="InvalidMigrationTemplate.csv"
                        >
                          Download Error Report
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {migrationStarted && (
            <div className="col-md-12 col-lg-11 col-sm-12 col-xl-10">
              <StipLineConnection />
              <div className="source-connection">
                {/* Criteria Detail Section Starts */}
                {migrationPayload.isCriteriaBasedMigration && (
                  <div className="migrate-container px-4 py-4">
                    <div className="mb-4">
                      <p className="font-18 font-bold text-black mb-2">Criteria Based Migration</p>
                    </div>
                    <div className="row">
                      <div className="col-md-6 col-lg-6 col-xl-2">
                        <label className="font-14 font-semibold mb-1">Inventory Types</label>
                        <p className="font-14 mb-1">{migrationPayload.criteriaBasedCheckboxes.join(", ")}</p>
                      </div>
                      <div className="col-md-6 col-lg-6 col-xl-2">
                        <label className="font-14 font-semibold mb-1">Record Modified Date</label>
                        <p className="font-14 mb-1">{`${migrationPayload.fromDate} - ${migrationPayload.toDate}`}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Criteria Detail Section Ends */}

                {/* Migration Inprogress section starts */}
                {(migrationPayload.isFullInventory || migrationPayload.isCriteriaBasedMigration) && (
                  <div className="migrate-container px-4 py-4 mt-4">
                    <div className="d-flex justify-content-between mb-4">
                      <div className=" d-flex">
                        <div>
                          <img src="images/demo-migration-icon.svg" alt="migration-icon" className="me-2" />
                        </div>
                        <div>
                          <p className="font-15 font-medium text-black mb-0">{migrationPayload.taskName}</p>
                          <p className="font-12 text-grey-100 mb-0">Start - End Time and Date  |  {migrationPayload.migrationStartDate} - {migrationPayload.migrationEndDate}</p>
                        </div>
                      </div>
                      <button className="btn stop-migration-btn font-14" onClick={handleStopMigration} disabled={migrationPayload.migrationStatus === '3' || migrationPayload.migrationStatus === '8'}>Stop Migration</button>
                    </div>
                    <p style={{ float: "right" }}>{migrationPayload.migrationPercentage}%</p>
                    <label className="font-13 font-medium">Migration Status:
                      <span className={`ms-2 status-badge ${migrationPayload.migrationStatus === '2' ? 'inprogress-badge' :
                        migrationPayload.migrationStatus === '3' ? 'completed-badge' :
                          migrationPayload.migrationStatus === '5' ? 'failed-badge' :
                            migrationPayload.migrationStatus === '6' ? 'warning-badge' :
                              migrationPayload.migrationStatus === '8' ? 'cancelled-badge' :
                                'default-badge'} font-semibold`}>
                        {migrationPayload.migrationStatus === '2' ? 'In Progress' :
                          migrationPayload.migrationStatus === '3' ? 'Completed' :
                            migrationPayload.migrationStatus === '5' ? 'Failed' :
                              migrationPayload.migrationStatus === '6' ? 'Warning' :
                                migrationPayload.migrationStatus === '8' ? 'Cancelled' :
                                  migrationPayload.migrationStatus}
                      </span>
                    </label>
                    <div className="progress custom-progress-bar mt-3 mb-2" role="progressbar" aria-label="Basic example" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}>
                      <div className="progress-bar progress-bar-color" style={{ width: `${migrationPayload.migrationPercentage}%` }} />
                    </div>
                    <label className="font-12 text-grey-100">
                      {migrationPayload.migrationStatus === '3'
                        ? `Migration Completed.`
                        : `Migration may take up to ${estimatedTime}. In the meantime, you can click "Continue in Background" to navigate to other screens.`}
                    </label>
                  </div>
                )}
                {/* Migration Inprogress section Ends */}

                {/* Migration Completed section starts */}
                {(migrationPayload.migrationStatus === "3" || migrationPayload.migrationStatus === "6" || migrationPayload.migrationStatus === "5") && (
                  <div className="migrate-container px-4 py-4 mt-5">
                    <div className="d-flex justify-content-between mb-4">
                      <div className=" d-flex">
                        <div>
                          <img src="images/demo-migration-icon.svg" alt="migration-icon" className="me-2" />
                        </div>
                        <div>
                          <p className="font-15 font-medium text-black mb-0">{migrationPayload.taskName}</p>
                          <p className="font-12 text-grey-100 mb-0">Start - End Time and Date  | {migrationPayload.migrationStartDate} - {migrationPayload.migrationEndDate}</p>
                        </div>
                      </div>
                      <button className="export-button font-medium font-14"><span> <img className="me-2" src="images/excel-icon.svg" alt="excel-icon" onClick={handleExport} /></span>Export</button>
                    </div>
                    <div className="d-flex gap-4">
                      <div className="col-xl-3 col-lg-4 col-md-4 migrate-container py-2 px-3">
                        <p className="font-14 font-semibold text-black">Tickets</p>
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <p className="font-12 font-medium text-color mb-0">Source</p>
                            <p className="font-16 font-semibold text-black mb-0">{migrationPayload.ticketResult.source}</p>
                          </div>
                          <div className="col-auto">
                            <img src="images/tickets-arrow.svg" />
                          </div>
                          <div className="col-auto">
                            <p className="font-12 font-medium text-color mb-0">Target</p>
                            <p className="font-16 font-semibold text-black mb-0">{migrationPayload.ticketResult.target} <span className="warning-tickets-count font-11 font-semibold text-black ms-1"><img src="images/warning-icon.svg" alt="warning-icon" /> {migrationPayload.ticketResult.failed} </span></p>
                          </div>
                        </div>
                      </div>
                      <div className="col-xl-3 col-lg-4 col-md-4 migrate-container py-2 px-3">
                        <p className="font-14 font-semibold text-black">Knowledge Base</p>
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <p className="font-12 font-medium text-color mb-0">Source</p>
                            <p className="font-16 font-semibold text-black mb-0">{migrationPayload.knowledgeBaseResult.source}</p>
                          </div>
                          <div className="col-auto">
                            <img src="images/tickets-arrow.svg" />
                          </div>
                          <div className="col-auto">
                            <p className="font-12 font-medium text-color mb-0">Target</p>
                            <p className="font-16 font-semibold text-black mb-0">{migrationPayload.knowledgeBaseResult.target} <span className="warning-tickets-count font-11 font-semibold text-black ms-1"><img src="images/warning-icon.svg" alt="warning-icon" />  {migrationPayload.knowledgeBaseResult.failed} </span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Migration Completed section Ends */}
              </div>
            </div>
          )}

          <div className=" wizard-footer-border d-flex justify-content-between mt-5">
            <div className="mt-3">
              <button className="outline-primary-button me-3 font-14" onClick={handlePrevious}><span className="me-2"><img src="images/previous-arrow-footer.svg" alt="Previous"></img></span>Previous</button>
              <button className="outline-button font-14" onClick={cancelOperation}>Cancel</button>
            </div>

            <div className="mt-3">
              <button className="primary-btn me-3 font-14">Action<span><img className="ms-2" src="images/action-viewall-icon.svg" alt="viewall"></img></span></button>
            </div>
          </div>


        </div>
      </div>

    </>
  );
};

export default MigrationScreen;
