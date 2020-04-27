import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Card,
} from "@material-ui/core";
import moment from "moment";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";

const styles = (theme) => ({
  rootCont: {
    maxWidth: "720px",
    margin: "0px auto",
    boxShadow: "none",
	backgroundColor: "#5A5890",
	height:"100%"
  },
  msgDisplay: {
    minWidth: "300px",
    height: "77%",
    margin: "0 auto",
    overflowY: "scroll",
    "&:hover": {
      overflowY: "scroll",
    },
	position: "relative",
	backgroundColor:"#ebebfc"
  },
  ownMessage: {
    marginRight: "12px",
    backgroundColor: "#514f82",
    marginBottom: "5px",
    borderRadius: "16px",
    maxWidth: "275px",
    width: "fit-content",
    right: "0",
    float: "right",
    clear: "both",
    borderTopRightRadius: "0px",
  },
  otherMessage: {
    marginLeft: "12px",
    backgroundColor: "#5511a8",
    float: "left",
    clear: "both",
    marginBottom: "5px",
    borderRadius: "16px",
    maxWidth: "275px",
    width: "fit-content",
    borderTopLeftRadius: "0px",
  },
  adminMessage: {
    width: "fit-content",
    maxWidth: "275px",
    marginBottom: "5px",
    backgroundColor: "#8684b5",
    margin: "5px auto",
	padding: "0px 6px",
	opacity:"0.8",
    borderRadius: "8px",
    clear: "both",
  },
  inputRoot: {
    backgroundColor: "#d4d3f0",
  },
  inputInput: {
    color: "black",
  },
});

class Chat extends Component {
  constructor(props) {
    super(props);
    let userJoinTemp = false;
    if (
      this.props.location.state &&
      this.props.location.state.userName &&
      this.props.location.state.roomName
    ) {
      userJoinTemp = true;
    }

    this.state = {
      userName: userJoinTemp ? this.props.location.state.userName : "",
      messages: [],
      roomName: userJoinTemp ? this.props.location.state.roomName : "",
      userJoined: userJoinTemp,
    };
    this.props.socket.emit(
      "join",
      { userName: this.state.userName, roomName: this.state.roomName },
      (error) => {
        if (error) return;
      }
    );
  }
  componentDidMount() {
    this.props.socket.on("message", (msgObject) => {
      console.log(msgObject);
      this.addMessage(msgObject);
    });
  }
  componentDidUpdate() {
    document
      .getElementById("dummyBottom")
      .scrollIntoView({ behavior: "smooth" });
  }
  addMessage = (msgObject) => {
    this.setState({
      messages: [...this.state.messages, msgObject],
    });
  };
  render() {
    const { classes, theme } = this.props;
    let displayList;
    if (!this.state.userJoined) {
      return (
        <div>
          {alert("You need to join a room first")}
          <Redirect to="/join" />
        </div>
      );
    }

    return (
      <Paper className={classes.rootCont}>
        <Card style={{ height: "11%", backgroundColor: "#5A5890" }}>
          <Typography
            style={{
              color: "white",
              fontSize: "22px",
              fontFamily: "cursive",
			  marginLeft: "10px",
			  display:"flex",
			  height:"100%",
			  alignItems:"center"
            }}
          >
            Room Name : {this.state.roomName}<br/>
			Participant Name : {this.state.userName}
          </Typography>
        </Card>
        <Paper className={classes.msgDisplay} style={{}}>
         
          <List
            style={{
              bottom: "0",
            }}
          >
            {this.state.messages.map((el) => (
              <ListItem
                className={
                  el.sentBy === this.state.userName
                    ? classes.ownMessage
                    : el.sentBy === "admin"
                    ? classes.adminMessage
                    : classes.otherMessage
                }
              >
                <div style={{ maxWidth: "243px" }}>
                  {el.sentBy !== this.state.userName &&
                  el.sentBy !== "admin" ? (
                    <div
                      style={{
                        color: "orange",
                        fontSize: "15px",
                      }}
                    >
                      {el.sentBy}
                    </div>
                  ) : null}

                  {el.sentBy === "admin" ? (
                    <div
                      style={{
                        color: "black",
                        fontSize: "16px",
                        fontFamily: "roboto",
                        fontWeight: "400",
                        lineHeight: "1.5",
                        wordWrap: "break-word",
                        //wordBreak: "break-all",
                      }}
                    >
                      {el.text}
                    </div>
                  ) : (
                    <div
                      style={{
                        color: "white",
                        fontSize: "18px",
                        fontFamily: "roboto",
                        fontWeight: "400",
                        lineHeight: "1.5",
                        wordWrap: "break-word",
                        //wordBreak: "break-all",
                      }}
                    >
                      {el.text}
                    </div>
                  )}

                  {el.sentBy === "admin" ? null : (
                    <div
                      style={{
                        color: "white",
                        textAlign: "end",
                        fontSize: "16px",
                        fontFamily: "roboto",
                        fontWeight: "400",
                        lineHeight: "1.43",
                      }}
                    >
                      {moment(el.createdAt).format("h:mm a")}
                    </div>
                  )}
                </div>
              </ListItem>
            ))}
          </List>
          <div style={{ clear: "both" }} id="dummyBottom" />
        </Paper>

        <form
          style={{ height:"10%",minWidth: "300px", textAlign: "center", maxWidth: "720px" }}
        >
          <TextField
            className={classes.inputRoot}
            InputProps={{
              className: classes.inputInput,
            }}
            margin="normal"
            variant="filled"
            required
            id="msg"
            label="Type your message"
            color="primary"
            autoFocus
            style={{width:"70%"}}
          />
          <Button
		  type="submit"
            id="send"
            variant="contained"
            color="primary"
            style={{
              marginLeft: "20px",
              marginBottom: "20px",
			  verticalAlign: "bottom",
			  backgroundColor:'#298c18'
            }}
            onClick={(e) => {
              e.preventDefault();
              let msgObject = {
                message: document.getElementById("msg").value,
                senderName: this.state.userName,
              };
              document.getElementById("msg").value = "";

              this.props.socket.emit("message", msgObject, () => {
                console.log("Delivered");
              });
            }}
          >
            Send
          </Button>
        </form>
      </Paper>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Chat);
