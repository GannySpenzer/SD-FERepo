import React, { useState, useEffect } from 'react';
import { getWizardStatus } from '../../Service/InventoryService';

const StripLineConnection = ({ isInventoryWizardStatus }: any) => {
    // State variable to store the API response
    const [apiResponse, setApiResponse] = useState({
        "source_application_id": 0,
        "target_application_id": 0,
        "overall_status": 0,
        "migration_status": 0,
        "migration_percentage": 0
    });

    const [isSourceConnected, setIsSourceConnected] = useState(false);
    const [isTargetConnected, setIsTargetConnected] = useState(false);
    const [isInventoryCompleted, setIsInventoryCompleted] = useState(false);
    const [isMappingCompleted, setIsMappingCompleted] = useState(false);
    const [isMigrationCompleted, setIsMigrationCompleted] = useState(false);
    const [sourceValue, setSourceValue] = useState(''); // State for source value


    useEffect(() => {
        setIsInventoryCompleted(isInventoryWizardStatus === 3);
    }, [isInventoryWizardStatus]);


    const fetchApiResponse = async () => {
        try {

            const storedTaskId = sessionStorage.getItem("taskId");

            if (!storedTaskId) {
                console.error("Task ID not found in props or local storage.");
            }

            const data = await getWizardStatus(storedTaskId); // Call your actual API function with taskId

            setApiResponse(data);

            // Update state based on the API response
            setIsSourceConnected(data.source_application_id === 1 || data.source_application_id === 2);
            setIsTargetConnected(data.target_application_id === 3);
            setIsInventoryCompleted(data.overall_status === 3); // Assuming status 3 means completed
            setIsMappingCompleted(data.overall_status === 3); // Assuming status 4 means completed
            setIsMigrationCompleted(data.migration_status === 3);
            setSourceValue(getSourceValueFromId(data.source_application_id)); // Assuming there's a helper function to get source value

        } catch (error) {
            console.error("Error fetching wizard status:", error);
            // Optionally, set an error state and display an error message to the user
        }
    };

    useEffect(() => {
        fetchApiResponse();
    }, []);

    const getSourceValueFromId = (id: any) => {
        switch (id) {
            case 1:
                return 'Freshdesk';
            case 2:
                return 'Manage Engine';
            default:
                return '';
        }
    };


    return (
        <>
            <ul className="list-unstyled d-flex justify-content-center">
                <li className={`stepper-sty text-center d-flex flex-column align-items-center position-relative ${isSourceConnected ? 'completed' : ''}`}>
                    {isSourceConnected ? (
                        <span className="stepper-icon-sty completed font-14 font-bold">
                            <img src="images/connected-icon.svg" alt="connected-icon" />
                        </span>
                    ) : (
                        <span className="stepper-icon-sty font-14 font-bold">
                            1
                        </span>
                    )}
                    <p className="stepper-text mt-1 mb-0">Source Connection</p>

                    {/* Conditional rendering based on sourceValue */}
                    {sourceValue === 'Freshdesk' ? (
                        <p className="stepper-text mt-1 mb-0 connected-app">
                            <img
                                src="images/freshdesk-logo-short.svg"
                                alt="freshdesk"
                                className="me-2"
                            />
                            FreshDesk
                        </p>
                    ) : sourceValue === 'Manage Engine' ? (
                        <p className="stepper-text mt-1 mb-0 connected-app">
                            <img
                                src="images/manage-engine-logo.svg"
                                alt="manage-engine"
                                className="me-2"
                            />
                            ManageEngine
                        </p>
                    ) : null}
                </li>

                <li className={`stepper-sty text-center d-flex flex-column align-items-center position-relative ${isTargetConnected ? 'completed' : ''}`}>
                    {isTargetConnected ? (
                        <span className="stepper-icon-sty stepper-line completed font-14 font-bold">
                            <img src="images/connected-icon.svg" alt="connected-icon" />
                        </span>
                    ) : (
                        <span className="stepper-icon-sty stepper-line font-14 font-bold">
                            2
                        </span>
                    )}
                    <p className="stepper-text mt-1 mb-0">Target Connection</p>
                    {isTargetConnected ? (
                        <p className="stepper-text mt-1 mb-0 connected-app">
                            <img
                                src="images/atlassian-logo.svg"
                                alt="Atlassian"
                                className="me-2"
                            />
                            Atlassian
                        </p>
                    ) : null}

                </li>

                <li className={`stepper-sty text-center d-flex flex-column align-items-center position-relative ${isInventoryCompleted ? 'completed' : ''}`}>
                    {isInventoryCompleted ? (
                        <span className="stepper-icon-sty stepper-line completed font-14 font-bold">
                            <img src="images/connected-icon.svg" alt="connected-icon" />
                        </span>
                    ) : (
                        <span className={`stepper-icon-sty ${isInventoryCompleted ? 'completed' : 'stepper-line'} font-14 font-bold`}>
                            3
                        </span>
                    )}
                    <p className="stepper-text mt-1 mb-0">Inventory</p>
                </li>

                <li className={`stepper-sty text-center d-flex flex-column align-items-center position-relative ${isMappingCompleted ? 'completed' : ''}`}>
                    {isMappingCompleted ? (
                        <span className="stepper-icon-sty stepper-line completed font-14 font-bold">
                            <img src="images/connected-icon.svg" alt="connected-icon" />
                        </span>
                    ) : (
                        <span className="stepper-icon-sty stepper-line font-14 font-bold">
                            4
                        </span>
                    )}
                    <p className="stepper-text mt-1 mb-0">Mapping</p>
                </li>

                <li className={`stepper-sty text-center d-flex flex-column align-items-center position-relative ${isMigrationCompleted ? 'completed' : ''}`}>
                    {isMigrationCompleted ? (
                        <span className="stepper-icon-sty stepper-line completed font-14 font-bold">
                            <img src="images/connected-icon.svg" alt="connected-icon" />
                        </span>
                    ) : (
                        <span className="stepper-icon-sty stepper-line font-14 font-bold">
                            5
                        </span>
                    )}
                    <p className="stepper-text mt-1 mb-0">Migration</p>
                </li>
            </ul>
        </>
    );
};

export default StripLineConnection;
