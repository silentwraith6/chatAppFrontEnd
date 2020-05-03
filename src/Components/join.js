import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Route } from "react-router-dom";
import { Paper, Button, TextField, Typography } from "@material-ui/core";
import io from "socket.io-client";
const styles = (theme) => ({
  rootCont: {
    maxWidth: "720px",
    margin: "0px auto",
    boxShadow: "none",
    paddingTop: "20px",
    paddingBottom: "20px",
    backgroundColor: "#5A5890",
    textAlign: "center",
  },
  inputRoot: {
    backgroundColor: "#d4d3f0",
  },
  inputInput: {
    color: "black",
  },
});

class Join extends Component {
  constructor(props) {
    super(props);
  }

  

  render() {
    const { classes, theme } = this.props;
    return (
      <div
        style={{
          backgroundColor: "#fff",
          display: "flex",
        }}
      >
        <Paper className={classes.rootCont}>
          <Typography
            style={{ fontSize: "40px", fontFamily: "cursive", color: "#fff" }}
          >
            Welcome to Manav's Chat Application
          </Typography>
          <br />
          <Typography
            style={{ fontSize: "20px", fontFamily: "cursive", color: "#fff" }}
          >
            Please enter details to join/create a chat room
          </Typography>

          <br />
          <br />
          <form stye={{ marginTop: "auto", marginBottom: "auto" }}>
            <TextField
              className={classes.inputRoot}
              InputProps={{
                className: classes.inputInput,
              }}
              varient="filled"
              margin="normal"
              required
              fullWidth
              id="name"
              label="Type your name"
              autoFocus
              color="secondary"
              style={{ maxWidth: "300px" }}
            />
            <br />
            <br />
            <br />
            <TextField
              className={classes.inputRoot}
              InputProps={{
                className: classes.inputInput,
              }}
              margin="normal"
              required
              fullWidth
              id="roomName"
              label="Type the room name"
              autoFocus
              color="secondary"
              style={{ maxWidth: "300px" }}
            />
            <br />
            <br />
            <Button
              style={{ backgroundColor: "#298c18" }}
              type="submit"
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.preventDefault();
                let userName = document.getElementById("name").value;
                let roomName = document.getElementById("roomName").value;
                document.getElementById("name").value = "";
                document.getElementById("roomName").value = "";
                userName = userName.trim();
                roomName = roomName.trim();
                if (!userName || !roomName) {
                  return alert("Username and room are required");
                }
                userName = userName.trim();
                roomName = roomName.trim();

                if (!userName || !roomName) {
                  return alert("Username and room are required"); 
                }
                if (userName === "admin") return alert("Username not valid");

                this.props.socket.emit(
                  "join",
                  { userName, roomName },
                  (error) => {
                    if(typeof(error)==="object"){
                      this.props.history.push({
                        pathname: "/chat",
                        state: {
                          userName: userName,
                          roomName: roomName,
                          msg:error
                        },
                      });
                    }
                    else{
                      alert(error);
                    }
                  }
                );
              }}
            >
              Enter Room
            </Button>
          </form>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Join);
