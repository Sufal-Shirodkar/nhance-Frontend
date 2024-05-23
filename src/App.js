import RegisterPage from "./components/users/RegisterPage"
import Login from "./components/users/LoginPage";
import { useEffect } from "react";
import { Navbar} from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import { Route,Routes } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";
import axios from "axios";
import Home from "./components/Home";
import ChatBot from "./components/ChatBot";
import SingleChat from "./components/SingleChat";
import {useReducer} from 'react'
import { UserContext } from "./createContext/userContext";
function reducer(state,action){
  switch(action.type){
    case 'ADD_USER':{
      return {...state,user:action.payload}
    }
    case 'LOGIN':{
      return {...state,setlogin:true}
    }
    default:{
      return {...state}
    }
  }
}

function App() {
  const [data,dispatch] = useReducer(reducer,{})
  const navigate = useNavigate()
  console.log(data)
  useEffect(()=>{
    if(localStorage.getItem('token')){
      (async()=>{
        try{
          const response = await axios.get('http://localhost:3330/api/users/account',{
            headers:{Authorization:localStorage.getItem("token")
            }
          })
          dispatch({type:"LOGIN"})
          dispatch({type:"ADD_USER",payload:response.data.user})
        }catch(err){console.log(err)}
       

      })();
      
    }
  },[])

  const token = localStorage.getItem("token")
  const spinner = (
    <div className="spinner-style">
        <RotatingLines
            visible={true}
            height="96"
            width="96"
            strokeColor="blue"
            strokeWidth="5"
            animationDuration="0.75"
            ariaLabel="rotating-lines-loading"
            wrapperStyle={{}}
            wrapperClass=""
        />
    </div>
    );
    console.log(data.user,"user")
  return (
  <div>
  {
    !data.user && token ? (
        <div className="parent-container">
            {spinner}{" "}
        </div>
      ) :  <div>
      <Navbar >
        <span style={{margin:"10px",padding:"10px"}}  onClick={()=>{navigate('/')} }>Home</span>
        <span style={{margin:"10px",padding:"10px",display:"flex",justifyContent:"flex-end"}} onClick={()=>{navigate('/register')}}>SignUp/Login</span>

        {/* <span style={{margin:"10px",padding:"10px", display:"flex",textAlign:"flex-end"}}  onClick={()=>{navigate('/register')}}>SignUp/Login</span> */}
      </Navbar>
      <UserContext.Provider value={{data,dispatch}}>
    <Routes>
    <Route path="/" element={<Home />}/>
    <Route path="/register" element={<RegisterPage />}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/chatbot" element={<ChatBot />}/>
      <Route path="/userChat/:id" element={<SingleChat />} />
     
    </Routes>
    </UserContext.Provider>
    
    </div>
    }
   
    </div>
  );
}

export default App;
