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
    Checkbox,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import Autocomplete from '@material-ui/lab/Autocomplete';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
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
    getParametersForPortfolio, 
    getAllLeadStatus,
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
        <Box position = "relative" display = "inline-flex">
            <CircularProgress style = {{marginLeft: "auto", marginRight: "auto", width: "15%", height: "15%"}} variant="determinate" {...props} />
            <Box
                top = {0}
                left = {0}
                bottom = {0}
                right = {0}
                position = "absolute"
                display = "flex"
                alignItems = "center"
                justifyContent = "center"
            >
                <Typography style = {{fontSize: "3vw"}} variant = "caption" component = "div" color = "textSecondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}
  
CircularProgressWithLabel.propTypes = {
    value: PropTypes.number.isRequired,
};

const CustomCheckBox = withStyles({
    root: {
        color: "black",
        '&$checked': {
            color: "#007bff"
        },
    },
    checked: {
        
    },
})(props => <Checkbox size = "small" color = "default" {...props} />);

const CustomAccordionSummary = withStyles({
    root: {
        minHeight: "3vh",
        height: "3vh",
        "&$expanded": {
            minHeight: "3vh",
            height: "3vh",
        },
    },
   
    expanded: {
    },
})(props => <AccordionSummary {...props} />);

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
            dataHeaders2: [],
            dataList: [],
            leadStatusList: [],
            originList: [],

            //Parameters
            campaignList: [],
            originBaseList: [],
            offerList: [],
            phoneCompanyList: [],

            selectedCampaignList: null,
            selectedOriginBaseList: null,
            selectedOfferList: null,
            selectedPhoneCompanyList: null,

            //Accordion
            expandedAccordion: false,
            
            uploadedInfoItems: 0,

            page: 0,
            rowsPerPage: 10,

            //Cartera Data
            dataBaseName: "",
            dataBaseFileName: "",
            dataBaseCsvFile: null,

            //Lead Validation
            validateWithLeads: false,
        };
    }

    componentDidMount(){
        this.getListStatusFromLeads();
        this.gettinParameterFromApi("Campaña", "campaignList");
        this.gettinParameterFromApi("Operadora", "phoneCompanyList");
        this.gettinParameterFromApi("Origen Base", "originBaseList");
        this.gettinParameterFromApi("Oferta", "offerList");
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.uploadedInfoItems !== this.state.uploadedInfoItems && prevState.uploadedInfoItems < this.state.uploadedInfoItems) {
            let currentProgress = ((100 * (parseFloat( this.state.uploadedInfoItems) + 1))/parseFloat(this.state.originList.length));
            console.log("current: " + ( this.state.uploadedInfoItems + 1) + ", total: " + this.state.originList.length + ", %: " + currentProgress); 
            
            this.setState({
                progressValue: currentProgress,
            });

            if(prevState.uploadedInfoItems < this.state.uploadedInfoItems && this.state.uploadedInfoItems >= this.state.originList.length){
                this.setState({
                    currentAction: "reportDataTable",
                    dataList: this.state.originList,
                })
            }
        }
    }

    gettinParameterFromApi = (parameterName, listName) => {
        getParametersForPortfolio(parameterName).then(data => {
            if(data.header === "OK" && data.count > 0){
                let currentList = data.body;
                currentList.push({Name: 'Otros'});
                this.setState({[listName]: currentList})
            }else{
                this.setState({[listName]: []})
            }
        })
        .catch(error => this.setState({[listName]: []}));
    }

    getListStatusFromLeads = () => {
        getAllLeadStatus().then(data => {
            if(data.header === "OK" && data.count > 0){
                this.setState({leadStatusList: data.body})
            }else{
                this.setState({leadStatusList: []})
            }
        })
        .catch(error => this.setState({leadStatusList: []}));
    }

    onCreateDataBaseClick = () => {
        if(this.state.dataBaseName.trim().length === 0){
            swal("Ingrese nombre de Cartera.", {icon: "error"});
            return;
        }

        if(this.state.selectedCampaignList === null || (this.state.selectedCampaignList !== null && this.state.selectedCampaignList.Name && this.state.selectedCampaignList.Name.trim().length === 0)){
            swal("Seleccion una Campaña.", {icon: "error"});
            return;
        }

        if(this.state.selectedOriginBaseList === null || (this.state.selectedOriginBaseList !== null && this.state.selectedOriginBaseList.Name && this.state.selectedOriginBaseList.Name.trim().length === 0)){
            swal("Seleccion un Origen de Base.", {icon: "error"});
            return;
        }

        if(this.state.selectedPhoneCompanyList === null || (this.state.selectedPhoneCompanyList !== null && this.state.selectedPhoneCompanyList.Name && this.state.selectedPhoneCompanyList.Name.trim().length === 0)){
            swal("Seleccion un Operadora.", {icon: "error"});
            return;
        }

        if(this.state.selectedOfferList === null || (this.state.selectedOfferList !== null && this.state.selectedOfferList.Name && this.state.selectedOfferList.Name.trim().length === 0)){
            swal("Seleccion una Oferta.", {icon: "error"});
            return;
        }

        if(this.state.dataBaseName.includes(" ")){
            swal("Nombre de Cartera no debe contener espacios en blanco.", {icon: "error"});
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

                listPhoneString = listPhoneString.concat("'" + obj["CELULAR"] + "'");

                // remove the blank rows
                if (Object.values(obj).filter(x => x).length > 0) {
                    list.push(obj);
                }
            }
        }

        
        await fetch("http://solicitudes.claro.com.ec/api/procedures/getmethods/SearchLeadList.php?token=fa1e8f63ff72cf10c9ec00b5b7506666&cellPhoneList="+listPhoneString)
        .then(response => response.json())
        .then(dataPhoneList => {
            if(dataPhoneList.header === "OK"){
                const requestOptions = {
                    token: ApiRest.apiToken,
                    databaseName: this.state.dataBaseName, 
                    comesFrom: "CARTERA", 
                    campaignName: this.state.selectedCampaignList.Name, 
                    originBase: this.state.selectedOriginBaseList.Name, 
                    offerName: this.state.selectedOfferList.Name, 
                    phoneCompany: this.state.selectedPhoneCompanyList.Name, 
                    channelName: "Base de Datos", 
                    creatorIndex: 0
                };
                postCreateCampaign(requestOptions).then(async response => {
                    const dataCampaign = await response.json();
                    if(dataCampaign.header === "OK" && dataCampaign.count === 1){
                        let currentLeadStatusList = this.state.leadStatusList;
                        for(let indexList = 0; indexList < list.length; indexList++){

                            let indexCategoryArray = dataPhoneList.body.findIndex(currentBody => currentBody.number_assigned === list[indexList]["CELULAR"]);
                            list[indexList]["action"] = 1;
                            list[indexList]["accion"] = "Información Ingresada";
                            
                            let flagSaveClientInfo = true;
                            let flagMessageCLientInfo = "No se encuentra en Master";
                            list[indexList]["message"] = flagMessageCLientInfo;
                            if(indexCategoryArray >= 0){
                                flagSaveClientInfo = false;
                                flagMessageCLientInfo = dataPhoneList.body[indexCategoryArray].number_assigned + " se encuentra registrado como lead con el estado " + dataPhoneList.body[indexCategoryArray].leadStatus + " y campaña " + dataPhoneList.body[indexCategoryArray].campaign;
                                list[indexList]["action"] = 0;
                                list[indexList]["accion"] = "No Ingresado";
                                list[indexList]["message"] = flagMessageCLientInfo;

                                for(let indexType = 0; indexType < currentLeadStatusList.length; indexType++){
                                    let indexStatus = currentLeadStatusList[indexType].statusList.findIndex(currentStatus => currentStatus.estado_final === dataPhoneList.body[indexCategoryArray].leadStatus);
                                    if(indexStatus >= 0){
                                        if(currentLeadStatusList[indexType].statusList[indexStatus].status && this.state.validateWithLeads){
                                            list[indexList]["action"] = 1;
                                            list[indexList]["accion"] = "Información Ingresada";
                                            list[indexList]["message"] = flagMessageCLientInfo;
                                            flagSaveClientInfo = true;
                                        }
                                        break;
                                    }
                                }
                            }

                            if(flagSaveClientInfo){
                                const requestData = {
                                    token: ApiRest.apiToken,
                                    databaseName: this.state.dataBaseName, 
                                    clientIdentification: list[indexList]["IDENTIFICACION"], 
                                    clientName: list[indexList]["NOMBRE"], 
                                    clientPhone: list[indexList]["CELULAR"], 
                                    clientCity: list[indexList]["CIUDAD"], 
                                    clientTariff: list[indexList]["TARIFA"], 
                                    otherDatas: list[indexList]["OTROS"], 
                                    anotherDatas: list[indexList]["OTROS1"], 
                                    creator: 0
                                };
                                postInformationIntoCampaign(requestData).then(async response => {
                                    const data = await response.json();
                                    if(data.header === "OK" && data.count === 1){
                                        list[indexList]["action"] = 1;
                                        list[indexList]["accion"] = "Información Ingresada";
                                        list[indexList]["message"] = flagMessageCLientInfo;
                                    }else{
                                        list[indexList]["action"] = 0;
                                        list[indexList]["accion"] = "No ingresado";
                                        list[indexList]["message"] = "No se pudo Ingresar el recurso";
                                    }

                                    this.setState({
                                        uploadedInfoItems: this.state.uploadedInfoItems + 1,
                                        originList: list
                                    });

                                    
                                }).catch(error => {
                                    list[indexList]["action"] = 0;
                                    list[indexList]["accion"] = "No ingresado";
                                    list[indexList]["message"] = "Error al acceder a la api.";
                                    this.setState({
                                        uploadedInfoItems: this.state.uploadedInfoItems + 1,
                                        originList: list
                                    });
                                });
                            }else{
                                this.setState({
                                    uploadedInfoItems: this.state.uploadedInfoItems + 1,
                                    originList: list
                                });
                            }
        
                        }
        
                        headers.push("accion");
                        headers.push("message");
            
                        // prepare columns list from headers
                        const columns2 = headers.map(c => ({
                            name: c,
                            selector: c,
                        }));

                        headers.push("action");                
                        const columns = headers.map(c => ({
                            name: c,
                            selector: c,
                        }));

                        this.setState({
                            dataHeaders: columns,
                            dataHeaders2: columns2
                        });
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
            swal("error", "No se pudo conectar al hosting", "error");
        });
    }

    onExpandAccordionEvent = (panel, nameFlagAccordion) => (event, isExpanded) => {
        this.setState({[nameFlagAccordion]: isExpanded ? panel : false});
    }

    onCheckedTypeStatus = (event, indexType) => {
        let currentListStatus = this.state.leadStatusList;

        for(let i = 0; i < currentListStatus[indexType].statusList.length; i++){
            currentListStatus[indexType].statusList[i].status = event.target.checked;
        }

        let flagValue = 0;
        if(event.target.checked){
            flagValue = currentListStatus[indexType].statusList.length;
        }
        currentListStatus[indexType].size = flagValue;
        this.setState({leadStatusList: currentListStatus});
    }

    onCheckedStatusItem = (event, indexType, indexStatus) => {
        let currentListStatus = this.state.leadStatusList;

        currentListStatus[indexType].statusList[indexStatus].status = event.target.checked;

        let flagValue = 1;
        if(event.target.checked){
            flagValue = -1;
        }
        currentListStatus[indexType].size = currentListStatus[indexType].size - flagValue;
        this.setState({leadStatusList: currentListStatus});
    }


    //Renders
    renderUploadFileViewComponent = (classes) => {
        return(
            <div style = {{width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignContent: "center"}}>
                <Container className = {classes.container}>
                    <Typography  className = {classes.title}>{CreateBaseStrings.title}</Typography>

                    <TextField 
                        className = {classes.textFieldComponent}
                        fullWidth
                        size = "small"
                        variant = "outlined" 
                        value = {this.state.dataBaseName}
                        onChange = {(event) => this.setState({dataBaseName: event.target.value})}
                        label = {CreateBaseStrings.createDataBaseHintName}
                    />

                    <div style = {{display: "flex", flexDirection: "row", width: "100%", marginTop: "1%",}}>
                        <Autocomplete
                            id = "CampaignList"
                            size = "small"
                            options = {this.state.campaignList}
                            style = {{marginRight: "1%",}}
                            getOptionLabel = {(option) => option.Name}
                            fullWidth 
                            onChange = {(event, newValue) => this.setState({selectedCampaignList: newValue})}
                            renderInput = {(params) => <TextField {...params} label = "Compaña" variant = "outlined" />}
                        />

                        <Autocomplete
                            id = "OriginBaseList"
                            size = "small"
                            options = {this.state.originBaseList}
                            style = {{marginLeft: "1%",}}
                            getOptionLabel = {(option) => option.Name}
                            fullWidth 
                            onChange = {(event, newValue) => this.setState({selectedOriginBaseList: newValue})}
                            renderInput = {(params) => <TextField {...params} label = "Origen de Base" variant = "outlined" />}
                        />

                    </div>

                    <div style = {{display: "flex", flexDirection: "row", width: "100%", marginTop: "1%",}}>
                        <Autocomplete
                            id = "PhoneCompanyList"
                            size = "small"
                            options = {this.state.phoneCompanyList}
                            style = {{marginRight: "1%",}}
                            getOptionLabel = {(option) => option.Name}
                            fullWidth 
                            onChange = {(event, newValue) => this.setState({selectedPhoneCompanyList: newValue})}
                            renderInput = {(params) => <TextField {...params} label = "Operadora" variant = "outlined" />}
                        />

                        <Autocomplete
                            id = "offerList"
                            size = "small"
                            options = {this.state.offerList}
                            style = {{marginLeft: "1%",}}
                            getOptionLabel = {(option) => option.Name}
                            fullWidth 
                            onChange={(event, newValue) => this.setState({selectedOfferList: newValue})}
                            renderInput = {(params) => <TextField {...params} label = "Oferta" variant = "outlined" />}
                        />
                    </div>
                    

                    <div className = {classes.uploadFileComponent}>
                        <TextField 
                            style = {{marginRight: "2%",}}
                            fullWidth
                            size = "small"
                            variant = "outlined" 
                            size = "small"
                            value = {this.state.dataBaseFileName}
                            onChange = {(event) => this.setState({dataBaseFileName: event.target.value})}
                            label = {CreateBaseStrings.fileNameHintText}
                            disabled = {true}
                        />
                        <input 
                            accept = ".csv" 
                            className = {classes.uploadFileInput} 
                            id = "icon-button-file" type="file" 
                            onChange = {(event) => this.onSelectFile(event)}
                        />
                        <label htmlFor="icon-button-file">
                            <Button
                                variant = "contained"
                                component = "span"
                                size = "small"
                                className = {classes.uploadFileButton}
                                startIcon = {<CloudUploadIcon />}
                            >
                                {CreateBaseStrings.uploadFileButtonText}
                            </Button>
                        </label>
                    </div>

                    <div style = {{width: "100%"}}>
                        <FormControlLabel
                            style = {{color:'black'}}
                            control = {
                                <CustomCheckBox 
                                    value = "checked" 
                                    onChange = {() => this.setState({validateWithLeads: !this.state.validateWithLeads})} 
                                    checked = {this.state.validateWithLeads}
                                />
                            }
                            label = {CreateBaseStrings.filterTitleText}
                        />
                    </div>

                    {this.state.validateWithLeads ? 
                        this.renderFilterLeads(classes)
                    : null}
                </Container>
                
                <Button
                    className = {[classes.createDataBaseButton, classes.textFieldComponent, classes.onCreateButton]}
                    variant = "contained"
                    size = "small"
                    onClick = {() => this.onCreateDataBaseClick()}
                >
                    {CreateBaseStrings.createDataBaseButtonText}      
                </Button>
            </div>
        );
    }

    renderFilterLeads = (classes) => {
        return(
            <div style = {{width: "100%", display: "flex", flexDirection: "column"}}>
                {this.state.leadStatusList.map((currentType, indexType) => (
                    <Accordion expanded = {this.state.expandedAccordion === currentType.tipo_llamada} onChange = {this.onExpandAccordionEvent(currentType.tipo_llamada, "expandedAccordion")} style = {{backgroundColor: this.props.accordionTitleBackgroundColor, color: this.props.accordionTitleTextColor, padding: 0, marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: indexType > 0 ? "1vh" : 0}}>
                        <CustomAccordionSummary
                            expandIcon = {<ExpandMoreIcon style = {{color: this.props.accordionTitleTextColor,}}/>}
                            aria-controls="panel1bh-content">

                            <FormControlLabel
                                style = {{color:'black', marginTop: "8px"}}
                                size = "small"
                                control = {
                                    <CustomCheckBox 
                                        value = "checked"
                                        checked = {this.state.leadStatusList[indexType].size > 0 ? true : false}
                                        onChange = {(event) => this.onCheckedTypeStatus(event, indexType)}
                                    />
                                }
                                label = {currentType.tipo_llamada}
                            />
                        </CustomAccordionSummary>

                        <AccordionDetails style = {{backgroundColor: this.props.accordionSubTitleContentBackgroundColor}}>
                            {this.renderStatusComponent(currentType.statusList, 3, indexType)}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>
        );
    }

    renderStatusComponent = (statusArrayList, eachIndex, indexType) => {
        let arrayToRender = [];
        for(let i = 0; i < statusArrayList.length; i = i + eachIndex){
            let endIndex = i + eachIndex;
            arrayToRender.push(this.renderEachStatus(i, endIndex, statusArrayList, indexType));
        }

        return(
            <div style = {{width: "100%", display: "flex", flexDirection: "column", marginLeft: "7%"}}>
                {arrayToRender}
            </div>
        );
    }

    renderEachStatus(startIndex, endIndex, statusArrayList, indexType){
        let arrayToRender = [];

        for(let index = startIndex; index < endIndex; index++){
            if(index < statusArrayList.length){
                arrayToRender.push(
                    <FormControlLabel
                        style={{color:'black', flex: 1}}
                        control = {
                            <CustomCheckBox 
                                value = "checked"
                                checked = {this.state.leadStatusList[indexType].statusList[index].status}
                                onChange = {(event) => this.onCheckedStatusItem(event,indexType,index)}
                            />
                        }
                        label = {statusArrayList[index].estado_final}
                    />
                );
            }
        }

        return(
            <div style = {{width: "100%", display: "flex", flexDirection: "row"}}>
                {arrayToRender}
            </div>
        );
    }

    renderExcel = () => {
        return(
            <ExcelFile>
                <ExcelSheet data = {this.state.dataList} name = "Datos">
                    <ExcelColumn label = "IDENTIFICACION" value = "IDENTIFICACION"/>
                    <ExcelColumn label = "NOMBRE" value = "NOMBRE"/>
                    <ExcelColumn label = "CELULAR" value = "CELULAR"/>
                    <ExcelColumn label = "CIUDAD" value = "CIUDAD"/>
                    <ExcelColumn label = "TARIFA" value = "TARIFA"/>
                    <ExcelColumn label = "OTROS" value = "OTROS"/>
                    <ExcelColumn label = "OTROS" value = "OTROS"/>
                    <ExcelColumn label = "CODIGO" value = "action"/>
                    <ExcelColumn label = "ACCION" value = "accion"/>
                    <ExcelColumn label = "MENSAJE" value = "message"/>
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
                                {this.state.dataHeaders2.map((header, headerIndex) => (
                                    header.name === "action" ? null :
                                    <TableCell
                                        key = {"columnHeader"+headerIndex}
                                        align = "center"
                                        size = "small"
                                        style = {{ backgroundColor: "#343a40", color: "white"}}>

                                        {header.name}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {this.state.dataList.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage).map((currentProduct, productIndex) => {
                                return (
                                    <TableRow size = "small" hover role = "checkbox" tabIndex = {-1} key = {productIndex}>
                                        {this.state.dataHeaders2.map((header) => {
                                            const value = currentProduct[header.selector];
                                            return (
                                                <TableCell key = {currentProduct["IDENTIFICACION"]+""+productIndex} align = "center" size = "small">
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
                    page = {this.state.page}
                    onChangePage = {this.onChangePage}
                    onChangeRowsPerPage = {this.onChangeRowsPerPage}/>
            </Paper>
        );
    }

    renderProgressBar = (classes) => {
        return(
            <div style = {{height: "100%", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                <CircularProgressWithLabel value = {this.state.progressValue} />
            </div>
        );
    }

    renderCurrentView = (option, classes) => {
        switch(option){
            case "createDataBase":
                return (
                    <div style = {{height: "88vh"}}>
                        {this.renderUploadFileViewComponent(classes)}
                    </div>
                );
            case "progressBar":
                return (
                    <div style = {{height: "88vh"}}>
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
                {this.state.leadStatusList.length > 0 ? 
                    this.renderCurrentView(this.state.currentAction, classes)
                : null}
            </div>
        );
    }
}

export default withStyles(CreateBaseStyles)(CreateBaseScreen);