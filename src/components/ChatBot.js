import { useEffect,useState,useMemo} from 'react'
import { Container,Form,Col,Button,Row, Card} from 'react-bootstrap'
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import axios from 'axios'
import {io} from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '../createContext/userContext'
export default function Chatbot(){
    const [message,setMessage] = useState('')
    const [recieve,setRecieve] = useState([])
    const [sender,setSender] = useState('')
    const [reciever,setReciever] = useState('')
    const [users,setUsers] = useState([])
    const [allGroups,setAllGroups] = useState([])
    const [groupName,setGroupName] = useState('')
    const[ socketId,setSocketId] = useState('')
    const {data}= useContext(UserContext)
    const [modal, setModal] = useState(false);
    console.log(data)
    const socket = useMemo(()=>io("http://localhost:3330"),[])
    const navigate = useNavigate()
    const toggle = () => setModal(!modal);
    useEffect(()=>{
        (
            async()=>{
                try{
                    const response = await axios.get('http://localhost:3330/api/users',{headers:{
                        Authorization:localStorage.getItem('token')
                    }})
                    const response1 = await axios.get('http://localhost:3330/api/groups',{headers:{
                        Authorization:localStorage.getItem('token')
                    }})
                    console.log(response1.data)
                    setAllGroups(response1.data)
                    console.log(response.data)
                    setUsers(response.data)
                }catch(err){console.log(err)}
            }
        )();
        socket.on('connect',()=>{
            socket.emit('join', { roomId: data.user._id});
        })
        socket.on('welcome', (data) => {
            console.log(data, 'data');
        });
        socket.on('recieve_message',(data)=>{
            console.log(data)
            if ((sender == data.message.username && reciever == data.message.reciever) || (sender == data.message.reciever && reciever == data.message.username)) {
                setRecieve((previousState) => [...previousState, data.message]);
            }
           
        })
        
        // return ()=>{
        //     socket.disconnect()
        // }
    },[])
  
   const handleReciever=(id,name)=>{
    setSocketId(id)
    setReciever(name)
   }
    const handleUser=(e)=>{
        e.preventDefault()
        const username = data.user.name
        setSender(data.user.name)
        const room = socketId
        
        socket.emit('message1',{username,reciever,room,message})
        setRecieve((previousState)=>[...previousState,{username:username,reciever:reciever,message:message}])
        setMessage('')
        // navigate(`/userChat/${id}`)
    }
    const handleModal=()=>{
        toggle()
    }
    const handleJoin=async(e,user,id)=>{
        console.log(user,id)
        const form = {user:user}
        try{
            const response = await axios.put(`http://localhost:3330/api/groups/${id}`,form,{
                headers:{Authorization:localStorage.getItem("token")}
            })
        console.log(response.data)

        }catch(err){console.log(err)}
        

    }
    
    const handleGroup=async(e)=>{
        e.preventDefault()
        const form ={
            name: groupName,
            members:[].concat(data.user._id)
        }
        setGroupName('')
       
        try{
            const response = await axios.post('http://127.0.0.1:3330/api/groups',form,{
                headers:{
                    Authorization:localStorage.getItem('token')
                }
            })
            console.log(response)
        }catch(err){
            console.log(err)
        }

    }

    return <div>
        <h2>Welcome to chatting application</h2>
        <Container>
        <Button onClick={handleModal} style={{margin:"10px"}}>Add a Group</Button>
            <Row>
            <Col className="col-md-2">

                {users.map((ele,i) =>{
                    return<div key={i}><Card style={{width:"50%", height:"50px",textAlign:"center",margin:"10px"}} onClick={(e)=>{handleReciever(ele._id,ele.name)}}>{ele.name}</Card></div>
                })}

                 {allGroups.map((ele,i) =>{
                    return <div key={i}>
                        <Card style={{width:"50%", height:"50px",textAlign:"center",margin:"10px"}}>{`group ${ele.name}`}
                        {
                            !ele.members.includes(data?.user?._id) &&  <Button onClick={(e)=>{handleJoin(e,data.user,ele._id)}}>Join</Button>
                        }
                        </Card>
                       
                        
                        </div>
                })}
            </Col>
            <Col className="col-md-10" style={{border:"0.5px solid grey" ,borderRadius:"8px"}}>
            {
            recieve.map((ele,i) =>{
                return <p key={i} style={{background:"grey",borderRadius:"8px",margin:"10px",padding:"10px"}}>{`${ele.username}:${ele.message}`}</p>
            })

           }
            <Form onSubmit={handleUser}>
            <Form.Group as={Row} controlId="formDescription">
            <Form.Label column sm={2}>
             message
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                as="textarea"
                value={message}
                placeholder="message"
                onChange={(e) => setMessage(e.target.value)}
              />
            </Col>
          </Form.Group>
          <Button variant="primary" type="submit">
            Send
          </Button>
            </Form>
            </Col>
            </Row>
   
        </Container>
        <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Add a Group</ModalHeader>
        <ModalBody> 
            <form onSubmit={e =>{handleGroup(e)}}>
                <label>Group Name</label>
            <input type="text"
            className='form-control'
                    value={groupName}
                    onChange={e =>{setGroupName(e.target.value)}}/>
            <Button type="submit">Submit</Button>
            </form>
           
            
         </ModalBody>
        <ModalFooter>
         
        </ModalFooter>
      </Modal>
    </div>
}