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
  Badge,
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
    bottom: "20px",
    right: "60px",
    position: "absolute",
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
          unreadCount: 0,
          unreadAdminMsg: false,
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
    chat.scrollTop = chat.scrollHeight;
    chat.addEventListener("scroll", this.removeFabOnScroll);

    this.props.socket.on("serverToClientMessage", (msgObject, callback) => {
      msgObject.recOnClientAt = new Date().getTime();
      msgObject.status = "recOnClient";
      this.addMessage(msgObject);
    });

    window.addEventListener("offline", this.onOfflineEventListener);
    window.addEventListener("online", () => this.onOnlineEventListener);
  }

  componentWillUnmount() {
    window.removeEventListener("online", this.onOnlineEventListener);
    window.removeEventListener("offline", this.onOfflineEventListener);
    document
      .getElementById("chatList")
      .removeEventListener("scroll", this.removeFabOnScroll);
    this.setState({      
          status: null,
          showFab: false,
          unreadCount: 0,
          unreadAdminMsg: false,
    })
    sessionStorage.setItem("state", JSON.stringify(this.state));
  }
  removeFabOnScroll = () => {
    const chat = document.getElementById("chatList");
    if (
      Math.ceil(chat.scrollTop + chat.offsetHeight) >=
      0.99 * chat.scrollHeight
    ) {
      this.setState({ showFab: false, unreadCount: 0 });
      sessionStorage.setItem("state", JSON.stringify(this.state));
    }
  };
  onOfflineEventListener = () => {
    this.setState({ status: "disconnected" });
    sessionStorage.setItem("state", JSON.stringify(this.state));
  };

  onOnlineEventListener = () => {
    this.setState({ status: "connected" });
    sessionStorage.setItem("state", JSON.stringify(this.state));
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
  };

  autoScrolling = () => {
    const newMessage = document.getElementById("msgList").lastElementChild;

    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    const chat = document.getElementById("chatList");
    const visibleHeight = chat.offsetHeight;

    const containerHeight = chat.scrollHeight;

    const scrollOffset = chat.scrollTop + visibleHeight;

    if (
      Math.floor(0.99 * (containerHeight - newMessageHeight)) <=
      Math.ceil(scrollOffset)
    ) {
      if (this.state.unreadAdminMsg) {
        let updatedMsgs = this.state.messages;
        updatedMsgs = updatedMsgs.filter((el) => {
          return el.message !== "Unread Messages" && el.senderName !== "admin";
        });
        this.setState({
          messages: updatedMsgs,
          unreadAdminMsg: false,
        });
        sessionStorage.setItem("state", JSON.stringify(this.state));
      }

      chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
    } else {
      if (this.state.unreadCount === 0) {
        let updatedMsgs = this.state.messages;
        updatedMsgs.splice(updatedMsgs.length - 1, 0, {
          message: "Unread Messages",
          senderName: "admin",
        });
        this.setState({
          messages: updatedMsgs,
          unreadAdminMsg: true,
        });
        sessionStorage.setItem("state", JSON.stringify(this.state));
      }
      this.setState({
        showFab: true,
        unreadCount: this.state.unreadCount + 1,
      });
      sessionStorage.setItem("state", JSON.stringify(this.state));
    }
  };
  scrollToBottom = () => {
    const chat = document.getElementById("chatList");
    chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
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
        <Paper className={classes.msgDisplay} style={{}}>
          <div
            id="chatList"
            style={{
              bottom: "0",
              width: "100%",
              height: "100%",
              overflow: "auto",
            }}
          >
            <List id="msgList">
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
          </div>

          <Fab
            className={
              this.state.showFab ? classes.fabVisible : classes.fabHidden
            }
            size="small"
            onClick={() => {
              this.scrollToBottom();
              this.setState({ showFab: false, unreadCount: 0 });
              sessionStorage.setItem("state", JSON.stringify(this.state));
            }}
          >
            <Badge badgeContent={this.state.unreadCount} color="secondary">
              <ExpandMoreRoundedIcon />
            </Badge>
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
