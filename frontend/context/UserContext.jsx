    import React, { useEffect, useState } from "react";
    import { createContext } from "react";
    import { toast } from "react-toastify";
    import axios from "axios";
    import { useNavigate } from "react-router-dom";

    export const UserContext = createContext();

    const UserContextProvider = (props)=>{
        // const [userInfo,setUserInfo] = useState(undefined);
    const backendurl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');
        const navigate = useNavigate();
        const [userInfo,setUserInfo] = useState(undefined);
        const [loading,setLoading]= useState(true);
        
        useEffect(()=>{
            getUserInfo();
        },[])

        const getUserInfo = async ()=>{
            try {
                const {data} = await axios.post(backendurl+"/api/user/info",{},{withCredentials:true});
                if(data.success){
                    setUserInfo(data.content);
                }else{
                    setUserInfo(null);
                }
            } catch (error) {
                console.log(error);
            } finally{
                setLoading(false);
            }
        }
        const logout = async ()=>{
            try {
                const {data} = await axios.post(backendurl+"/api/user/logout",{},{withCredentials:true});
                if(data.success){
                    toast.success("Logged Out Successfully");
                    setUserInfo(undefined);
                }
                else{
                    toast.error(data.message);
                }
            } catch (error) {
                console.log(error)
            }
          }

        
        const value = {userInfo, setUserInfo,backendurl,getUserInfo,loading,navigate,logout};
        return<UserContext.Provider value={value}>
            {props.children}
        </UserContext.Provider>
    }

    export default UserContextProvider;