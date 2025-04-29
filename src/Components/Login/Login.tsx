import React, { useEffect, useState } from 'react';
import { PublicClientApplication, Configuration, AccountInfo } from '@azure/msal-browser';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import forge from 'node-forge';
import { getloginDetails } from '../../Service/LoginService';
import { LoginRequest } from '../../Common/Interface';
import AlertPopup from '../PopUps/Alert';
import { ALERT_MESSAGES, ALERT_TITLES } from '../../Common/Constant';
import Loader from '../PopUps/Loader';

const clientID = process.env.REACT_APP_MSAL_CLIENT_ID || "";
const authorityURL = process.env.REACT_APP_AUTHORITY_URL || "";
const redirectURL = process.env.REACT_APP_REDIRECT_URL || "";
const encryptionKey = process.env.REACT_APP_ENCRYPTION_PUBLIC_KEY || "";


// Define your MSAL configuration
const msalConfig: Configuration = {
    auth: {
        clientId: clientID,
        authority: authorityURL,
        redirectUri: redirectURL,
    },
};



const decodeBase64 = (encodedString: string): string => {
    try {
        const decodedString = atob(encodedString);
        return decodedString;
    } catch (error) {
        console.error("Failed to decode base64 string:", error);
        throw new Error("Invalid base64 string");
    }
};

export const encryptHybridMessage = async (message: string): Promise<string> => {
    try {
        const publicKeyPem: string = process.env.REACT_APP_ENCRYPTION_PUBLIC_KEY as string;
        const decodedString = decodeBase64(publicKeyPem);
        const publicKey = forge.pki.publicKeyFromPem(decodedString);

        const aesKey = forge.random.getBytesSync(32);

        const cipher = forge.cipher.createCipher('AES-GCM', aesKey);
        const iv = forge.random.getBytesSync(12);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(message));
        cipher.finish();
        const encryptedMessage = cipher.output.getBytes();
        const tag = cipher.mode.tag.getBytes();

        const encryptedKey = publicKey.encrypt(aesKey, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf: forge.mgf.mgf1.create(forge.md.sha1.create())
        });

        const payload = {
            iv: forge.util.encode64(iv),
            key: forge.util.encode64(encryptedKey),
            message: forge.util.encode64(encryptedMessage),
            tag: forge.util.encode64(tag)
        };

        const jsonString = JSON.stringify(payload);

        return jsonString;
    } catch (error) {
        throw error;
    }
};

const createSessionToken = async (encryptedEmail: LoginRequest): Promise<string> => {
    try {
        const response = await getloginDetails(encryptedEmail);
        localStorage.setItem('cid_t', response.message);
        return "";
    } catch (error) {
        console.error((error as Error).message);
        throw error;
    }
};

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertTitle, setAlertTitle] = useState<string | null>(null);
    let [loading, setLoading] = useState<boolean>(false);

    const handleLogin = async () => {
        setLoading(true);
        setTimeout(async () => {
        try {
            // Initialize the PublicClientApplication
            const msalInstance = new PublicClientApplication(msalConfig);
            await msalInstance.initialize();
            const loginResponse = await msalInstance.loginPopup({
                scopes: ['user.read'],
            });
            loading = true
          

            const account: AccountInfo = loginResponse.account!;
            const email = account.username;

            const encryptedEmail = await encryptHybridMessage(email);
            const createSessionPayload = {
                email: encryptedEmail,
                isAdmin: false
            };

            let sessionCreation: string = await createSessionToken(createSessionPayload);
          
                navigate('/task');
      
        

        } catch (error) {
            if((error as Error).message.includes("popup_window_error")){
                setAlertTitle(ALERT_TITLES.POPUP_BLOCKED);
                setShowAlert(true);
                setErrorMessage(ALERT_MESSAGES.POPUP_BLOCKED);
            }
            else if ((error as Error).message.includes("Unauthorized")){
                setAlertTitle(ALERT_TITLES.INVALID_USER);
                setShowAlert(true);
                setErrorMessage(ALERT_MESSAGES.INVALID_USER);
            }
            else if ((error as Error).message.includes("user_cancelled")){
            }
            else{
                setAlertTitle(ALERT_TITLES.UNHANDLED_EXCEPTIONS);
                setShowAlert(true);
                setErrorMessage(ALERT_MESSAGES.UNHANDLED_EXCEPTIONS);
            }
        }
        finally {
            setLoading(false); // Hide loader
        }
    }, 0); //
    };

    const handleCloseAlert = () => {
        setShowAlert(false);
        setErrorMessage(null);
    };

    return (
        <>
            {loading && <Loader />}
            <div className="container-fluid">
                <div className="row vh-100 align-items-center justify-content-center login-bg position-relative">
                    <img src="images/migrate-logo.svg" alt="migrate-app-logo" className="login-logo" />
                    <div className="col-xl-6 col-xxl-3 col-lg-5 col-md-8">
                        <div className="login-container bg-white text-center px-5 py-5">
                            <div>
                                <img src="images/sign-in-icon.svg" alt="USClaims logo" />
                                <p className="font-20 font-bold text-black">Sign in with Microsoft</p>
                                <p className="font-14 font-medium text-color">
                                    Effortlessly migrate all your tickets and KB's using ServiceDesk Migration application
                                </p>
                            </div>
                            <div className="d-flex justify-content-center flex-column gap-3 align-items-center mt-5">
                                <button
                                    className="w-100 d-flex align-items-center justify-content-center font-semibold font-14 gap-2 primary-btn-login px-3 "
                                    type="button"
                                    onClick={handleLogin}
                                >
                                    <img src="images/microsoft-logo.svg" alt="Microsoft logo" />
                                    <span>Login with Microsoft</span>
                                </button>
                            </div>
                            {/* {errorMessage && <div className="error-message">{errorMessage}</div>} */}
                        </div>
                    </div>
                </div>
                {showAlert && errorMessage && alertTitle && (
                    <AlertPopup
                        title={alertTitle}
                        message={errorMessage}
                        onClose={handleCloseAlert}
                    />
                )}
            </div>
        </>
    );
};

export default Login;