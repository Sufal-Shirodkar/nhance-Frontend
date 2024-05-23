import { useEffect,useState,useMemo} from 'react'
import { Container,Form,Col,Button,Row, Card} from 'react-bootstrap'
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import axios from 'axios'
import {io} from 'socket.io-client'
import { useContext } from 'react'
import { UserContext } from '../createContext/userContext'
export default function Chatbot(){

    const [message,setMessage] = useState('')
    const [recieve,setRecieve] = useState({})
    const [sender,setSender] = useState('')
    const [reciever,setReciever] = useState('')
    const [users,setUsers] = useState([])
    const [allGroups,setAllGroups] = useState({})
    const [groupName,setGroupName] = useState('')
    const[ socketId,setSocketId] = useState('')
    const [isGroup,setIsGroup] = useState(false)
    const [selectedGroupName,setSelectedGroupName] = useState('')
    const {data}= useContext(UserContext)
    const [modal, setModal] = useState(false);
    const socket = useMemo(()=>io("http://localhost:3330"),[])

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
                    const result1= response1.data.reduce((acc,cv)=>{
                        acc[cv.name] = {...cv,chatHistory:[]}
                        return acc
                    },{})
                    setAllGroups(result1)
                    setUsers(response.data)
                    console.log(response.data)
                    const result = response.data.reduce((acc,cv)=>{
                        acc[cv.name] = []
                        return acc
                    },{})
                    setRecieve(result)
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
            //  setRecieve(prevState=>{
            //     const newRecieve = {...prevState}
            //     if(!newRecieve[data.message.username]){
            //         newRecieve[data.message.username] =[data]
            //     }else{
            //         newRecieve[data.message.username].push(data)
            //     }
            //     return newRecieve
            //  })
             setRecieve(prevState=>{
                const newRecieve = {...prevState}
                if(!newRecieve[data.reciever]){
                    newRecieve[data.reciever] =[{ reciever:data.username,message:data.message,isGroup:isGroup}]
                }else{
                    newRecieve[data.reciever].push({ reciever:data.username,message:data.message,isGroup:isGroup})
                }
                return newRecieve
             })
      
        })
        
        socket.on('new-join',(data1)=>{
            console.log(data1)
        })
        socket.on('recieve_group_message',(data)=>{
          console.log(data)
          setAllGroups(prevState=>{
            const newRecieve = {...prevState}
            if( data.message.selectedGroupName in newRecieve){
                newRecieve[data.message.selectedGroupName].chatHistory.push({...data})
            }else{
                newRecieve[data.message.selectedGroupName] = newRecieve.chatHistory.push({...data})
            }
            return newRecieve
         })
        })
        
        // return ()=>{
        //     socket.disconnect()
        // }
    },[])


   const handleReciever=(id,name)=>{
    setIsGroup(false)
    setSocketId(id)
    setReciever(name)
   }


    const handleUser=(e)=>{
        e.preventDefault()
        const username = data.user.name
        setSender(data.user.name)
        const room = socketId
        const members = [data.user._id,users.find(ele =>ele.name === reciever)._id]
        socket.emit('message1',{username,reciever,room,message,isGroup,members})
        setRecieve(prevState=>{
            const newRecieve = {...prevState}
            console.log(newRecieve)
            if(username in newRecieve){
                newRecieve[username].push({room,message,reciever})
            }else{
                newRecieve[username] =[{room,message,reciever}]
            }
            return newRecieve
         })
        setMessage('')
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
        alert('successfully joined the group')

        }catch(err){console.log(err)}
    }

    const handleGroupMessages=(id,members,name)=>{
        console.log("groupId",id,"members",members,"name",name)
        setSelectedGroupName(name)
        setIsGroup(true)
        const form ={groupId:id,username:data.user.name,groupName:name}
        setSocketId(id)
        socket.emit("join-group",form)
    }
    const handleGroupUsers=(e)=>{
        e.preventDefault()
        const username = data.user.name
        const group = socketId
        const form ={username,group,message,isGroup,selectedGroupName}
        socket.emit('group-message',form)
        setAllGroups(prevState=>{
            const newRecieve = {...prevState}
            if( selectedGroupName in newRecieve){
                newRecieve[selectedGroupName].chatHistory.push({...{message:form}})
            }else{
                newRecieve[selectedGroupName] = newRecieve.chatHistory.push({...{message:form}})
            }
            return newRecieve
         })
        
    
        setMessage('')
       
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
            console.log(response)  // create one group 
        }catch(err){
            console.log(err)
        }

    }
    console.log("chat single",recieve)
    console.log("group chat",allGroups)
    return <div>
        <h2>Welcome to chatting application</h2>
        <Container>
            <h3>Hi!{data.user.name}</h3>
        <Button onClick={handleModal} style={{margin:"10px"}}>Add a Group</Button>
            <Row>
            <Col className="col-md-2">

                {users.map((ele,i) =>{
                    return<div key={i}><Card style={{width:"50%", height:"50px",textAlign:"center",margin:"10px"}} onClick={(e)=>{handleReciever(ele._id,ele.name)}}>{ele.name}</Card></div>
                })}

                 {Object.values(allGroups).map((ele,i) =>{
                    return <div key={i}>
                        <Card style={{width:"50%", height:"50px",textAlign:"center",margin:"10px"}} 
                              onClick={()=>{handleGroupMessages(ele._id,ele.members,ele.name)}}>{`group ${ele.name}`}
                        {
                            !ele.members.some(mem =>{
                                return mem._id == data.user._id
                            }) &&  <Button onClick={(e)=>{handleJoin(e,data.user,ele._id)}}>Join</Button>
                        }
                        </Card>
                       
                        
                        </div>
                })}
            </Col>
            <Col className="col-md-10" style={{border:"0.5px solid grey" ,borderRadius:"8px"}}>
            {/* {

                isGroup === false? recieve[reciever]?.map((ele,i)=>{
                return <p key={i} style={{background:"grey",borderRadius:"8px",margin:"10px",padding:"10px"}}>{`${ele.message.username}:${ele.message.message}`}</p>
            }) :Object.values(allGroups).filter(ele =>{
                return ele.name == selectedGroupName
            }).map((grp =>{
                return grp.chatHistory.map(msg =>{
                    return <p style={{background:"green",borderRadius:"8px",margin:"10px",padding:"10px"}}>{`${msg.message.username}: ${msg.message.message}`}</p>
                })
            }))

           } */}
           
           {
             isGroup === false ? (
                recieve[sender]  && recieve[sender].filter((ele)=>{
                    return ele.reciever == reciever
                }).map((msg,i)=>{
                    return <p key={i} style={{background:"grey",borderRadius:"8px",margin:"10px",padding:"10px"}}>{msg.message}</p>
                })
             ): Object.values(allGroups).filter(ele =>{
                return ele.name == selectedGroupName
            }).map(((grp,i)=>{
                return grp.chatHistory.map(msg =>{
                    return <p key={i} style={{background:"green",borderRadius:"8px",margin:"10px",padding:"10px"}}>{`${msg.message.username}: ${msg.message.message}`}</p>
                })
            }))

           }
           {
            isGroup ?  <Form onSubmit={handleGroupUsers}>
            <Form.Group as={Row} controlId="formDescription">
            <Form.Label column sm={2}>
               Group message
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
            </Form> : 
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
             }
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