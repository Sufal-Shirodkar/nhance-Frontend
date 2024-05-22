import { useEffect,useState,useMemo} from 'react'
import { Container,Form,Col,Button,Row} from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import {io} from 'socket.io-client'
export default function SingleChat(){
    const [message,setMessage] = useState('')
    const [recieve,setRecieve] = useState([])
    const socket = useMemo(()=>io("http://localhost:3330"),[])
    const {id}= useParams()
    console.log(id)
    useEffect(()=>{
        return ()=>{
            socket.disconnect()
        }
    },[])
    const handleSubmit=(e)=>{
        e.preventDefault()
        socket.on('join_room',()=>{

        })
    }
    return <div>
          <Form onSubmit={()=>{handleSubmit()}}>
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
            {
                recieve.map((ele,i) =>{
                    return <p>{ele}</p>
                })
            }

    </div>
}