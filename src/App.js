import React from 'react';
import Chat from './Components/chat'
import Join from './Components/join'
import { BrowserRouter, Route, Redirect} from "react-router-dom";
import io from 'socket.io-client'
const socket = io("https://chat-app-server-mg.herokuapp.com/");

function App() {
  return (
    <BrowserRouter>
    <Route exact path='/join' render={props=><Join {...props} socket={socket}/>}/>
    <Route exact path='/chat' render={props => <Chat {...props} socket={socket}/>}/>
    <Redirect to="join"/>
    </BrowserRouter>
  );
}

export default App;