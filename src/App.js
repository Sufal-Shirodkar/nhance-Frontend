import RegisterPage from "./components/users/RegisterPage"
import Login from "./components/users/LoginPage";
import { Navbar} from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import { Route,Routes } from "react-router-dom";
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
  return (
    <div>
      <Navbar>
        <span onClick={()=>{navigate('/')} }>Home | </span>
        <span onClick={()=>{navigate('/register')}}>SignUp/Login</span>
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
  );
}

export default App;
