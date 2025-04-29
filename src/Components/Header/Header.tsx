import React from "react";
import { useNavigate } from "react-router-dom";

function Header() {
    const navigate = useNavigate()
    async function signOut() {
        try {
            localStorage.clear();
            sessionStorage.clear()
            navigate("/");
        } catch (error) {
            let errorData = {
                errorName: error,
                errorServiceName: "FrontEnd Service",
                errorFunctionName: "SignOut function",
                source: "Error-Log",
                errorDescription: "PostErrorData() invoke the error"
            }

        }
    }

    return (
        <div>
            <div className="col-md-11 navheader">
                <nav className="navbar navbar-expand justify-content-center align-items-start mt-4">
                    <div className="collapse navbar-collapse header-border-bottom pb-4">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <a className="nav-link ps-0" aria-current="page" href="#"><img src="images/migrate-logo.svg" alt="logo-style" /></a>
                            </li>
                        </ul>
                        <div className="dropdown">
                            <button className="font-medium text-decoration-none pe-2 font-14 text-black profile-btn m-3" data-bs-toggle="dropdown">Hi James
                                <img className="profile-avatar-header ms-2" src="images/Profile-avatar.svg" alt="profile-image" />
                            </button>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="" onClick={() => {
                                    signOut();
                                }}>Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    )
}

export default Header
