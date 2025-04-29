import React, { useState, useEffect } from 'react';
import { API } from '../../Service/ConnectorService';
import { useLocation, useNavigate } from 'react-router-dom';
import { encryptHybridMessage } from '../../Common/Encryption';
import { IApplication, ITargetConnection } from '../../Interface/ConnectorInterface.js';
import Loader from '../PopUps/Loader';
import Header from '../Header/Header';
import StripLineConnection from '../WizardStatus/StipLineConnection';

const TargetConnector = () => {

    const taskId = sessionStorage.getItem("taskId");



    const navigate = useNavigate();
    const [targetConnection, setTargetConnection] = useState<ITargetConnection>({
        targetValue: '',
        targetUrl: '',
        targetApiKey: '',
        targetUserName: '',
        applicationId: null,
        connectionId: null,
        organizationId: 2
    });

    const [showPopupMessage, setShowPopupMessage] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isButtonClickable, setIsButtonClickable] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [applications, setApplications] = useState<IApplication[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
    const [isTargetConnected, setIsTargetConnected] = useState<boolean>(false)

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

        const getTargetConnection = async () => {
            const payload = { task_id: taskId }; // Use appropriate task_id for target connection
            try {
                setIsLoading(true);
                const response = await API.getAllApplication(payload);
                setApplications(response.applications);

                if (response.connector_details) {
                    // Set target connection details immediately after receiving a successful response

                    setTargetConnection(prevState => ({
                        ...prevState,
                        connectionId: parseInt(response.connector_details.ConnectionID, 10),
                        applicationId: parseInt(response.connector_details.TargetApplicationID), // Convert to integer
                    }));
                    setTargetConnection(prevState => ({
                        ...prevState,
                        targetUrl: response.connector_details.TargetTenantURL || prevState.targetUrl,
                        targetApiKey: response.connector_details.TargetClientSecret || prevState.targetApiKey,
                        targetUserName: response.connector_details.TargetUserEmailID || prevState.targetUserName,
                        targetValue: response.connector_details.TargetApplicationID === "3" ? "Jira" : "",
                    }));

                    // Check if the connection is established
                    if (response.connector_details.TargetTenantURL && response.connector_details.TargetClientSecret) {
                        setShowPopupMessage(true);
                        setIsButtonClickable(false);
                        setIsReadOnly(true);
                        setTimeout(() => {
                            setShowPopupMessage(false);
                        }, 3000);
                    }
                }
            } catch (error) {
                console.error('Error fetching applications', error);
            } finally {
                setIsLoading(false); // Ensure loading state is reset in both success and error cases
            }
        };

        getTargetConnection();
    }, []);


    const handleRadioSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        // Find the selected application based on value, converting value to lowercase
        const selectedApplication = applications?.find((app: any) => app.application_name === value);

        if (showPopupMessage) {
            setShowModal(true); // Show modal if popup message is true
        } else {
            setTargetConnection(prevState => ({
                ...prevState,
                targetValue: value,
                applicationId: selectedApplication?.application_id || null, // Set applicationID from selected application
            }));
        }
        setErrorMessage('')
    };

    const MAX_API_KEY_LENGTH = 250;

    const handleUserInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        // Check if the input is 'sourceApiKey' and its length exceeds the maximum allowed length
        if (name === 'targetApiKey' && value.length > MAX_API_KEY_LENGTH) {
            event.target.value = value.substring(0, MAX_API_KEY_LENGTH); // Prevent the state update
        }

        // Update state dynamically based on input name
        setTargetConnection(prevState => ({
            ...prevState,
            [name]: value,
        }));

        // Perform validation based on the input field being updated
        let error = '';

        if (name === 'targetUrl') {
            if (!value) {
                error = 'URL Cannot be empty';
            } else if (!validateUrl(value)) {
                error = 'Invalid URL provided';
            }
        } else if (name === 'targetApiKey') {
            if (!value) {
                error = 'API Token Cannot be empty';
            } else if (!validateApiKey(value)) {
                error = 'Invalid API Token provided';
            }
        } else if (name === 'targetUserName') {
            if (!value) {
                error = 'Mail Address cannot be empty';
            } else if (!validateUsername(value)) {
                error = 'Mail Address is in invalid format'; // Assuming you have a validateUsername function
            }
        }

        setErrorMessage(error);
    };


    const validateUrl = (url: string): boolean => {
        const urlRegex = /^(https?:\/\/)(?!.*\s)(?!.*[!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\]{2,})[^\s]+$/;
        return urlRegex.test(url);
    };

    const validateApiKey = (apiKey: string): boolean => {
        const apiKeyRegex = /^[A-Za-z0-9-_]+(=[A-Za-z0-9]+)?$/;
        return apiKeyRegex.test(apiKey);
    };

    const validateUsername = (username: string): boolean => {
        const emailRegex = /^(?!.*\.\.)(?!.*\.$)(?!.*@.*@)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9-]+)(?=.{1,320}$)/;
    
        // Check if the username (email) is empty
        if (!username.trim()) {
            return false; 
        }
    
        // Validate the username (email) with regex
        if (!emailRegex.test(username)) {
            return false; // Invalid format
        }
        return true; // Valid email
    };

    const handleFieldBlur = (fieldName: string) => {
        if (fieldName === 'targetUrl' && !targetConnection.targetUrl) {
            setErrorMessage('URL Cannot be empty');
        } else if (fieldName === 'targetUrl' && !validateUrl(targetConnection.targetUrl)) {
            setErrorMessage('Invalid URL provided');
        } else if (fieldName === 'targetApiKey' && !targetConnection.targetApiKey) {
            setErrorMessage('API Token Cannot be empty');
        } else if (fieldName === 'targetApiKey' && !validateApiKey(targetConnection.targetApiKey)) {
            setErrorMessage('Invalid API Token provided');
        } else if (fieldName === 'targetUserName' && !targetConnection.targetUserName) {
            setErrorMessage('Mail Address cannot be empty');
        } else if (fieldName === 'targetUserName' && !validateUsername(targetConnection.targetUserName)) {
            setErrorMessage('Mail Address is in invalid format');
        } else {
            setErrorMessage(''); // Clear error message if all validations pass
        }
    };
    const handleConnectClick = async () => {
        setIsLoading(true)

        // Encrypt the API key if needed
        const encryptedApiKey = await encryptHybridMessage(targetConnection.targetApiKey);

        // Create a new object with the encrypted API key and other necessary fields
        const payload = {
            targetValue: targetConnection.targetValue, // Ensure this value is being captured correctly
            connectionId: targetConnection.connectionId, // Ensure this is set correctly as well
            targetUserName: targetConnection.targetUserName,
            targetApiKey: encryptedApiKey, // Use the encrypted API key
            targetUrl: targetConnection.targetUrl,
            applicationId: targetConnection.applicationId
        };

        try {
            const response = await API.getTargetConnection(payload);
            if (response.status_code === 200) {
                setIsReadOnly(true)
                setIsLoading(false)
                setErrorMessage('')
                setIsTargetConnected(true)
                setShowPopupMessage(true);
                setIsButtonClickable(false);

                navigate('/inventoryScreen')

                setTimeout(() => {
                    setShowPopupMessage(false);
                }, 3000);
            } else {
                setErrorMessage('Connection failed, Invalid Credentials');
                setIsLoading(false)
            }
        } catch (error) {
            setIsLoading(false)
            setErrorMessage('Connection Failed');
        }
    };


    const handleCancelInput = () => {
        setTargetConnection({
            targetValue: '',
            targetUrl: '',
            targetApiKey: '',
            targetUserName: '',
            applicationId: null, // Reset to null or a default value
            connectionId: targetConnection.connectionId,
            organizationId: targetConnection.organizationId
        });
    };

    const handleFooterCancel = () => {
        navigate('/source');
    };

    const handleFooterNext = () => {
        navigate('/inventoryScreen');
    };

    const handleTargetDisconnect = async () => {
        const payload = {
            connectionId: targetConnection.connectionId, // Ensure this is available in your state
            applicationId: targetConnection.applicationId // Ensure this is available in your state
        };

        try {
            const response = await API.deleteSourceConnection(payload); // Call your API for disconnecting

            // Check if the response status code is 200
            if (response.status_code === 200) {
                setTargetConnection({
                    targetValue: '',
                    targetUrl: '',
                    targetApiKey: '',
                    targetUserName: '',
                    applicationId: null, // Reset to null or a default value
                    connectionId: targetConnection.connectionId,
                    organizationId: targetConnection.organizationId
                });
                setIsReadOnly(false)
                setErrorMessage('');
                setShowModal(false);
                setIsTargetConnected(false)
                setIsButtonClickable(true);

            } else {
                setErrorMessage('Disconnection failed'); // Handle failure case
            }
        } catch (error) {
            console.error('Disconnection Error', error);
            setErrorMessage('An error occurred while disconnecting.'); // Handle error case
        }
    };

    const isButtonDisabled = () => {
        return (
            !isButtonClickable ||
            !targetConnection.targetUrl ||
            !validateUrl(targetConnection.targetUrl) ||
            !targetConnection.targetApiKey ||
            !validateApiKey(targetConnection.targetApiKey) ||
            !targetConnection.targetUserName ||
            !validateUsername(targetConnection.targetUserName)
        );
    };


    return (
        <div>
            {isLoading && <Loader />}
            <div className="container-fluid">
                <div className="row migrate-bg justify-content-center">
                    <Header />
                    <div className="col-md-11 mt-4">
                        <p className="font-15 font-semibold text-color d-flex align-items-center">
                            <img src="images/back-arrow.svg" alt="back-arrow" className="me-2" />
                            Back
                        </p>
                        <div className="row justify-content-center">
                            <div className="col-md-12 col-lg-10 col-xl-7 col-sm-12">
                                {/* stepper starts here */}
                                <StripLineConnection />
                                <div className="source-connection">
                                    <p className="font-18 font-semibold text-black">Data Sources</p>
                                    <div className="d-flex gap-2">
                                        <div className="col-auto">
                                            <label className="card-radio w-100">
                                                <input
                                                    type="radio"
                                                    name="targetValue"
                                                    value="Jira"
                                                    className="d-none"
                                                    checked={targetConnection.targetValue === "Jira"}
                                                    onChange={handleRadioSelection}

                                                />
                                                <div className="card migrate-container h-100">
                                                    <div className="card-body">
                                                        <div className="d-flex align-items-center">
                                                            <div className="radio-circle me-3" />
                                                            <img
                                                                src="images/atlassian-logo.svg"
                                                                alt="Atlassian"
                                                                className="me-1"
                                                            />
                                                            <p className="font-14 font-medium text-black mb-0">
                                                                Atlassian
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="migrate-container px-4 py-4 mt-3">
                                        <p className="font-13 font-medium text-black">
                                            To generate an API token for your Atlassian account, log in at (https://id.atlassian.com/manage-profile/security/api-tokens) and click "Create API token".
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
                                                        placeholder="Provide your Atlassian URL"
                                                        id="url"
                                                        name="targetUrl"
                                                        value={targetConnection.targetUrl}
                                                        onChange={handleUserInput}
                                                        onBlur={() => handleFieldBlur('targetUrl')}
                                                        readOnly={isReadOnly}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-12 col-lg-6 mb-3">
                                                <label
                                                    className="font-semibold font-14 text-black mb-2"
                                                    htmlFor="api-token"
                                                >
                                                    API Token <span className="warning-color">*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control migrate-form-ui"
                                                    placeholder="Enter API Token"
                                                    id="api-token"
                                                    name="targetApiKey"
                                                    maxLength={250}
                                                    value={targetConnection.targetApiKey}
                                                    onChange={handleUserInput}
                                                    onBlur={() => handleFieldBlur('targetApiKey')}
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                            <div className="col-md-12 col-lg-6">
                                                <label
                                                    className="font-semibold font-14 text-black mb-2"
                                                    htmlFor="user-mail"
                                                >
                                                    User Mail ID <span className="warning-color">*</span>
                                                </label>
                                                <div className="input-group mb-3">
                                                    <span className="input-group-text p-0 bg-transparent migrate-form-ui">
                                                        <span className="migrate-input-grp border-0">
                                                            <img
                                                                src="images/email-icon.svg"
                                                                alt="link-icon"
                                                                className="mb-1"
                                                            />
                                                        </span>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control border-start-0 migrate-form-ui"
                                                        placeholder="Enter User Mail ID"
                                                        id="user-mail"
                                                        name="targetUserName"
                                                        value={targetConnection.targetUserName}
                                                        onChange={handleUserInput}
                                                        onBlur={() => handleFieldBlur('targetUserName')}
                                                        readOnly={isReadOnly}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            {errorMessage && <p style={{ color: 'red', float: 'right' }}>{errorMessage}</p>}
                                        </div>
                                        <div className="col-md-12 d-flex justify-content-end mt-4">
                                            <button
                                                type="button"
                                                className="btn secondary-btn me-3"
                                                onClick={handleCancelInput}
                                                disabled={!isButtonClickable}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn primary-btn gap-2 d-flex align-items-center ${!isButtonClickable ? 'btn-success' : ''}`}
                                                onClick={isButtonClickable ? handleConnectClick : undefined} // Disable click event if not clickable
                                                disabled={isButtonDisabled()}
                                            >
                                                <img src="images/connect-icon.svg" alt="Connect Icon" className={showPopupMessage ? 'd-none' : ''} />
                                                <img src="images/connected-icon.svg" alt="Connected Icon" className={showPopupMessage ? '' : 'd-none'} />
                                                <span>{!isButtonClickable ? 'Connected' : 'Connect'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* stepper ends here */}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 col-lg-11 col-sm-12 col-xl-10">
                        <div className=" wizard-footer-border d-flex justify-content-between mt-5">
                            <div className="mt-3">
                                <button className="outline-primary-button me-3 font-14" onClick={handleFooterCancel} >
                                    <span className="me-2">
                                        <img src="images/previous-arrow-footer.svg" alt="Previous" />
                                    </span>
                                    Previous
                                </button>
                            </div>
                            <div className="mt-3">
                                <button className={`btn primary-btn gap-2 d-flex align-items-center `} onClick={handleFooterNext} disabled={isButtonClickable}>
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
            </div>

            {showModal && (
                <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.6)" }} tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden={!showModal}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header custom-modal-header">
                                <h1 className="modal-title font-16 font-semibold" id="exampleModalLabel">Disconnect Atlassian?</h1>
                                <button type="button" className="btn-close close-btn-custom" onClick={() => setShowModal(false)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body font-14 font-grey">
                                Do you want to connect a new target? This will disconnect the currently connected source.
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn outline-button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="button" className="btn primary-btn" onClick={handleTargetDisconnect}>Disconnect</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showPopupMessage && (
                <div className="position-absolute toast-message font-14 font-semibold py-0">
                    <p className="mb-0 mt-1">{targetConnection.targetValue} Connected Successfully!<img className="popper-styles" src="images/Confetti.gif" alt="Popper" /></p>
                </div>
            )}
        </div>
    )
}

export default TargetConnector