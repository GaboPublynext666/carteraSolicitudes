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

//Sweet Alert
import swal from 'sweetalert';

//Style
import {CreateBaseStyles} from "./CreateBaseStyle";

//Strings
import {CreateBaseStrings} from "./CreateBaseStrings";

class CreateBaseScreen extends Component{
    constructor(props) {
        super(props);
        // No llames this.setState() aquí!
        this.state = {
           openDrawer: false,
           currentAction: null,

           //Cartera Data
           dataBaseName: "",
           dataBaseDescription: "",
           dataBaseFileName: "",
           dataBaseCsvFile: null,
        };
    }

    onCreateDataBaseClick = () => {
        if(this.state.dataBaseName.length === 0){
            swal("Ingrese nombre de Cartera.", {icon: "error"});
            return;
        }

        if(this.state.dataBaseDescription.length === 0){
            swal("Ingrese descripción para la cartera.", {icon: "error"});
            return;
        }

        if(this.state.dataBaseFileName.length === 0){
            swal("Seleccione un archivo csv.", {icon: "error"});
            return;
        }
    }

    onSelectFile = (event) => {
        const file = event.target.files[0];
        if(!file.name.endsWith(".csv")){
            swal("Imagen debe estar en formato csv.", {icon: "error"});
            return;
        }

        this.setState({
            dataBaseFileName: file.name,
            dataBaseCsvFile: file
        });

    }


    render(){
        const { classes } = this.props;
        return(
            <Container className = {classes.container}>
                <Typography  className = {classes.title}>{CreateBaseStrings.title}</Typography>

                <TextField 
                    className = {classes.textFieldComponent}
                    fullWidth
                    variant = "outlined" 
                    value = {this.state.dataBaseName}
                    onChange = {(event) => this.setState({dataBaseName: event.target.value})}
                    label = {CreateBaseStrings.createDataBaseHintName}
                />

                <TextField 
                    className = {classes.textFieldComponent}
                    fullWidth
                    variant = "outlined" 
                    value = {this.state.dataBaseDescription}
                    onChange = {(event) => this.setState({dataBaseDescription: event.target.value})}
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
                        value = {this.state.dataBaseFileName}
                        onChange = {(event) => this.setState({dataBaseFileName: event.target.value})}
                        label = {CreateBaseStrings.fileNameHintText}
                        disabled = {true}
                    />
                    <input 
                        accept=".csv" 
                        className={classes.uploadFileInput} 
                        id="icon-button-file" type="file" 
                        onChange = {(event) => this.onSelectFile(event)}
                    />
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
                    onClick = {() => this.onCreateDataBaseClick()}
                >
                    {CreateBaseStrings.createDataBaseButtonText}      
                </Button>
            </Container>
        );
    }
}

export default withStyles(CreateBaseStyles)(CreateBaseScreen);