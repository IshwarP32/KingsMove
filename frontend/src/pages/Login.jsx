import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext.jsx';
import { toast } from 'react-toastify';

const Login = () => {
    const {backendurl,getUserInfo,userInfo,loading,navigate}=  useContext(UserContext)
    
    const [isLogin,setIsLogin] = useState(true); //form status
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState();
    const [username, setUsername] = useState();
    const [fullName, setFullName] = useState();
    
    useEffect(()=>{
        if(userInfo && !loading) navigate("/")
    },[userInfo])

    const login = async ()=>{
        try {
            const {data} = await axios.post(`${backendurl}/api/user/login`,{accessfield:email,password},{ withCredentials: true });
            // console.log(data);
            if(data.success){
                getUserInfo();
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const createAccount = async ()=>{
        try {
            const {data} = await axios.post(backendurl+"/api/user/create",{username,email,fullName,password});
            if(data.success){
                toast.success("New User Registered")
                login();
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

  return (
    <div
      className="flex items-center justify-center w-screen h-screen"
    >
      <div className="bg-blue-900/90 text-white px-10 py-8 rounded-3xl shadow-2xl w-fit max-w-md">
        <h1 className="text-4xl font-bold text-center mb-6">{isLogin? "Welcome Back":"Create Account"}</h1>

        <form className="flex flex-col gap-4" onSubmit={(e)=>{e.preventDefault();isLogin? login(): createAccount()}}>
          <input
            id='email'
            type="text"
            placeholder={isLogin?"Email or Username":"Email"}
            onChange={(e)=>{setEmail(e.target.value)}}
            className="rounded-md px-4 py-2 bg-white/10 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          {(!isLogin)&& 
          <>
            <input
            id='username'
            onChange={(e)=>{setUsername(e.target.value)}}
            type="text"
            placeholder="Username"
            className="rounded-md px-4 py-2 bg-white/10 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          <input
          id='fullname'
            onChange={(e)=>{setFullName(e.target.value)}}
            type="text"
            placeholder="Fullname"
            className="rounded-md px-4 py-2 bg-white/10 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          </>
          }
          <input
          id='password'
            type="password"
            onChange={(e)=>{setPassword(e.target.value)}}
            placeholder="Password"
            className="rounded-md px-4 py-2 bg-white/10 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
          id='submit'
            type="submit"
            className="mt-4 bg-white text-blue-900 font-bold py-2 rounded-md hover:bg-blue-100 transition"
          >
            {isLogin?"Login":"Create"}
          </button>
        </form>

        <p className="mt-6 text-left text-sm">
          {isLogin? "New here? ":"Already Have Account? "}
          <a onClick={()=>{setIsLogin(!isLogin)}} className="underline hover:text-blue-200 transition">
            {isLogin? "Create Account":"Login here"}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
