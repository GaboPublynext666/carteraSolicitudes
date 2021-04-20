import React, {Component} from "react";

//Material Ui Components
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import PropTypes from 'prop-types';

//Sweet Alert
import swal from 'sweetalert';

//Library Excel
import * as XLSX from 'xlsx';

//Style
import {CreateBaseStyles} from "./CreateBaseStyle";

//Strings
import {CreateBaseStrings} from "./CreateBaseStrings";

//Mocks
import {DataBaseItems} from "../../../mocks/DataBaseItems";

function CircularProgressWithLabel(props) {
    return (
        <Box position="relative" display="inline-flex">
            <CircularProgress variant="determinate" {...props} />
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
  }
  
CircularProgressWithLabel.propTypes = {
    value: PropTypes.number.isRequired,
};

class CreateBaseScreen extends Component{
    constructor(props) {
        super(props);
        // No llames this.setState() aquí!
        this.state = {
            currentAction: "createDataBase",
            progressValue: 0,
            totalData: 0,
            succesfulData: 0,
            failedData: 0,

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

        if(this.state.dataBaseFileName.length === 0 || this.state.dataBaseCsvFile === null){
            swal("Seleccione un archivo csv.", {icon: "error"});
            return;
        }

        this.processCsvFile();
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

    processCsvFile = () => {
        const file = this.state.dataBaseCsvFile;
        const reader = new FileReader();
        reader.onload = (evt) => {
            /* Parse data */
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
            this.analizeCsvContent(data);
        };
        reader.readAsBinaryString(file);
    }

    analizeCsvContent = async(dataString) => {
        const dataStringLines = dataString.split(/\r\n|\n/);
        const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

        if( headers.length === 0 || (headers.length !== DataBaseItems.length)){
            swal("Error en el formato del Archivo", "Números de Columnas no coinciden", "error");
            return;
        }

        let flagValidHeader = true;
        for (let headerIndex = 0; headerIndex < headers.length; headerIndex++) {
            if(headers[headerIndex] !== DataBaseItems[headerIndex].name){
                flagValidHeader = false;
                swal("Error en el formato de Archivo", "Columna " + (headerIndex + 1) + ", nombre encontrado: " + headers[headerIndex] + ", nombre esperado: " + DataBaseItems[headerIndex].name, "error");
                break;
            }   
        }

        if(!flagValidHeader){
            return;
        }
        
        this.setState({
            currentAction: "progressBar",
            totalData: dataStringLines.length,
        });

        const list = [];

        for (let i = 1; i < dataStringLines.length; i++) {
            const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
            
            if (headers && row.length === headers.length) {
                const obj = {};
                for (let j = 0; j < headers.length; j++) {
                    let d = row[j];
                    if (d.length > 0) {
                        if (d[0] === '"')
                        d = d.substring(1, d.length - 1);
                        if (d[d.length - 1] === '"')
                        d = d.substring(d.length - 2, 1);
                    }
                    if (headers[j]) {
                        obj[headers[j]] = d;
                    }
                }

                await fetch("https://ventasvirtuales.com.ec/api/procedures/getmethods/SearchLeads.php?token=fa1e8f63ff72cf10c9ec00b5b7506666&gestorId=724&cellPhone=" + obj["TELEFONO"] + "&rolGestor=Superior")
                .then(response => response.json())
                .then(data => {
                    if(data.header === "OK"){
                        if(data.size > 0){
                            obj["action"] = false;
                            obj["message"] = data.body.number_assigned + " se encuentra registrado como leads con el estado " + data.body.leadStatus + " y el plan es " + data.body.campaign;
                        }else{
                            obj["action"] = true;
                            obj["message"] = "Datos Válidos";
                        }
                    }else{
                        obj["action"] = false;
                        obj["message"] = "Error al consultar en Ventas Virtuales";
                    }
                })
                .catch(error => {obj["message"] = "Se perdió la conexión a internet";});
        
                //alert(obj["message"]);
                // remove the blank rows
                if (Object.values(obj).filter(x => x).length > 0) {
                    list.push(obj);
                }

                let currentProgress = ((100 * (parseFloat(i)))/parseFloat(dataStringLines.length - 1));
                console.log("current: " + i + ", total: " + dataStringLines.length + ", %: " + currentProgress); 
                this.setState({
                    progressValue: currentProgress,
                });
            }
        }
    
        // prepare columns list from headers
        const columns = headers.map(c => ({
            name: c,
            selector: c,
        }));
    
        // setData(list);
        // setColumns(columns);

        this.setState({
            currentAction: "reportDataTable"
        })

    }


    //Renders
    renderUploadFileViewComponent = (classes) => {
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

    renderDataTable = (classes) => {
        return(
            <div>
                <h1>Data table</h1>
            </div>
        );
    }

    renderProgressBar = (classes) => {
        return(
            <div>
                <CircularProgressWithLabel value = {this.state.progressValue} />;
            </div>
        );
    }

    renderCurrentView = (option, classes) => {
        switch(option){
            case "createDataBase":
                return (
                    <div>
                        {this.renderUploadFileViewComponent(classes)}
                    </div>
                );
            case "progressBar":
                return (
                    <div>
                        {this.renderProgressBar(classes)}
                    </div>
                );
            case "reportDataTable":
                return (
                    <div>
                        {this.renderDataTable(classes)}
                    </div>
                );
            default:
                return null;
        }
    }

    render(){
        const { classes } = this.props;
        return(
            <div>
                {this.renderCurrentView(this.state.currentAction, classes)}
            </div>
        );
    }
}

export default withStyles(CreateBaseStyles)(CreateBaseScreen);