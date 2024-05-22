import { useState } from "react"
import { Container,Card,Button,Form} from "react-bootstrap"
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
export default function Register(){
    const [name,setName] = useState('')
    const [mobile,setMobile] = useState('')
    const [password,setPassword] = useState('')
    const [formErrors,setFormErrors] = useState({})
    const [serverErrors,setServerErrors] = useState([])
    const navigate = useNavigate()
    const errors = {}
    const validateErrors =()=>{
        if(name.trim().length === 0){
            errors.name = 'name is required'
        }else if(mobile.length=== 0 || mobile.length !== 10){
            errors.mobile = 'mobile number should be 10 digits'
        }else if(password.length === 0){
            errors.password ='password is required'
        }
    }
    const handleSubmit =async(e)=>{
        e.preventDefault()
        validateErrors()
        if(Object.keys(errors).length === 0){
            const form={
                name,
                mobile,
                password
               } 
               try{
                const response = await axios.post('http://localhost:3330/api/users/register',form)
                console.log(response?.data)
                setFormErrors({})
                setServerErrors({})
                alert('successfully registered')
                navigate('/login')
               }catch(err){
                console.log(err)
                setFormErrors({})
                setServerErrors(err?.response?.data?.errors)
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
                        <Card.Title>Register Page</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            {
                                serverErrors.map((ele,i)=>{
                                    return <>
                                    <span style={{color:'red'}} key={i}>{ele?.msg}</span><br/>
                                    </>
                                })
                            }
                        <input type="text" value={name} onChange={e =>{setName(e.target.value)}} placeholder="enter name"/>
                        {Object.keys(formErrors).length >0 && <span style={{color:'red'}}>{formErrors.name}</span>}<br/>
                        <input type="number" value={mobile} onChange={e =>{setMobile(e.target.value)}} placeholder="enter mobile"/>
                        {Object.keys(formErrors).length >0 && <span style={{color:'red'}}>{formErrors.mobile}</span>}<br/>
                        <input type="password" value={password} onChange={e =>{setPassword(e.target.value)}} placeholder="enter password"/>
                        {Object.keys(formErrors).length >0 && <span style={{color:'red'}}>{formErrors.password}</span>}<br/>
                       <Button type="submit" >Submit</Button>
                        </Form>
                        
                    </Card.Body>
                </Card> 
                <span onClick={()=>{navigate('/login')}}>If Already Registered? click to Login</span>
            </Container>
           
        </div>
    )
}