import React, {Component} from "react";

//Material Ui Components
import {
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Box,
    Typography,
}from "@material-ui/core";

//Matrial Ui Styles
import { withStyles } from '@material-ui/styles';

//React Bootstrap Components
import {
	Image
} from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";

//Components
import CopyrightScreen from "../copyright/CopyrightScreen";

//Strings
import {Strings} from "../../strings";

//import Sweet Alert
import swal from 'sweetalert';

import {
    getAuthentication,
} from "../../apiRest/ApiMethods";

import{
    getSessionFromStorage
} from "../../generalMethods/generalMethods";

const useStyles = theme => ({

    cssLabel: {
        color : 'white'
    },
    
    cssOutlinedInput: {
        "&$cssFocused $notchedOutline": {
            borderColor: 'white !important',        
        },
        color: 'white'
    },
    
    cssFocused: {
        color: 'white !important'
    },
    
    notchedOutline: {
        borderWidth: '1px',
        borderColor: 'white !important'
    },
    
    mainContainer:{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url("/login-background.jpg")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "100% 100%",
    },

    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },

    appLogo: {
        height: "22vh",
    },

    bodyFormContainer: {
        width: "100%", // Fix IE 11 issue.
        marginTop: "2vh",
    },

    loginButton: {
        fontWeight: "bold",
        textTransform: "none",
    }
});

const CustomCheckBox = withStyles({
    root: {
        color: "white",
        '&$checked': {
            color: "#007bff"
        },
    },
    checked: {
        
    },
})(props => <Checkbox color="default" {...props} />);
  

class LoginScreen extends Component {
    constructor(props) {
		super(props);
		
		//Status var
		this.state = {
            //loginData:
            loginUsername: "",
            loginPassword: "",
            loginRemember: true,

            businessData: {}
        }
    }

    componentDidMount(){
        if(getSessionFromStorage()){
            this.props.history.push("/menu");
        }
    }
    
    authenticateUser = () => {
        if(this.state.loginUsername.trim().length <= 0){
            swal("Faltan datos", "Ingrese su usuario, por favor.", "error");
            return
        }

        if(this.state.loginPassword.trim().length <= 0){
            swal("Faltan datos", "Ingrese su contraseña, por favor.", "error");
            return
        }

        this.getAuthenticateData();
    }

    getAuthenticateData = () => {
        getAuthentication(this.state.loginUsername, this.state.loginPassword)
		.then(data => {
            if(data.header === 'OK' && data.count > 0){
                this.saveSession(data.body[0]);
                this.props.history.push("/menu");
            }else{
                swal("Error", data.message, "error");
            }
		})
		.catch(error => swal("Error", error, "error"));
	}

    saveSession = (data) => {
        if(this.state.loginRemember){
            localStorage.setItem("authCredentials", JSON.stringify(data));
        }else{
            sessionStorage.setItem("authCredentials", JSON.stringify(data));
        }
    }

    //render
    renderHeaderLogin = (classes) => {
        return(
            <div className = {classes.formContainer}>
                <Image className = {classes.appLogo} src = {Strings.appLogoUrl}/>

                <Typography component = "h1" variant = "h5" style = {{marginTop: "3vh", color: "white"}}>
                    {Strings.loginTitle}
                </Typography>
            </div>
        );
    }

    renderLoginForm = (classes) => {
        return(
            <form className={classes.bodyFormContainer} noValidate>
                <TextField
                    InputLabelProps = {{
                        classes: {
                        root: classes.cssLabel,
                        focused: classes.cssFocused,
                        },
                    }}
                    InputProps = {{
                        classes: {
                        root: classes.cssOutlinedInput,
                        focused: classes.cssFocused,
                        notchedOutline: classes.notchedOutline,
                        },
                    }}
                    value = {this.state.loginUsername}
                    onChange = {(event) => this.setState({loginUsername: event.target.value})}
                    variant = "outlined"
                    margin = "normal"
                    required
                    fullWidth
                    id = "user"
                    label = {Strings.userHintText}
                    name = "user"
                    autoFocus/>

                <TextField
                    InputLabelProps = {{
                        classes: {
                        root: classes.cssLabel,
                        focused: classes.cssFocused,
                        },
                    }}
                    InputProps = {{
                        classes: {
                        root: classes.cssOutlinedInput,
                        focused: classes.cssFocused,
                        notchedOutline: classes.notchedOutline,
                        },
                    }}
                    value = {this.state.loginPassword}
                    onChange = {(event) => this.setState({loginPassword: event.target.value})}
                    variant = "outlined"
                    margin = "normal"
                    required
                    fullWidth
                    name = "password"
                    label = {Strings.passwordHintText}
                    type = "password"
                    id = "password"
                    autoComplete = "current-password"/>

                <FormControlLabel
                    style = {{color:'white'}}
                    control = {
                        <CustomCheckBox 
                            value = "checked" 
                            onChange = {() => this.setState({loginRemember: !this.state.loginRemember})} 
                            checked = {this.state.loginRemember}/>
                    }
                    label = {Strings.rememberSession}
                />

                <Button
                    fullWidth
                    variant = "contained"
                    color = "primary"
                    onClick = {this.authenticateUser}
                    className = {classes.loginButton}>
                    {Strings.loginButtonText}
                </Button>
            </form>
        );
    }

    renderCopyright = (classes) => {
        return(
            <Box mt = {8}>
                <CopyrightScreen fontColor = "white"/>
            </Box>
        );
    }

    renderLoginScreen = (classes) => {
        return(
            <div className = {classes.mainContainer}>
                <div style = {{width: "50%", display: "flex", flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center",}}>
                    
                    <div style = {{backgroundColor: "black", padding: "10%", borderRadius: "1vw"}}>
                        {this.renderHeaderLogin(classes)}
                        {this.renderLoginForm(classes)}
                        {this.renderCopyright(classes)}
                    </div>
                </div>            
            </div>
        );
    }

    render(){
        const { classes } = this.props;
        return(
           <div>
               {
                this.renderLoginScreen(classes)
               }
           </div>
        );
    }
}

export default withStyles(useStyles)(LoginScreen);