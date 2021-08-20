import React, {Component} from "react";

//Material Ui Components
import {
   Typography,
   TextField,
   Button,
   CircularProgress,
} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

//session Storage
import { getSessionFromStorage } from "../../../generalMethods/generalMethods";

//Style
import {UploadAprovementBaseStyle} from "./UploadAprovementBaseStyle";

//Sweet Alert
import swal from 'sweetalert';

//Mocks
import { AproveDataBaseItems } from "../../../mocks/DataBaseItems";

//Api Request
import { postInformationIntoAprovementDb } from "../../../apiRest/ApiMethods";
import { ApiRest } from "../../../apiRest/ApiRest";

//Library Excel
import * as XLSX from 'xlsx';

//Excel
import ReactExport from "react-export-excel";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class UploadAprovementBaseScreen extends Component{

   constructor(props) {
      super(props);
      // No llames this.setState() aquí!
      this.state = {
         currentSession: null,

         screenToShow: "",
         dataBaseFileName: "",
         dataBaseCsvFile: null,

         totalFailures: 0,
         totalSuccessful: 0,
         totalDuplicates: 0,
         totalProcessed: 0,
         totalNotProcessed: 0,
         totalToProcessed: 0,
      }
   }

   componentDidMount(){
      const getSession = getSessionFromStorage();
      if(getSession){
         this.setState({
            currentSession: JSON.parse(getSession),
            screenToShow: "main",
         });
      }else{
         this.logoutCurrentSession();
      }
   }

   componentDidUpdate(prevProps, prevState) {

      if(prevState.totalProcessed != this.state.totalProcessed && prevState.totalProcessed < this.state.totalProcessed && this.state.totalProcessed === 1){
         this.setState({screenToShow: "resume"});
      }

      if(prevState.totalProcessed != this.state.totalProcessed && prevState.totalProcessed < this.state.totalProcessed && this.state.totalProcessed >= this.state.totalToProcessed){
         //this.setState({screenToShow: "resume"});
         swal("Proceso Terminado", "Procesos Terminado con éxito", "success");
      }
   }

   resetScreen = () => {
      this.setState({
         screenToShow: "main",
         dataBaseFileName: "",
         dataBaseCsvFile: null,
         totalFailures: 0,
         totalSuccessful: 0,
         totalDuplicates: 0,
         totalProcessed: 0,
         totalNotProcessed: 0,
         totalToProcessed: 0,
      });
   }

   logoutCurrentSession = () => {
		localStorage.clear();
		sessionStorage.clear();
		this.props.history.push("/");
	}

   delayForRequest = (timePause) => {
      return new Promise( res => setTimeout(res, timePause) );
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

   onCreateDataBaseClick = () => {
      if(this.state.dataBaseFileName.length === 0 || this.state.dataBaseCsvFile === null){
         swal("Seleccione un archivo csv.", {icon: "error"});
         return;
      }

      this.processCsvFile();
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

   analizeCsvContent = (dataString) => {
      const dataStringLines = dataString.split(/\r\n|\n/);
      const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

      if( headers.length === 0 || (headers.length !== AproveDataBaseItems.length)){
         swal("Error en el formato del Archivo", "Números de Columnas no coinciden", "error");
         return;
      }

      let flagValidHeader = true;
      for (let headerIndex = 0; headerIndex < headers.length; headerIndex++) {
         if(headers[headerIndex] !== AproveDataBaseItems[headerIndex].name){
            flagValidHeader = false;
            swal("Error en el formato de Archivo", "Columna " + (headerIndex + 1) + ", nombre encontrado: " + headers[headerIndex] + ", nombre esperado: " + AproveDataBaseItems[headerIndex].name, "error");
            break;
         }   
      }

      if(!flagValidHeader){
         return;
      }
      

      let listData = [];

      let flagValidator = true;

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

               if(headers[j] === "CELULAR" && (d.length !== 10 || !d.startsWith("09"))){
                  swal("Error en Archivo", "Se encontró un número de celular inválido: " + d, "error");
                  flagValidator = false;
                  break;
               }
            }

            if(!flagValidHeader){
               break;
            }
            // remove the blank rows
            if (Object.values(obj).filter(x => x).length > 0) {
               listData.push(obj);
            }
         }
      }

      if(flagValidator){
         this.setState({screenToShow: "progressBar"});
         
         var currentDate = new Date();
         let aproveDataBaseName = "DB-" + String(currentDate.getDate()).padStart(2, '0') + "-" +String(currentDate.getMonth() + 1).padStart(2, '0') + "-" + currentDate.getFullYear() + " " + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
         
         this.setState({totalToProcessed: listData.length});
         let countRequest = 0;

         for(let indexList = 0; indexList < listData.length; indexList++){
            let currentItem = listData[indexList];
            if(currentItem["CELULAR"].length === 10 && currentItem["CELULAR"].startsWith("09")){
               const requestData = {
                  token: ApiRest.apiToken,
                  databaseName: aproveDataBaseName, 
                  phone: listData[indexList]["CELULAR"], 
                  clientIdentification: listData[indexList]["IDENTIFICACION"], 
                  clientName: listData[indexList]["CLIENTE"], 
                  clientType: listData[indexList]["CLIENTE_TIPO"], 
                  clientPlan: listData[indexList]["PLAN"], 
                  clientTariff: listData[indexList]["TARIFA_BASICA"], 
                  dischargeDate: listData[indexList]["FECHA_ALTA"], 
                  clientCity: listData[indexList]["CIUDAD"], 
                  created_by: this.state.currentSession.gestorId
                  //created_by: 0
               };
               postInformationIntoAprovementDb(requestData).then(async response => {
                  const data = await response.json();
                  if(data.header === "OK" && data.count === 1){
                     this.setState({
                        totalSuccessful: this.state.totalSuccessful + 1,
                        totalProcessed: this.state.totalProcessed + 1,
                     });
                  }else{
                     if(data.message.includes("Duplicate entry")){
                        this.setState({
                           totalDuplicates: this.state.totalDuplicates + 1,
                           totalProcessed: this.state.totalProcessed + 1,
                        });
                     }else{
                        this.setState({
                           totalFailures: this.state.totalFailures + 1,
                           totalProcessed: this.state.totalProcessed + 1,
                        });
                     }
                  }

                  countRequest = countRequest + 1;
                  if(countRequest == 40){
                     await this.delayForRequest(1500);
                     countRequest = 0;
                  }
               }).catch(async error => {
                  this.setState({
                     totalNotProcessed: this.state.totalNotProcessed + 1,
                     totalProcessed: this.state.totalProcessed + 1,
                  });
                  countRequest = countRequest + 1;
                  if(countRequest == 40){
                     await this.delayForRequest(1500);
                     countRequest = 0;
                  }
               });
            }else{
               this.setState({
                  totalFailures: this.state.totalFailures + 1,
                  totalProcessed: this.state.totalProcessed + 1,
               });
            }
         }
      }
   }

   //Renderers
   screenToRender = {
      main: (classes) => this.renderMain(classes),
      progressBar: (classes) => this.renderProgressBar(classes),
      resume: (classes) => this.renderResume(classes),
   }

   renderMain = (classes) => {
      return(
         <div className = {classes.aproveBaseContainer}>
            <h3>Subir Base a Aprobar</h3>
            <img src = "/movistar-logo.png" alt = "error-404" width = {200}/>

            <div className = {classes.uploadFileComponent}>
               <TextField 
                     style = {{marginRight: "2%",}}
                     fullWidth
                     size = "small"
                     variant = "outlined" 
                     size = "small"
                     value = {this.state.dataBaseFileName}
                     onChange = {(event) => this.setState({dataBaseFileName: event.target.value})}
                     label = "Nombre de Archivo"
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
                        Subir Archivo
                     </Button>
               </label>
            </div>

            <Button
                  className = {[classes.createDataBaseButton, classes.textFieldComponent, classes.onCreateButton]}
                  variant = "contained"
                  size = "small"
                  onClick = {() => this.onCreateDataBaseClick()}
               >
                  Guardar Base
               </Button>
         </div>
      );
   }

   renderProgressBar = (classes) => {
      return(
         <div className = {classes.notFoundContainer}>
            <CircularProgress color = "secondary" style = {{width: 100, height: 100}}/>
         </div>
      );
   }

   renderResume = (classes) => {
      return(
         <div className = {classes.aproveBaseContainer}>
            <h3 style = {{fontWeight: "bold"}}>Resumen de la Petición</h3>
            <div style = {{display: "flex", flexDirection: "column", width: "45vw", marginTop: 30}}>
               <div style = {{display: "flex", flexDirection: "row", width: "100%"}}>
                  <Typography style = {{flex: 1, fontSize: "1.5vw", fontWeight: "bold"}}>Total de Registros:</Typography>
                  <Typography style = {{fontSize: "1.5vw", fontWeight: "bold"}}>{this.state.totalToProcessed}</Typography>
               </div>

               <div style = {{display: "flex", flexDirection: "row", width: "100%", paddingLeft: 40, marginTop: 15}}>
                  <Typography style = {{flex: 1, fontSize: "1.3vw", fontWeight: "bold", color: "red"}}>Registros Ingresados:</Typography>
                  <Typography style = {{fontSize: "1.3vw", fontWeight: "bold", color: "red"}}>{this.state.totalSuccessful}</Typography>
               </div>

               <div style = {{display: "flex", flexDirection: "row", width: "100%", paddingLeft: 40, marginTop: 15}}>
                  <Typography style = {{flex: 1, fontSize: "1.3vw", fontWeight: "bold", color: "grey"}}>Registros Duplicados:</Typography>
                  <Typography style = {{fontSize: "1.3vw", fontWeight: "bold", color: "grey"}}>{this.state.totalDuplicates}</Typography>
               </div>

               <div style = {{display: "flex", flexDirection: "row", width: "100%", paddingLeft: 40, marginTop: 15}}>
                  <Typography style = {{flex: 1, fontSize: "1.3vw", fontWeight: "bold", color: "grey"}}>Registros Fallidos:</Typography>
                  <Typography style = {{fontSize: "1.3vw", fontWeight: "bold", color: "grey"}}>{this.state.totalFailures}</Typography>
               </div>

               <div style = {{display: "flex", flexDirection: "row", width: "100%", paddingLeft: 40, marginTop: 15}}>
                  <Typography style = {{flex: 1, fontSize: "1.3vw", fontWeight: "bold", color: "grey"}}>Registros No Procesados:</Typography>
                  <Typography style = {{fontSize: "1.3vw", fontWeight: "bold", color: "grey"}}>{this.state.totalNotProcessed}</Typography>
               </div>
            </div>

            <Button
               variant = "contained"
               component = "span"
               size = "small"
               onClick = {this.resetScreen}
               style = {{marginTop: "80px", marginLeft: "auto", marginRight: "auto", color: "white", backgroundColor: "black", width: "15vw"}}
               className = {classes.uploadFileButton}
               startIcon = {<CloudUploadIcon />}
            >
                  Subir Base Nuevamente
            </Button>
         </div>
      );
   }

   renderNotFound = (classes) => {
      return(
         <div className = {classes.notFoundContainer}>
            <img src = "/error-404.png" alt = "error-404" width = {300}/>
         </div>
      );
   }

   render(){
      const { classes } = this.props;
      return(
         <div className = {classes.mainContainer}>
            {this.screenToRender[this.state.screenToShow] ? 
               this.screenToRender[this.state.screenToShow](classes)
            : this.renderNotFound(classes)}
         </div>
      );
   }
}

export default withStyles(UploadAprovementBaseStyle)(UploadAprovementBaseScreen);