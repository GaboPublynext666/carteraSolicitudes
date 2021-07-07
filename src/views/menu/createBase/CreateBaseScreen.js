import React, {Component} from "react";

//Material Ui Components
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    LinearProgress, 
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
    getBlackListPhone,
    getAllLeadStatus,
    postCreateCampaign,
    postInformationIntoCampaign, 
    getMaterResume
} from "../../../apiRest/ApiMethods";

//Mocks
import {DataBaseItems} from "../../../mocks/DataBaseItems";

import {getSessionFromStorage}from "../../../generalMethods/generalMethods";

//Excel
import ReactExport from "react-export-excel";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function CircularProgressWithLabel(props) {
    return (
        <Box position = "relative" display = "inline-flex">
            <CircularProgress style = {{marginLeft: "auto", marginRight: "auto", width: "15%", height: "15%"}} variant = "determinate" {...props} />
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
            phoneBlackList: [],
            controlPhoneList: [],
            currentSession: null,
            groupListStatus: {
                groupList: [
                    {
                        fieldName: "Lista Negra",
                        displayName: "Lista Negra",
                        status: false,
                        selected: 0,
                    },
                    {
                        fieldName: "Registros Nuevos", 
                        displayName: "Registros Nuevos", 
                        status: false,
                        selected: 0,
                    },
    
                    {
                        fieldName: "Ya Registrados",
                        displayName: "Ya Registrados",
                        status: false,
                        selected: 0,
                    }
                ],
                "Registros Nuevos": 0,
                "Lista Negra": 0,
                "Ya Registrados": 0,
            },

            //Parameters
            campaignList: [],
            originBaseList: [],
            offerList: [],
            phoneCompanyList: [],
            actionButtonsCsv: "",

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

            //Info To Upload
            totalToUpLoad: 0,
            selectedToUpload: 0,
            itemsUploadedSuccessfully: 0,
            itemsUploadedFailed: 0,

            //master Resume
            masterResume: null
        };
    }

    resetScreen = () =>{
        this.setState({
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
            phoneBlackList: [],
            controlPhoneList: [],
            currentSession: null,
            groupListStatus: {
                groupList: [
                    {
                        fieldName: "Lista Negra",
                        displayName: "Lista Negra",
                        status: false,
                        selected: 0,
                    },
                    {
                        fieldName: "Registros Nuevos", 
                        displayName: "Registros Nuevos", 
                        status: false,
                        selected: 0,
                    },
    
                    {
                        fieldName: "Ya Registrados",
                        displayName: "Ya Registrados",
                        status: false,
                        selected: 0,
                    }
                ],
                "Registros Nuevos": 0,
                "Lista Negra": 0,
                "Ya Registrados": 0,
            },

            //Parameters
            campaignList: [],
            originBaseList: [],
            offerList: [],
            phoneCompanyList: [],
            actionButtonsCsv: "",

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

            //Info To Upload
            totalToUpLoad: 0,
            selectedToUpload: 0,
            itemsUploadedSuccessfully: 0,
            itemsUploadedFailed: 0,

            //master Resume
            masterResume: null
        });

        this.onComponentDidMount();
    }

    onComponentDidMount = () => {
        const getSession = getSessionFromStorage();
        if(getSession){
            this.setState({currentSession: JSON.parse(getSession)});
            this.getListStatusFromLeads();
            this.gettinParameterFromApi("Campaña", "campaignList");
            this.gettinParameterFromApi("Operadora", "phoneCompanyList");
            this.gettinParameterFromApi("Origen Base", "originBaseList");
            this.gettinParameterFromApi("Oferta", "offerList");
            this.gettingPhoneBlackList();
            //this.gettingMasterResumeAfterUploading();
        }else{
            this.logoutCurrentSession();
        }
    }

    componentDidMount(){
        this.onComponentDidMount();
    }

    logoutCurrentSession = () => {
		localStorage.clear();
		sessionStorage.clear();
		this.props.history.push("/");
	}

    componentDidUpdate(prevProps, prevState) {
        if (prevState.uploadedInfoItems !== this.state.uploadedInfoItems && ((prevState.uploadedInfoItems < this.state.uploadedInfoItems) || this.state.uploadedInfoItems === 0)){
            let currentProgress = ((100 * (parseFloat( this.state.uploadedInfoItems) + 1))/parseFloat(this.state.originList.length));
            
            this.setState({
                progressValue: currentProgress,
            });

            if(prevState.uploadedInfoItems < this.state.uploadedInfoItems && this.state.uploadedInfoItems >= this.state.originList.length && this.state.actionButtonsCsv === 'matching'){
                this.setState({
                    currentAction: "reportMatching",
                    dataList: this.state.originList,
                })
            }
            
            if(prevState.uploadedInfoItems < this.state.uploadedInfoItems && this.state.uploadedInfoItems >= this.state.originList.length && this.state.actionButtonsCsv === 'uploadingPortfolio'){
                if((this.state.itemsUploadedFailed + this.state.itemsUploadedSuccessfully) === this.state.selectedToUpload){
                    this.gettingMasterResumeAfterUploading();
                }
                this.setState({
                    currentAction: "reportDataTable",
                    dataList: this.state.originList,
                })
            }
        }
    }

    gettingMasterResumeAfterUploading = () => {
        getMaterResume().then(data => {
            if(data.header === "OK" && data.count > 0){
                this.setState({
                    masterResume: data.body
                });
            }else{
                swal("No se pudo acceder a la Base Maestro", {icon: "error"});
                this.setState({
                    masterResume: null,
                });
            }
        })
        .catch(error => {
            swal("No se pudo acceder a la Base Maestro", {icon: "error"});
            this.setState({
                masterResume: null,
            });
        });
    }

    gettingPhoneBlackList = () => {
        getBlackListPhone().then(data => {
            if(data.header === "OK" && data.count > 0){
                let currentList = data.body;
                this.setState({
                    phoneBlackList: currentList
                });
            }else{
                swal("No se pudo acceder a la lista Negra", {icon: "error"});
                this.setState({
                    currentAction: "",
                    phoneBlackList: []
                });
            }
        })
        .catch(error => {
            swal("No se pudo acceder a la lista Negra", {icon: "error"});
            this.setState({
                currentAction: "",
                phoneBlackList: []
            });
        });
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
        var currentDate = new Date();
        let nombreCarteraAux = "cartera"+ " " + String(currentDate.getDate()).padStart(2, '0') + "-" +String(currentDate.getMonth() + 1).padStart(2, '0') + "-" + currentDate.getFullYear() + " " + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();

        this.setState({dataBaseName: nombreCarteraAux});

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

    onCheckedChangeGroupStatus = (event, index) => {
        let currentGroupListStatus = this.state.groupListStatus;
        currentGroupListStatus.groupList[index].status = event.target.checked;

        let sizeGroupList = 1;
        if(event.target.checked){
            sizeGroupList =  -1;
        }
        
        this.setState({
            groupListStatus: currentGroupListStatus, 
            selectedToUpload: this.state.selectedToUpload - (sizeGroupList * this.state.groupListStatus[this.state.groupListStatus.groupList[index].fieldName])
        });
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

    delayForRequest = (timePause) => {
        return new Promise( res => setTimeout(res, timePause) );
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
            currentAction: "progressBar2",
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

        let newGroupStatusList = this.state.groupListStatus;
        let urlApiToFecth = "http://solicitudes.claro.com.ec";
        //let urlApiToFecth = "http://10.10.100.74"; 
        await fetch(
            urlApiToFecth + "/api/procedures/getmethods/SearchLeadList.php",
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: "fa1e8f63ff72cf10c9ec00b5b7506666",
                    cellPhoneList: listPhoneString
                })
            }
        ).then(async response => {
            const dataPhoneList = await response.json();
            if(dataPhoneList.header === "OK"){
                const currentPhoneBlackList = this.state.phoneBlackList;
                let currentLeadStatusList = this.state.leadStatusList;
                this.setState({actionButtonsCsv: 'matching'});

                for(let indexList = 0; indexList < list.length; indexList++){
                    let indexBlackList = currentPhoneBlackList.findIndex(currentBlackList => currentBlackList.phone === list[indexList]["CELULAR"]);

                    if(indexBlackList >= 0){
                        newGroupStatusList["Lista Negra"] = newGroupStatusList["Lista Negra"] + 1;
                        
                        list[indexList]["action"] = 0;
                        list[indexList]["accion"] = "";
                        list[indexList]["message"] = "Número se encuentra en la lista Negra.";
                    }else{
                        let indexCategoryArray = dataPhoneList.body.findIndex(currentBody => currentBody.number_assigned === list[indexList]["CELULAR"]);
                        if(indexCategoryArray >= 0){
                            newGroupStatusList["Ya Registrados"] = newGroupStatusList["Ya Registrados"] + 1;
                            if(dataPhoneList.body[indexCategoryArray].leadStatus === 'Regestión' || dataPhoneList.body[indexCategoryArray].leadStatus.length === 0){
                                dataPhoneList.body[indexCategoryArray].leadStatus = 'No Llamado';
                            }
                            
                            list[indexList]["action"] = 0;
                            list[indexList]["accion"] = "";
                            list[indexList]["message"] = dataPhoneList.body[indexCategoryArray].number_assigned + " se encuentra registrado como lead con el estado " + dataPhoneList.body[indexCategoryArray].leadStatus + " y campaña " + dataPhoneList.body[indexCategoryArray].campaign;

                            let flagValue = true;
                            
                            for(let indexType = 0; indexType < currentLeadStatusList.length; indexType++){
                                let indexStatus = currentLeadStatusList[indexType].statusList.findIndex(currentStatus => currentStatus.estado_final === dataPhoneList.body[indexCategoryArray].leadStatus);
                                if(indexStatus >= 0){
                                    if(dataPhoneList.body[indexCategoryArray].leadStatus === "Solicitud Ingresada" && dataPhoneList.body[indexCategoryArray].requestStatus  !== "Solicitud Ingresada"){
                                        let indexStatusForType = currentLeadStatusList[indexType].statusList.findIndex(currentStatus => currentStatus.estado_final === dataPhoneList.body[indexCategoryArray].requestTypeStatus);
                                        if(indexStatusForType < 0){
                                            currentLeadStatusList[indexType].statusList.push({
                                                estado_final: dataPhoneList.body[indexCategoryArray].requestTypeStatus,
                                                size: 0,
                                                selected: 0,
                                                status: false,
                                            });
                                            indexStatus =  currentLeadStatusList[indexType].statusList.length - 1;
                                        }else{
                                            indexStatus = indexStatusForType;
                                        }

                                        dataPhoneList.body[indexCategoryArray].leadStatus = dataPhoneList.body[indexCategoryArray].requestTypeStatus;
                                    }


                                        flagValue = false;
                                        if(!currentLeadStatusList[indexType]["count"]){
                                            currentLeadStatusList[indexType]["count"] = 0;
                                        }
                                        
                                        currentLeadStatusList[indexType].count = currentLeadStatusList[indexType].count + 1;

                                        if(!currentLeadStatusList[indexType].statusList[indexStatus]["size"]){
                                            currentLeadStatusList[indexType].statusList[indexStatus]["size"] = 0;
                                        }

                                        currentLeadStatusList[indexType].statusList[indexStatus]["size"] = currentLeadStatusList[indexType].statusList[indexStatus]["size"] + 1;
                                }
                            }

                        }else{
                            newGroupStatusList["Registros Nuevos"] = newGroupStatusList["Registros Nuevos"] + 1;
                            this.setState({selectedToUpload: this.state.selectedToUpload + 1});
                            let indexGroupList = newGroupStatusList.groupList.findIndex(currentGroupList => currentGroupList.fieldName === "Registros Nuevos");
                            if(indexGroupList > 0){
                                newGroupStatusList.groupList[indexGroupList].status = true;
                            }

                            list[indexList]["action"] = 0;
                            list[indexList]["accion"] = "";
                            list[indexList]["message"] = "Número nuevo, no se encuentra en la master.";
                        }
                    }

                        this.setState({
                            uploadedInfoItems: this.state.uploadedInfoItems + 1,
                            originList: list
                        });
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
                    dataHeaders2: columns2,
                    groupListStatus: newGroupStatusList,
                    controlPhoneList: dataPhoneList,
                    totalToUpLoad: list.length,
                    leadStatusList: currentLeadStatusList,
                });

            }else{
                swal("error", dataPhoneList.messgae, "error");   
            }
        }).catch(error => {
            swal("error", "No se pudo conectar al hosting", "error");
        });
    }

    updatingCurrentMaster = () => {
        this.setState({
            currentAction: "progressBar",
            uploadedInfoItems: 0,
            actionButtonsCsv: 'uploadingPortfolio',
        });

        const requestOptions = {
            token: ApiRest.apiToken,
            databaseName: this.state.dataBaseName, 
            comesFrom: "CARTERA", 
            campaignName: this.state.selectedCampaignList.Name, 
            originBase: this.state.selectedOriginBaseList.Name, 
            offerName: this.state.selectedOfferList.Name, 
            phoneCompany: this.state.selectedPhoneCompanyList.Name, 
            channelName: "Base de Datos", 
            creatorIndex: this.state.currentSession.gestorId
            //creatorIndex: 0
        };

        let list = this.state.originList;
        let dataPhoneList = this.state.controlPhoneList;
        
        postCreateCampaign(requestOptions).then(async response => {
            const dataCampaign = await response.json();
            if(dataCampaign.header === "OK" && dataCampaign.count === 1){
                let currentLeadStatusList = this.state.leadStatusList;
                let countRequest = 0;
                const currentPhoneBlackList = this.state.phoneBlackList;
                for(let indexList = 0; indexList < list.length; indexList++){
                    let flagSaveClientInfo = true;
                    let indexBlackList = currentPhoneBlackList.findIndex(currentBlackList => currentBlackList.phone === list[indexList]["CELULAR"]);
                    if(indexBlackList >= 0){
                        list[indexList]["action"] = 0;
                        list[indexList]["accion"] = "No Ingresado";

                        flagSaveClientInfo = false;

                        let indexGroupStatus = this.state.groupListStatus.groupList.findIndex(currentGroup => currentGroup.fieldName === "Lista Negra");
                        
                        if(indexGroupStatus > 0){
                            if(this.state.groupListStatus.groupList[indexGroupStatus].status){
                                list[indexList]["action"] = 1;
                                list[indexList]["accion"] = "Información Ingresada";
                                flagSaveClientInfo = true;
                            }
                        }
                    }else{
                        let indexCategoryArray = dataPhoneList.body.findIndex(currentBody => currentBody.number_assigned === list[indexList]["CELULAR"]);
                        flagSaveClientInfo = false;
                        if(indexCategoryArray >= 0){
                            list[indexList]["action"] = 0;
                            list[indexList]["accion"] = "No Ingresado";

                            for(let indexType = 0; indexType < currentLeadStatusList.length; indexType++){
                                let indexStatus = currentLeadStatusList[indexType].statusList.findIndex(currentStatus => currentStatus.estado_final === dataPhoneList.body[indexCategoryArray].leadStatus);
                                if(indexStatus >= 0){
                                    if(currentLeadStatusList[indexType].statusList[indexStatus].status){
                                        list[indexList]["action"] = 1;
                                        list[indexList]["accion"] = "Información Ingresada";
                                        flagSaveClientInfo = true;
                                    }
                                    break;
                                }
                            }
                        }else{
                            list[indexList]["action"] = 0;
                            list[indexList]["accion"] = "No Ingresado";

                            let indexGroupStatus = this.state.groupListStatus.groupList.findIndex(currentGroup => currentGroup.fieldName === "Registros Nuevos");
                            if(indexGroupStatus > 0){
                                if(this.state.groupListStatus.groupList[indexGroupStatus].status){
                                    list[indexList]["action"] = 1;
                                    list[indexList]["accion"] = "Información Ingresada";
                                    flagSaveClientInfo = true;
                                }
                            }
                        }
                    }

                    if(flagSaveClientInfo){
                        
                        this.setState({
                            uploadedInfoItems: this.state.uploadedInfoItems + 1,
                            originList: list
                        });

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
                            creator: this.state.currentSession.gestorId
                            //creator: 0
                        };

                        postInformationIntoCampaign(requestData).then(async response => {
                            const data = await response.json();
                            if(data.header === "OK" && data.count === 1){
                                this.setState({itemsUploadedSuccessfully: this.state.itemsUploadedSuccessfully + 1});
                                list[indexList]["action"] = 1;
                                list[indexList]["accion"] = "Información Ingresada";
                            }else{
                                this.setState({itemsUploadedFailed: this.state.itemsUploadedFailed + 1});
                                list[indexList]["action"] = 0;
                                list[indexList]["accion"] = "No ingresado";
                                list[indexList]["message"] = "No se pudo Ingresar el recurso. " + list[indexList]["message"];
                            }
                            this.setState({
                                uploadedInfoItems: this.state.uploadedInfoItems + 1,
                                originList: list
                            });

                            countRequest = countRequest + 1;
                            if(countRequest == 40){
                                await this.delayForRequest(1500);
                                countRequest = 0;
                            }
                        }).catch(async error => {
                            list[indexList]["action"] = 0;
                            list[indexList]["accion"] = "No ingresado";
                            list[indexList]["message"] = "Error al acceder a la api. " + list[indexList]["message"];
                            this.setState({
                                uploadedInfoItems: this.state.uploadedInfoItems + 1,
                                originList: list,
                                itemsUploadedFailed: this.state.itemsUploadedFailed + 1,
                            });
                            countRequest = countRequest + 1;
                            if(countRequest == 40){
                                await this.delayForRequest(1500);
                                countRequest = 0;
                            }
                        });
                    }else{
                        this.setState({
                            uploadedInfoItems: this.state.uploadedInfoItems + 1,
                            originList: list
                        });
                    }
                }
            }else{
                swal("Error 2", dataCampaign.message, "error");
            }
        })
        .catch(error => {
            swal("Error 1", "No se pudo acceder al recurso remoto", "error");
        });
    }

    onExpandAccordionEvent = (panel, nameFlagAccordion) => (event, isExpanded) => {
        this.setState({[nameFlagAccordion]: isExpanded ? panel : false});
    }

    onChenckedGroupListStatus = (event, indexGroup) => {
        let currentGroupListStatus = this.state.groupListStatus;
        currentGroupListStatus.groupList[indexGroup].status = event.target.checked;

        let currentListStatus = this.state.leadStatusList;
        for(let i = 0; i < currentListStatus.length; i++){
            let flagValueSize = 0;
            let flagSelected = 0;
            for(let j = 0; j < currentListStatus[i].statusList.length; j++){
                if(currentListStatus[i].statusList[j].size > 0){
                    if(event.target.checked){
                        flagValueSize = flagValueSize + 1;
                        flagSelected = flagSelected + currentListStatus[i].statusList[j].size;
                    }
                    currentListStatus[i].statusList[j].status = event.target.checked;
                }else{
                    currentListStatus[i].statusList[j].status = false;
                }
            }

            currentListStatus[i].size = flagValueSize;
            currentListStatus[i].selected = flagSelected;
        }

        let sizeGroupList = 1;
        let rowsToUpload = 0;
        if(event.target.checked){
            sizeGroupList =  -1;
            rowsToUpload = currentGroupListStatus[currentGroupListStatus.groupList[indexGroup].fieldName];
            currentGroupListStatus.groupList[indexGroup].selected = currentGroupListStatus[currentGroupListStatus.groupList[indexGroup].fieldName];
        }else{
            rowsToUpload = currentGroupListStatus.groupList[indexGroup].selected;
            currentGroupListStatus.groupList[indexGroup].selected = 0;
        }

        this.setState({
            leadStatusList: currentListStatus,
            groupListStatus: currentGroupListStatus,
            selectedToUpload: this.state.selectedToUpload - (sizeGroupList * rowsToUpload)
        });
    }

    onCheckedTypeStatus = (event, indexType, indexGroup) => {
        let currentListStatus = this.state.leadStatusList;

        let availaibleType = 0;
        let rowsSelectedToUpload = 0;
        for(let i = 0; i < currentListStatus[indexType].statusList.length; i++){
            if(currentListStatus[indexType].statusList[i].size > 0){
                availaibleType = availaibleType + 1;
                rowsSelectedToUpload = rowsSelectedToUpload + currentListStatus[indexType].statusList[i].size;
                currentListStatus[indexType].statusList[i].status = event.target.checked;
            }else{
                currentListStatus[indexType].statusList[i].status = false;
            }
        }

        let currentGroupListStatus = this.state.groupListStatus;

        let sizeGroupList = 1;
        let updateSelectedRows = 0;

        if(event.target.checked){
            sizeGroupList =  -1;
            currentListStatus[indexType].size = availaibleType;
            currentListStatus[indexType].selected = rowsSelectedToUpload;
            currentGroupListStatus.groupList[indexGroup].status = event.target.checked;
            updateSelectedRows = currentListStatus[indexType].selected;
            
        }else{
            updateSelectedRows = currentListStatus[indexType].selected;
            currentListStatus[indexType].size = 0;
            currentListStatus[indexType].selected = 0;
            let flagValueGroup = false;
            for(let x = 0; x < currentListStatus.length; x++){
                if(currentListStatus[x].size > 0){
                    flagValueGroup = true;
                    break;
                }
            }

            currentGroupListStatus.groupList[indexGroup].status = flagValueGroup;
        }

        currentGroupListStatus.groupList[indexGroup].selected =  currentGroupListStatus.groupList[indexGroup].selected - (sizeGroupList * updateSelectedRows);

        this.setState({
            leadStatusList: currentListStatus,
            groupListStatus: currentGroupListStatus,
            selectedToUpload: this.state.selectedToUpload - (sizeGroupList * updateSelectedRows)
        });
    }

    onCheckedStatusItem = (event, indexType, indexStatus, indexGroup) => {
        let currentListStatus = this.state.leadStatusList;

        currentListStatus[indexType].statusList[indexStatus].status = event.target.checked;

        let flagValue = 1;
        if(event.target.checked){
            flagValue = -1;
        }
        currentListStatus[indexType].size = currentListStatus[indexType].size - flagValue;
        currentListStatus[indexType].selected = currentListStatus[indexType].selected - (flagValue * currentListStatus[indexType].statusList[indexStatus].size);

        let currentGroupListStatus = this.state.groupListStatus;

        let flagValueGroup = false;
        for(let x = 0; x < currentListStatus.length; x++){
            if(currentListStatus[x].size > 0){
                flagValueGroup = true;
                break;
            }
        }

        currentGroupListStatus.groupList[indexGroup].status = flagValueGroup;
        currentGroupListStatus.groupList[indexGroup].selected = currentGroupListStatus.groupList[indexGroup].selected - (flagValue * currentListStatus[indexType].statusList[indexStatus].size);

        this.setState({
            leadStatusList: currentListStatus,
            groupListStatus: currentGroupListStatus,
            selectedToUpload: this.state.selectedToUpload - (flagValue * currentListStatus[indexType].statusList[indexStatus].size)
        });
    }


    //Renders
    renderUploadFileViewComponent = (classes) => {
        return(
            <div style = {{width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignContent: "center"}}>
                <Container className = {classes.container}>
                    <Typography  className = {classes.title}>{CreateBaseStrings.title}</Typography>

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
                            onChange = {(event, newValue) => this.setState({selectedOfferList: newValue})}
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
                </Container>
                
                <Button
                    className = {[classes.createDataBaseButton, classes.textFieldComponent, classes.onCreateButton]}
                    variant = "contained"
                    size = "small"
                    onClick = {() => this.onCreateDataBaseClick()}
                >
                    {CreateBaseStrings.createMatchingDataBaseButtonText}      
                </Button>
            </div>
        );
    }

    renderFilterLeads = (classes) => {
        return(
            <div style = {{width: "100%", display: "flex", flexDirection: "column"}}>
                <Typography style = {{fontWeight: "bold", textAlign: "center"}}>Resumen del Matching</Typography>

                {this.state.groupListStatus.groupList.map((currentGroupStatus, indexGroupStatus) => (
                    indexGroupStatus + 1 >= this.state.groupListStatus.groupList.length ? 
                        <Accordion expanded = {true} style = {{backgroundColor: this.props.accordionTitleBackgroundColor, color: this.props.accordionTitleTextColor, padding: 0, marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: indexGroupStatus > 0 ? "1vh" : 0}}>
                            <CustomAccordionSummary
                                aria-controls="panel1bh-content">

                                <FormControlLabel
                                    style = {{color:'black', marginTop: "8px"}}
                                    size = "small"
                                    control = {
                                        <CustomCheckBox 
                                            value = "checked"
                                            checked = {this.state.groupListStatus.groupList[indexGroupStatus].status}
                                            onChange = {(event) => this.onChenckedGroupListStatus(event, indexGroupStatus)}
                                            disabled = {this.state.groupListStatus[currentGroupStatus.fieldName] > 0 ? false : true }
                                        />
                                    }
                                    label = {<Typography style = {{fontWeight: "bold"}}>{currentGroupStatus.displayName + " ( " + this.state.groupListStatus.groupList[indexGroupStatus].selected + " / " + this.state.groupListStatus[currentGroupStatus.fieldName] + " )"}</Typography>}
                                />
                            </CustomAccordionSummary>

                            <AccordionDetails style = {{backgroundColor: this.props.accordionSubTitleContentBackgroundColor, display: "flex", flexDirection: "column", paddingLeft: "3%", paddingRight: "2%"}}>
                                {this.state.leadStatusList.map((currentType, indexType) => (
                                    <Accordion expanded = {true} onChange = {this.onExpandAccordionEvent(currentType.tipo_llamada, "expandedAccordion")} style = {{backgroundColor: this.props.accordionTitleBackgroundColor, color: this.props.accordionTitleTextColor, padding: 0, marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: indexType > 0 ? "1vh" : 0}}>
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
                                                        onChange = {(event) => this.onCheckedTypeStatus(event, indexType, indexGroupStatus)}
                                                        disabled = {currentType.count > 0 ? false : true }
                                                    />
                                                }
                                                label = {<Typography  style = {{fontWeight: "bold", fontSize: "15px"}}>{currentType.tipo_llamada + " ( " + this.state.leadStatusList[indexType].selected  + " / " + currentType.count + " )"}</Typography>}
                                            />
                                        </CustomAccordionSummary>

                                        <AccordionDetails style = {{backgroundColor: this.props.accordionSubTitleContentBackgroundColor}}>
                                            {this.renderStatusComponent(currentType.statusList, 4, indexType, indexGroupStatus)}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    :   <Accordion expanded = {true} style = {{backgroundColor: this.props.accordionTitleBackgroundColor, color: this.props.accordionTitleTextColor, padding: 0, marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: indexGroupStatus > 0 ? "1vh" : 0}}>
                            <CustomAccordionSummary
                                aria-controls="panel1bh-content">

                                <FormControlLabel
                                    style = {{color:'black', marginTop: "8px"}}
                                    size = "small"
                                    control = {
                                        <CustomCheckBox 
                                            value = "checked"
                                            checked = {this.state.groupListStatus.groupList[indexGroupStatus].status}
                                            onChange = {(event) => this.onCheckedChangeGroupStatus(event, indexGroupStatus)}
                                            disabled = {this.state.groupListStatus[currentGroupStatus.fieldName] > 0 ? false : true }
                                        />
                                    }
                                    label = {<Typography style = {{fontWeight: "bold"}}>{currentGroupStatus.displayName + " (" + this.state.groupListStatus[currentGroupStatus.fieldName] + ")"}</Typography>}
                                />
                            </CustomAccordionSummary>
                        </Accordion>
                ))}

                <div style = {{width: "100%", display: "flex", marginTop: "10px", flexDirection: "row"}}>
                    <div style = {{display: "flex", flexDirection: "row"}}>
                        <Typography style = {{fontWeight: "bold", fontSize: "13px"}}>Total: </Typography>
                        <Typography style = {{marginLeft: "20px", fontSize: "13px"}}>{this.state.totalToUpLoad + ","}</Typography>
                    </div>
                    <div style = {{display: "flex", flexDirection: "row", marginLeft: "30px", flex: 1}}>
                        <Typography style = {{fontWeight: "bold", fontSize: "13px"}}>Listos para subir: </Typography>
                        <Typography style = {{marginLeft: "20px", fontSize: "13px"}}>{this.state.selectedToUpload}</Typography>
                    </div>

                    {this.state.selectedToUpload > 0 ?
                        <Button
                            className = {[classes.createDataBaseButton, classes.onCreateButton]}
                            variant = "contained"
                            size = "small"
                            onClick = {() => this.updatingCurrentMaster()}
                        >
                            {CreateBaseStrings.createDataBaseButtonText}      
                        </Button>
                    : null}
                    
                </div>
            </div>
        );
    }

    renderStatusComponent = (statusArrayList, eachIndex, indexType, indexGroupStatus) => {
        let arrayToRender = [];
        for(let i = 0; i < statusArrayList.length; i = i + eachIndex){
            let endIndex = i + eachIndex;
            let lastFlex= 1;
            if(endIndex >= statusArrayList.length){
                lastFlex = lastFlex + (eachIndex - (statusArrayList.length - i));
            }

            arrayToRender.push(this.renderEachStatus(i, endIndex, statusArrayList, indexType, lastFlex, indexGroupStatus));
        }

        return(
            <div style = {{width: "100%", display: "flex", flexDirection: "column", marginLeft: "3%"}}>
                {arrayToRender}
            </div>
        );
    }

    renderEachStatus(startIndex, endIndex, statusArrayList, indexType, lastFlex, indexGroupStatus){
        let arrayToRender = [];

        for(let index = startIndex; index < endIndex; index++){
            if(index < statusArrayList.length){
                arrayToRender.push(
                    <FormControlLabel
                        style={{color:'black', flex: index + 1 === statusArrayList.length ? lastFlex : 1 }}
                        control = {
                            <CustomCheckBox 
                                value = "checked"
                                checked = {this.state.leadStatusList[indexType].statusList[index].status}
                                onChange = {(event) => this.onCheckedStatusItem(event, indexType, index, indexGroupStatus)}
                                disabled = {statusArrayList[index].size > 0 ? false : true }
                            />
                        }
                        label = {<Typography style = {{fontSize: "12px"}}>{statusArrayList[index].estado_final + " (" + statusArrayList[index].size + " )"}</Typography>}
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
                <CircularProgress style = {{height: "150px", width: "150px"}} color="black" />
            </div>
        );
    }

    renderCircularProgressBar = (classes) => {
        return(
            <div style = {{height: "100%", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                <CircularProgress style = {{height: "150px", width: "150px"}} color="black" />
            </div>
        );
    }

    renderMasterResume = (classes) => {
        return(
            <Container className = {classes.container}>
                <Typography style = {{fontWeight: "bold", textAlign: "center"}}>Resumen Base Maestro</Typography>
                <div style = {{display: "flex", flexDirection: "row", width: "600px", marginTop: "20px"}}>
                    <Typography style = {{fontWeight: "bold", flex: 1}}>Registros Ingresados/Actualizados:</Typography>
                    <Typography style = {{fontWeight: "bold"}}>{this.state.itemsUploadedSuccessfully} de {this.state.selectedToUpload}</Typography>
                </div>
                {this.state.masterResume !== null ?
                    <div style = {{width: "600px", display: "flex", flexDirection: "column", marginTop: "20px"}}> 
                        {this.state.masterResume.comesFromResume.map((comesFrom, index) => (
                            <div style = {{display: "flex", flexDirection: "column", width: "100%", marginTop: "15px"}}>
                                <div style = {{display: "flex", flexDirection: "row", width: "100%"}}>
                                    <Typography style = {{fontWeight: "bold", flex: 1, }}>Registros de {comesFrom.comesFrom}:</Typography>
                                    <Typography style = {{fontWeight: "bold"}}>{comesFrom.totalComesFrom}</Typography>
                                </div>
                                <div style = {{display: "flex", flexDirection: "column", width: "100%", paddingLeft: "50px"}}>
                                    {this.state.masterResume.statusAssigmentResume.map((currentStatus, indexStatus) => (
                                        <div style = {{display: "flex", flexDirection: "row", width: "100%"}}>
                                            <Typography style = {{flex: 1, color: "grey"}}>{comesFrom.comesFrom} {currentStatus.statusAssigment}:</Typography>
                                            <Typography style = {{color: "grey"}}>{this.state.masterResume.detailedResume[comesFrom.comesFrom][currentStatus.statusAssigment].totalResume}</Typography>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div style = {{display: "flex", flexDirection: "column", width: "100%", marginTop: "15px"}}>
                            <div style = {{display: "flex", flexDirection: "row", width: "100%"}}>
                                <Typography style = {{fontWeight: "bold", flex: 1,}}>Total de Registros:</Typography>
                                <Typography style = {{fontWeight: "bold"}}>{this.state.masterResume.totalResume}</Typography>
                            </div> 

                            <div style = {{display: "flex", flexDirection: "column", width: "100%", paddingLeft: "50px"}}>
                                {this.state.masterResume.statusAssigmentResume.map((currentStatus, indexStatus) => (
                                    <div style = {{display: "flex", flexDirection: "row", width: "100%"}}>
                                        <Typography style = {{flex: 1, color: "grey"}}>Total {currentStatus.statusAssigment}:</Typography>
                                        <Typography style = {{color: "grey"}}>{currentStatus.totalStatusAssigment}</Typography>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button
                            variant = "contained"
                            component = "span"
                            size = "small"
                            onClick = {this.resetScreen}
                            style = {{marginTop: "80px", marginLeft: "auto", marginRight: "auto", color: "white", backgroundColor: "black"}}
                            className = {classes.uploadFileButton}
                            startIcon = {<CloudUploadIcon />}
                        >
                            Subir Base Nuevamente
                        </Button>
                    </div>
                : null}
                
            </Container>
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
            case "progressBar2":
                return (
                    <div style = {{height: "88vh"}}>
                        {this.renderCircularProgressBar(classes)}
                    </div>
                );
            case "reportMatching": 
                return(
                    this.renderFilterLeads(classes)
                );
            case "reportDataTable":
                return (
                    this.renderMasterResume(classes)
                );
            default:
                return null;
        }
    }

    render(){
        const { classes } = this.props;
        return(
            <div>
                {this.state.leadStatusList.length > 0 && this.state.currentSession !== null ? 
                    this.renderCurrentView(this.state.currentAction, classes)
                : null}
            </div>
        );
    }
}

export default withStyles(CreateBaseStyles)(CreateBaseScreen);