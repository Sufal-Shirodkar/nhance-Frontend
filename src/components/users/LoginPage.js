import { useContext, useState } from "react"
import { Container,Card,Button,Form} from "react-bootstrap"
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import { UserContext } from "../../createContext/userContext"

export default function Login(){
    const [mobile,setMobile] = useState('')
    const [password,setPassword] = useState('')
    const [formErrors,setFormErrors] = useState({})
    const [serverErrors,setServerErrors] = useState([])
    const {data,dispatch} = useContext(UserContext)
    const errors ={}
    const navigate = useNavigate()
    const validateErrors =()=>{
        if(mobile.length !== 10){
            errors.mobile = 'mobile number should be 10 digits'

        }else if(password.length === 0){
            errors.password = 'password is required'
        }
        
    }
    const handleSubmit=async(e)=>{
        e.preventDefault()
        validateErrors()
        if(Object.keys(errors).length === 0){
            const form ={
                mobile,
                password
            }
            try{
            const response = await axios.post('http://localhost:3330/api/users/login',form)
                    console.log(response.data)
                    dispatch({type:'ADD_USER',payload:response.data.user})
                    dispatch({type:"LOGIN"})
                    setFormErrors({})
                    localStorage.setItem('token',response.data.token)
                    alert('successfully logged in ')
                    navigate('/chatbot')
            }catch(err){
                console.log(err)
                setServerErrors(err.response.data.errors || [].concat(err.response.data.error))
            }
        }else{
            setFormErrors(errors)
        }
    
    }
    
    return (
        <div>
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title>Login Page</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            {
                                serverErrors.map((ele,i)=>{
                                    return <p key={i} style={{color:'red'}}>{ele.msg || ele}</p>
                                }) 
                            }
                        <input type="number" value={mobile} onChange={e =>{setMobile(e.target.value)}} placeholder="enter mobile"/>
                         {Object.keys(formErrors).length > 0 && <span style={{color:'red'}}>{formErrors.mobile}</span>}<br/>
                        <input type="password" value={password} onChange={e =>{setPassword(e.target.value)}} placeholder="enter password"/>
                        {Object.keys(formErrors).length >0 && <span style={{color:'red'}}>{formErrors.password}</span>} <br/>
                       <Button type="submit" >Submit</Button>
                        </Form>
                        
                    </Card.Body>
                </Card>
                <span onClick={()=>{navigate('/register')}}>If not Registered,click to Register</span>
            </Container>
        </div>
    )
}