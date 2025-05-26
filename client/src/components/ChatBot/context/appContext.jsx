import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true;
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null);

    // Function to check authentication state
    const getAuthState = async () => {
        try {
            const { data } = await axios.get(`http://localhost:8080/api/v1/user/is-auth`, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            if (data.success) {
                setIsLoggedin(true);
                await getUserData();  // Fetch user data after authentication
            } else {
                setIsLoggedin(false);
                setUserData(null);
            }
        } catch (error) {
            console.error("Auth Error:", error.response?.data?.message || error.message);
            
            if (error.response?.status === 401) {
                // Handle unauthorized access (logout user)
                setIsLoggedin(false);
                setUserData(null);
                toast.error("Session expired. Please log in again.");
            }
        }
    };

    // Function to get user data
    const getUserData = async () => {
        try {
            const { data } = await axios.get(`http://localhost:8080/api/v1/user/data`, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            if (data.success) {
                setUserData(data.userData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("User Data Fetch Error:", error.response?.data?.message || error.message);
        }
    };

    useEffect(() => {
        getAuthState();
    }, []);

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
    };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

export default AppContextProvider;