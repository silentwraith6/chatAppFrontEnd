import React from 'react';
import Chat from './Components/chat'
import Join from './Components/join'
import { BrowserRouter, Route, Redirect,Switch} from "react-router-dom";
import io from 'socket.io-client'
const socket = io("http://192.168.29.238:5000");

function App() {
  return (
    <BrowserRouter>
    {console.log(window.location.href)}
    <Switch>
    <Route exact path='/join' render={props=><Join {...props} socket={socket}/>}/>
    <Route exact path='/chat' render={props => <Chat {...props} socket={socket}/>}/>
    <Redirect from='/' to='/join'/>

    
    </Switch>
    </BrowserRouter>
  );
}

export default App;
