import React, {Component} from "react";

//Material Ui Components
import {
    Container,
    Typography,
    TextField,
    Button,
} from "@material-ui/core";

import {withStyles} from "@material-ui/core/styles";

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

//Style
import {CreateBaseStyles} from "./CreateBaseStyle";

//Strings
import {CreateBaseStrings} from "./CreateBaseStrings";

class CreateBaseScreen extends Component{
    render(){
        const { classes } = this.props;
        return(
            <Container className = {classes.container}>
                <Typography  className = {classes.title}>{CreateBaseStrings.title}</Typography>

                <TextField 
                    className = {classes.textFieldComponent}
                    fullWidth
                    variant = "outlined" 
                    label = {CreateBaseStrings.createDataBaseHintName}
                />

                <TextField 
                    className = {classes.textFieldComponent}
                    fullWidth
                    variant = "outlined" 
                    label = {CreateBaseStrings.createDataBaseHintDescription}
                    multiline
                    rows = {3}
                />

                <div className = {classes.uploadFileComponent}>
                    <TextField 
                        style = {{marginRight: "2%",}}
                        fullWidth
                        variant = "outlined" 
                        size = "small"
                        label = {CreateBaseStrings.fileNameHintText}
                        disabled = {true}
                    />
                    <input accept="image/*" className={classes.uploadFileInput} id="icon-button-file" type="file" />
                    <label htmlFor="icon-button-file">
                        <Button
                            variant = "contained"
                            component = "span"
                            className = {classes.uploadFileButton}
                            startIcon = {<CloudUploadIcon />}
                        >
                            {CreateBaseStrings.uploadFileButtonText}
                        </Button>
                    </label>
                </div>

                <Button
                    className = {[classes.createDataBaseButton, classes.textFieldComponent]}
                    variant = "contained"
                >
                    {CreateBaseStrings.createDataBaseButtonText}      
                </Button>
            </Container>
        );
    }
}

export default withStyles(CreateBaseStyles)(CreateBaseScreen);