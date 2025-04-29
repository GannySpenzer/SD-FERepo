import React from 'react'
import { useState, useEffect } from 'react'
import { API } from '../../Service/ConnectorService';
import { useNavigate } from 'react-router-dom';
import StipLineConnection from '../WizardStatus/StipLineConnection';
import { encryptHybridMessage } from '../../Common/Encryption';
import { IApplication, ISourceConnection } from '../../Interface/ConnectorInterface';
import Loader from '../PopUps/Loader';
import Header from '../Header/Header';


const SourceConnector = () => {

    const taskId = sessionStorage.getItem("taskId");

    const navigate = useNavigate();
    const [sourceConnection, setSourceConnection] = useState<ISourceConnection>({
        sourceUrl: '',
        sourceApiKey: '',
        sourceValue: '',
        organizationId: 2,
        applicationId: null,
        connectionId: null

    });

    const [isSuccessPopup, setIsSuccessPopup] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isButtonClickable, setIsButtonClickable] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isSourceConnected, setIsSourceConnected] = useState<boolean>(false);
    const [applications, setApplications] = useState<IApplication[]>([]);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false)


    useEffect(() => {
        if (!taskId) {
            navigate('/task');
        }
    }, [taskId, navigate]);

    useEffect(() => {

        const token = localStorage.getItem('cid_t')
        if (!token) {
            navigate('/')
        }

        const getAllApplications = async () => {
            let payload = { task_id: taskId };
            try {
                setIsLoading(true);
                const response = await API.getAllApplication(payload);
                setApplications(response.applications);
                setIsLoading(false);

                if (response.connector_details) {

                    setSourceConnection(prevState => ({
                        ...prevState,
                        connectionId: parseInt(response.connector_details.ConnectionID, 10),
                        applicationId: parseInt(response.connector_details.SourceApplicationID) // Convert to integer
                    }));
                    // Check if connector details are empty
                    if (
                        !response.connector_details.SourceTenantURL &&
                        !response.connector_details.SourceClientSecret
                    ) {
                        // Reset state variables to normal/default values
                        setSourceConnection({
                            sourceUrl: '',
                            sourceApiKey: '',
                            sourceValue: '',
                            organizationId: 1,
                            applicationId: null,
                            connectionId: parseInt(response.connector_details.ConnectionID, 10)
                        });
                        setIsSuccessPopup(false);
                        setIsButtonClickable(true);
                        setIsReadOnly(false);
                        setIsSourceConnected(false);
                    } else {
                        // Update sourceConnection with connector details
                        setSourceConnection(prevState => ({
                            ...prevState,
                            sourceUrl: response.connector_details.SourceTenantURL || prevState.sourceUrl,
                            sourceApiKey: response.connector_details.SourceClientSecret || prevState.sourceApiKey,
                            sourceValue: response.connector_details.SourceApplicationID === "1" ? "Freshdesk" : "Manage Engine",
                        }));
                        // Check if connection is established
                        if (response.connector_details.SourceTenantURL && response.connector_details.SourceClientSecret) {
                            setIsSuccessPopup(true);
                            setIsButtonClickable(false);
                            setIsReadOnly(true);
                            setIsSourceConnected(true);
                        } else {
                            setIsButtonClickable(true);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching applications', error);
                setIsLoading(false);
            }
        };
        getAllApplications();
    }, []);


    const handleRadioSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        // Find the selected application based on value
        const selectedApplication = applications?.find((app: any) => app.application_name === value);

        if (isSuccessPopup) {
            setShowModal(true); // Show modal if success popup is true
        } else {
            setSourceConnection(prevState => ({
                ...prevState,
                sourceValue: value,
                applicationId: selectedApplication?.application_id || null, // Set applicationID from selected application
                sourceApiKey: '',
                sourceUrl: ''
            }));
        }
        setErrorMessage('')
    };


    const MAX_API_KEY_LENGTH = 50;

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        // Check if the input is 'sourceApiKey' and its length exceeds the maximum allowed length
        if (name === 'sourceApiKey' && value.length > MAX_API_KEY_LENGTH) {
            event.target.value = value.substring(0, MAX_API_KEY_LENGTH);
        }

        // Update state dynamically based on input name
        setSourceConnection(prevState => ({
            ...prevState,
            [name]: value
        }));


        // Perform validation based on the input field being updated
        let error = '';

        if (name === 'sourceUrl') {
            if (!value) {
                error = 'URL Cannot be empty';
            } else if (!validateUrl(value)) {
                error = 'Invalid URL provided';
            }
        } else if (name === 'sourceApiKey') {
            if (!value) {
                error = 'API Token Cannot be empty';
            } else if (!validateApiKey(value)) {
                error = 'Invalid API Token provided';
            }
        }

        setErrorMessage(error);
    };


    const validateUrl = (url: string): boolean => {
        const urlRegex = /^(https?:\/\/)(?!.*\s)(?!.*[!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\]{2,})[^\s]+$/;
        return urlRegex.test(url);
    };

    const validateApiKey = (apiKey: string): boolean => {
        const apiKeyRegex = /^[A-Za-z0-9-_]+$/;
        return apiKeyRegex.test(apiKey);
    };

    const handleFieldBlur = (fieldName: string) => {
        if (fieldName === 'sourceUrl' && !sourceConnection.sourceUrl) {
            setErrorMessage('URL Cannot be empty');
        } else if (fieldName === 'sourceUrl' && !validateUrl(sourceConnection.sourceUrl)) {
            setErrorMessage('Invalid URL provided');
        } else if (fieldName === 'sourceApiKey' && !sourceConnection.sourceApiKey) {
            setErrorMessage('API Token Cannot be empty');
        } else if (fieldName === 'sourceApiKey' && !validateApiKey(sourceConnection.sourceApiKey)) {
            setErrorMessage('Invalid API Token provided');
        } else {
            setErrorMessage(''); // Clear error message if all validations pass
        }
    };

    const handleConnect = async () => {
        try {
            setIsLoading(true)
            const encryptedApiKey = await encryptHybridMessage(sourceConnection.sourceApiKey);
            // Create a new object with the encrypted API key
            const connectionData = {
                ...sourceConnection,
                sourceApiKey: encryptedApiKey
            };

            const response = await API.getSourceConnection(connectionData);
            if (response.status_code == 200) {
                setIsLoading(false)
                setIsReadOnly(true);
                setShowToast(true)
                setIsSuccessPopup(true);
                setIsButtonClickable(false);
                setIsSourceConnected(true)
                navigate('/target')
                setTimeout(() => {
                    setShowToast(false);
                }, 3000);
            }
        } catch (error) {
            setIsLoading(false)
            setErrorMessage('Connection Failed');
            console.error('Connection Error', error);
        }
    };

    const handleDisconnect = async () => {
        const payload = {
            connectionId: sourceConnection.connectionId,
            applicationId: sourceConnection.applicationId
        };
        try {
            const response = await API.deleteSourceConnection(payload);

            // Check if the response status code is 200
            if (response.status_code === 200) {
                setSourceConnection({ sourceUrl: '', sourceApiKey: '', sourceValue: '', organizationId: 2, applicationId: null, connectionId: sourceConnection.connectionId });
                setIsReadOnly(false);
                setErrorMessage('');
                setShowModal(false)
                setIsSuccessPopup(false)
                setIsButtonClickable(true)
                setIsSourceConnected(false)
            } else {
                setErrorMessage('Disconnection failed');
            }
        } catch (error) {
            console.error('Disconnection Error', error);
            setErrorMessage('An error occurred while disconnecting.');
        }
    };

    const handleCancelInput = () => {
        setSourceConnection(prevState => ({
            ...prevState,
            sourceUrl: '',
            sourceApiKey: '',
            sourceValue: ''
        }));
    };

    const navigateToTarget = () => {
        navigate('/target');
    };

    const navigateToTask = () => {
        navigate('/task')
    }

    const getInstructionText = () => {
        if (sourceConnection.sourceValue === 'Freshdesk') {
            return "To obtain the API token, users must navigate to the Freshdesk application. Once there, go to your profile and locate the option to view the API key.";
        } else if (sourceConnection.sourceValue === 'Manage Engine') {
            return "To generate a Technician Key in ManageEngine, log in, click your username, select \"API Generation\", choose \"Never Expires\" in the popup, and click \"Generate\"."
        }
        return '';
    };

    return (
        <>
            {isLoading && <Loader />}
            <div className="container-fluid ">
                <div className="row migrate-bg justify-content-center">
                    <Header />
                    <div className="col-md-11 mt-4">
                        <p className="font-15 font-semibold text-color d-flex align-items-center">
                            <img src="images/back-arrow.svg" alt="back-arrow" className="me-2" />
                            Back
                        </p>
                        <div className="row justify-content-center">
                            <div className="col-md-12 col-lg-10 col-xl-7 col-sm-12">
                                <StipLineConnection />
                                <div className="source-connection">
                                    <p className="font-18 font-semibold text-black">Data Sources</p>
                                    <div className="d-flex gap-2">
                                        <div className="col-auto">
                                            <label className="card-radio w-100">
                                                <input
                                                    type="radio"
                                                    name="sourceValue"
                                                    value="Freshdesk"
                                                    className="d-none"
                                                    checked={sourceConnection.sourceValue === 'Freshdesk'}
                                                    onChange={handleRadioSelection}
                                                />
                                                <div className="card migrate-container h-100">
                                                    <div className="card-body">
                                                        <div className="d-flex align-items-center">
                                                            <div className="radio-circle me-3" />
                                                            <img
                                                                src="images/freshdesk-logo-short.svg"
                                                                alt="FreshDesk"
                                                                className="me-1"
                                                            />
                                                            <p className="font-14 font-medium text-black mb-0">
                                                                FreshDesk
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
                                                    name="sourceValue"
                                                    className="d-none"
                                                    value="Manage Engine"
                                                    checked={sourceConnection.sourceValue === 'Manage Engine'}
                                                    onChange={handleRadioSelection}
                                                />
                                                <div className="card migrate-container h-100">
                                                    <div className="card-body">
                                                        <div className="d-flex align-items-center">
                                                            <div className="radio-circle me-3" />
                                                            <img
                                                                src="images/manage-engine-logo.svg"
                                                                alt="Manage Engine"
                                                                className="me-1"
                                                            />
                                                            <p className="font-14 font-medium text-black mb-0">
                                                                Manage Engine
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    {sourceConnection.sourceValue && (
                                        <>
                                            <div className="migrate-container px-4 py-4 mt-3">
                                                <p className="font-13 font-medium text-black">
                                                    {getInstructionText()}
                                                </p>
                                            </div>
                                            <div className="migrate-container px-4 py-4 mt-3">
                                                <div className="row">
                                                    <div className="col-md-12 col-lg-6 mb-3">
                                                        <label
                                                            className="font-semibold font-14 text-black mb-2"
                                                            htmlFor="url"
                                                        >
                                                            URL <span className="warning-color">*</span>
                                                        </label>
                                                        <div className="input-group">
                                                            <span className="input-group-text p-0 bg-transparent migrate-form-ui">
                                                                <span className="migrate-input-grp border-0">
                                                                    <img
                                                                        src="images/link-icon.svg"
                                                                        alt="link-icon"
                                                                        className="mb-1"
                                                                    />
                                                                </span>
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className="form-control border-start-0 migrate-form-ui"
                                                                placeholder="Enter your site URL"
                                                                name="sourceUrl"
                                                                id="url"
                                                                value={sourceConnection.sourceUrl}
                                                                onChange={handleInputChange}
                                                                onBlur={() => handleFieldBlur('sourceUrl')}
                                                                readOnly={isReadOnly}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 col-lg-6 mb-3">
                                                        <label
                                                            className="font-semibold font-14 text-black mb-2"
                                                            htmlFor="api-token"
                                                        >
                                                            {sourceConnection.sourceValue === 'Manage Engine' ? 'Technician Key' : 'API Token'}
                                                            <span className="warning-color">*</span>
                                                        </label>
                                                        <input
                                                            type="password"
                                                            className="form-control migrate-form-ui"
                                                            placeholder={sourceConnection.sourceValue === 'Manage Engine' ? 'Enter Technician Key' : 'Enter API Token'}
                                                            id="api-token"
                                                            name="sourceApiKey"
                                                            maxLength={50}
                                                            value={sourceConnection.sourceApiKey}
                                                            onChange={handleInputChange}
                                                            onBlur={() => handleFieldBlur('sourceApiKey')}
                                                            readOnly={isReadOnly}
                                                        />

                                                    </div>
                                                    <div>
                                                        {errorMessage && <p style={{ color: 'red', float: 'right' }}>{errorMessage}</p>}
                                                    </div>
                                                </div>
                                                <div className="col-md-12 d-flex justify-content-end mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn secondary-btn me-3"
                                                        disabled={isSuccessPopup}
                                                        onClick={handleCancelInput}>
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`btn primary-btn gap-2 d-flex align-items-center ${isSuccessPopup ? 'btn-success' : ''}`}
                                                        onClick={isButtonClickable ? handleConnect : undefined} // Disable click event if not clickable
                                                        disabled={!sourceConnection.sourceUrl || !sourceConnection.sourceApiKey || !validateUrl(sourceConnection.sourceUrl) || !validateApiKey(sourceConnection.sourceApiKey) || !isButtonClickable}

                                                    >
                                                        <img src="images/connect-icon.svg" alt="Connect Icon" className={isSuccessPopup ? 'd-none' : ''} />
                                                        <img src="images/connected-icon.svg" alt="Connected Icon" className={isSuccessPopup ? '' : 'd-none'} />
                                                        <span>{isSuccessPopup ? 'Connected' : 'Connect'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {/* stepper ends here */}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 col-lg-11 col-sm-12 col-xl-10">
                        <div className=" wizard-footer-border d-flex justify-content-between mt-5">
                            <div className="mt-3">
                                <button className="outline-primary-button me-3 font-14" onClick={navigateToTask} >
                                    <span className="me-2">
                                        <img src="images/previous-arrow-footer.svg" alt="Previous" />
                                    </span>
                                    Previous
                                </button>
                            </div>
                            <div className="mt-3">
                                <button className={`btn primary-btn gap-2 d-flex align-items-center `} onClick={navigateToTarget} disabled={!isSuccessPopup}>
                                    Next
                                    <span>
                                        <img className="ms-2" src="images/next-footer-icon.svg" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Grid Section Ends */}
                </div>


                {showModal && (
                    <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.6)" }} tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden={!showModal}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header custom-modal-header">
                                    <h1 className="modal-title font-16 font-semibold" id="exampleModalLabel">Disconnect Freshdesk?</h1>
                                    <button type="button" className="btn-close close-btn-custom" onClick={() => setShowModal(false)} aria-label="Close"></button>
                                </div>
                                <div className="modal-body font-14 font-grey">
                                    Do you want to connect a new source? This will disconnect the currently connected source.
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn outline-button" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="button" className="btn primary-btn" onClick={handleDisconnect}>Disconnect</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showToast && (
                    <div className="position-absolute toast-message font-14 font-semibold py-0">
                        <p className="mb-0 mt-1">{sourceConnection.sourceValue} Connected Successfully!<img className="popper-styles" src="images/Confetti.gif" alt="Popper" /></p>
                    </div>
                )}
            </div>
        </>
    )
}

export default SourceConnector
