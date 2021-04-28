import React, {Component} from "react";

//Material Ui Components
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    TableRow, 
    TablePagination, 
    TableHead, 
    TableContainer, 
    TableCell, 
    TableBody, 
    Table, 
    Paper, 
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

//Api Rest
import {ApiRest} from "../../../apiRest/ApiRest";
import {
    postCreateCampaign,
    postInformationIntoCampaign
} from "../../../apiRest/ApiMethods";

//Mocks
import {DataBaseItems} from "../../../mocks/DataBaseItems";

//Excel
import ReactExport from "react-export-excel";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

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
            dataHeaders: [],
            dataList: [],

            page: 0,
            rowsPerPage: 10,

            //Cartera Data
            dataBaseName: "",
            dataBaseDescription: "",
            dataBaseFileName: "",
            dataBaseCsvFile: null,
        };
    }

    onCreateDataBaseClick = () => {
        if(this.state.dataBaseName.trim().length === 0){
            swal("Ingrese nombre de Cartera.", {icon: "error"});
            return;
        }

        if(this.state.dataBaseName.includes(" ")){
            swal("Nombre de Cartera no debe contener espacios en blanco.", {icon: "error"});
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

    onChangePage = (event, newPage) => {
        this.setState({page: newPage});
    };

    onChangeRowsPerPage = (event) => {
        this.setState({rowsPerPage: event.target.value});
        this.setState({page: 0});
    };

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

        let list = [];
        let listPhoneString = "";

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

                if(listPhoneString.length > 0){
                    listPhoneString = listPhoneString.concat(",");
                }

                listPhoneString = listPhoneString.concat("'" + obj["TELEFONO"] + "'");

                // remove the blank rows
                if (Object.values(obj).filter(x => x).length > 0) {
                    list.push(obj);
                }
            }
        }

        
        await fetch("https://ventasvirtuales.com.ec/api/procedures/getmethods/SearchLeadList.php?token=fa1e8f63ff72cf10c9ec00b5b7506666&cellPhoneList="+listPhoneString)
        .then(response => response.json())
        .then(dataPhoneList => {
            if(dataPhoneList.header === "OK"){
                const requestOptions = {
                    token: ApiRest.apiToken,
                    campaignName: this.state.dataBaseName,
                    description: this.state.dataBaseDescription,
                    createdBy: 1
                };
                postCreateCampaign(requestOptions).then(async response => {
                    const dataCampaign = await response.json();
                    if(dataCampaign.header === "OK" && dataCampaign.size === 1){
                        for(let indexList = 0; indexList < list.length; indexList++){
                            let indexCategoryArray = dataPhoneList.body.findIndex(currentBody => currentBody.number_assigned === list[indexList]["TELEFONO"]);
                            list[indexList]["action"] = 1;
                            list[indexList]["message"] = "Telefono valido";
        
                            if(indexCategoryArray >= 0){
                                list[indexList]["action"] = 0;
                                list[indexList]["message"] = dataPhoneList.body[indexCategoryArray].number_assigned + " se encuentra registrado como lead con el estado " + dataPhoneList.body[indexCategoryArray].leadStatus + " y campaña " + dataPhoneList.body[indexCategoryArray].campaign;
                            }else{
                                const requestData = {
                                    token: ApiRest.apiToken,
                                    campaignName: "camp_" + this.state.dataBaseName, 
                                    clientName: list[indexList]["NOMBRE"], 
                                    clientPhone: list[indexList]["TELEFONO"], 
                                    clientIdentification: list[indexList]["IDENTIFICACION"], 
                                    clientCity: list[indexList]["CIUDAD"], 
                                    clientPlan: list[indexList]["PLAN"], 
                                    clientCreator: 1
                                };
                                postInformationIntoCampaign(requestData).then(async response => {
                                    const data = await response.json();
                                    if(data.header === "OK" && data.size === 1){
                                        list[indexList]["action"] = 1;
                                        list[indexList]["message"] = "Información Ingresada";
                                    }else{
                                        list[indexList]["action"] = 0;
                                        list[indexList]["message"] = "No se pudo Ingresar el recurso";
                                    }
                                }).catch(error => {
                                    list[indexList]["action"] = 0;
                                    list[indexList]["message"] = "Error al acceder al recurso remoto";
                                });
                            }

                            let currentProgress = ((100 * (parseFloat(indexList) + 1))/parseFloat(list.length));
                            console.log("current: " + (indexList + 1) + ", total: " + list.length + ", %: " + currentProgress); 
                            this.setState({
                                progressValue: currentProgress,
                            });
        
                        }
        
                        headers.push("action");
                        headers.push("message");
            
                        // prepare columns list from headers
                        const columns = headers.map(c => ({
                            name: c,
                            selector: c,
                        }));
        
                        this.setState({
                            currentAction: "reportDataTable",
                            dataHeaders: columns,
                            dataList: list,
                        })
                    }else{
                        swal("Error", dataCampaign.message, "error");
                    }
                })
                .catch(error => {
                    swal("Error", "No se pudo acceder al recurso remoto", "error");
                });
            }else{
                swal("error", dataPhoneList.messgae, "error");   
            }
        })
        .catch(error => {
            swal("error", "No se pudo conectar al hosting ventasvirtuales.com.ec", "error");
        });
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

    renderExcel = () => {
        return(
            <ExcelFile>
                <ExcelSheet data={this.state.dataList} name="Datos">
                    <ExcelColumn label="NOMBRE" value="NOMBRE"/>
                    <ExcelColumn label="TELEFONO" value="TELEFONO"/>
                    <ExcelColumn label="IDENTIFICACION" value="IDENTIFICACION"/>
                    <ExcelColumn label="CIUDAD" value="CIUDAD"/>
                    <ExcelColumn label="TELEFONO" value="TELEFONO"/>
                    <ExcelColumn label="PLAN" value="PLAN"/>
                    <ExcelColumn label="ACCION" value="action"/>
                    <ExcelColumn label="MENSAJE" value="message"/>
                </ExcelSheet>
            </ExcelFile>
        );
    }

    renderDataTable = (classes) => {
        return(
            <Paper className = {classes.dataTableContainer}>
                {this.renderExcel()}
                <TableContainer className = {classes.container}>
                    <Table stickyHeader aria-label = "sticky table">
                        <TableHead>
                            <TableRow >
                                {this.state.dataHeaders.map((header, headerIndex) => (
                                    <TableCell
                                        key = {"columnHeader"+headerIndex}
                                        align = "center"
                                        style = {{ backgroundColor: "#343a40", color: "white"}}>

                                        {header.name}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {this.state.dataList.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage).map((currentProduct, productIndex) => {
                                return (
                                    <TableRow hover role = "checkbox" tabIndex = {-1} key = {productIndex}>
                                        {this.state.dataHeaders.map((header) => {
                                            const value = currentProduct[header.selector];
                                            return (
                                                <TableCell key = {currentProduct["IDENTIFICACION"]+""+productIndex} align = "center">
                                                    {value}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions = {[10, 25, 100]}
                    component = "div"
                    count = {this.state.dataList.length}
                    rowsPerPage = {this.state.rowsPerPage}
                    page={this.state.page}
                    onChangePage={this.onChangePage}
                    onChangeRowsPerPage={this.onChangeRowsPerPage}/>
            </Paper>
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