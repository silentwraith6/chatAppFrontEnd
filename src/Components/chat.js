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
  Fab,
} from "@material-ui/core";
import moment from "moment";
import ExpandMoreRoundedIcon from "@material-ui/icons/ExpandMoreRounded";

const styles = (theme) => ({
  rootCont: {
    maxWidth: "720px",
    margin: "0 auto",
    boxShadow: "none",
    backgroundColor: "#5A5890",
    height: "100%",
  },
  msgDisplay: {
    minWidth: "300px",
    height: "77%",
    margin: "0 auto",
    overflowY: "hidden",
    // "&:hover": {
    //   overflowY: "scroll",
    // },
    position: "relative",
    backgroundColor: "#ebebfc",
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
    opacity: "0.8",
    borderRadius: "8px",
    clear: "both",
  },
  inputRoot: {
    backgroundColor: "#d4d3f0",
  },
  inputInput: {
    color: "black",
  },
  fabVisible: {
    backgroundColor: "#8684b5",
    opacity: "0.8",
    bottom:"20px",
    right:"60px",
    position:"absolute"
  },
  fabHidden: {
    display: "none",
  },
});

class Chat extends Component {
  constructor(props) {
    super(props);
    let userJoinTemp = false;
    if (
      this.props.location.state &&
      this.props.location.state.userName &&
      this.props.location.state.roomName &&
      this.props.location.state.msg
    ) {
      userJoinTemp = true;
    }

    this.state = sessionStorage.getItem("state")
      ? JSON.parse(sessionStorage.getItem("state"))
      : {
          userName: userJoinTemp ? this.props.location.state.userName : "",
          messages: userJoinTemp ? [this.props.location.state.msg] : [],
          roomName: userJoinTemp ? this.props.location.state.roomName : "",
          userJoined: userJoinTemp,
          status: null,
          showFab: false,
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
    const chat = document.getElementById("chatList");
    // chat.scrollTop = chat.scrollHeight;

    this.props.socket.on("serverToClientMessage", (msgObject, callback) => {
      msgObject.recOnClientAt = new Date().getTime();
      msgObject.status = "recOnClient";
      this.addMessage(msgObject);
    });

    window.addEventListener("offline", () => {
      this.setState({ status: "disconnected" });
    });
    window.addEventListener("online", () => {
      this.setState({ status: "connected" });
      this.props.socket.emit(
        "updateMessages",
        this.state.messages[this.state.messages.length - 1].id,
        this.state.roomName,
        (missedMsgs) => {
          alert("missed " + missedMsgs.length);
          missedMsgs.map((msgObject) => {
            this.addMessage(msgObject);
          });
          window.location.reload(false);
        }
      );
    });
  }

  autoScrolling = () => {
    const newMessage = document.getElementById("msgList").lastElementChild;

    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    const chat = document.getElementById("chatList");
    const visibleHeight = chat.offsetHeight;

    const containerHeight = chat.scrollHeight;

    const scrollOffset = chat.scrollTop + visibleHeight;

    console.log(
      "container Height =",
      containerHeight,
      "\nnew message Height =",
      newMessageHeight,
      "\nscrollOffset =",
      scrollOffset
    );

    if (
      Math.floor(containerHeight - newMessageHeight - 2) <=
      Math.ceil(scrollOffset)
    ) {
      chat.scrollTop = chat.scrollHeight + newMessageMargin;
    } else {
      this.setState({
        showFab: true,
      });
    }
  };

  addMessage = (msgObject) => {
    this.setState({
      messages: [...this.state.messages, msgObject],
    });
    sessionStorage.setItem("state", JSON.stringify(this.state));
    this.autoScrolling();
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
              display: "flex",
              height: "100%",
              alignItems: "center",
            }}
          >
            Room Name : {this.state.roomName}
            <br />
            Participant Name : {this.state.userName}
          </Typography>
        </Card>
        <Paper id="chatList" className={classes.msgDisplay} style={{}}>
          {/* <div> */}
          <List
            id="msgList"
            style={{
              bottom: "0",
              width:"100%",
              height:"100%",
              overflow:"auto"
            }}
          >
            {this.state.messages.map((el) => (
              <ListItem
                className={
                  el.senderName === this.state.userName
                    ? classes.ownMessage
                    : el.senderName === "admin"
                    ? classes.adminMessage
                    : classes.otherMessage
                }
              >
                <div style={{ maxWidth: "243px" }}>
                  {el.senderName !== this.state.userName &&
                  el.senderName !== "admin" ? (
                    <div
                      style={{
                        color: "orange",
                        fontSize: "15px",
                      }}
                    >
                      {el.senderName}
                    </div>
                  ) : null}

                  {el.senderName === "admin" ? (
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
                      {el.message}
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
                      {el.message}
                    </div>
                  )}

                  {el.senderName === "admin" ? null : (
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
          {/* </div> */}
        
          <Fab
            className={
              this.state.showFab ? classes.fabVisible : classes.fabHidden
            }
            size="small"
          >
            <ExpandMoreRoundedIcon />
          </Fab>
        
        </Paper>

        <form
          style={{
            height: "10%",
            minWidth: "300px",
            textAlign: "center",
            maxWidth: "720px",
          }}
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
            style={{ width: "70%" }}
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
              backgroundColor: "#298c18",
            }}
            onClick={(e) => {
              e.preventDefault();
              let msgObject = {
                message: document.getElementById("msg").value,
                senderName: this.state.userName,
                status: "sentFromClient",
                sentFromClientAt: new Date().getTime(),
              };
              document.getElementById("msg").value = "";

              this.props.socket.emit(
                "clientToServerMessage",
                msgObject,
                (text) => {
                  console.log(text);
                }
              );
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
