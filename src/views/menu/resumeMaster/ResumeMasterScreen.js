import React, {Component} from "react";

import {
   Container,
   Typography,
} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

import {ResumeMasterStyles}from "./ResumeMasterStyle";

//Sweet Alert
import swal from 'sweetalert';

import {getSessionFromStorage} from "../../../generalMethods/generalMethods";
import {getMaterResume} from "../../../apiRest/ApiMethods";

class ResumeMasterScreen extends Component{
   constructor(props) {
      super(props);
      // No llames this.setState() aquí!
      this.state = {
         masterResume: null,
      };
   }

   componentDidMount(){
      const getSession = getSessionFromStorage();
      if(getSession){
         this.gettingMasterResumeAfterUploading();
      }else{
         this.logoutCurrentSession();
      }
   }

   logoutCurrentSession = () => {
      localStorage.clear();
      sessionStorage.clear();
      this.props.history.push("/");
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

   render(){
      const { classes, theme } = this.props;
      return(
         <Container className = {classes.container}>
            <Typography style = {{fontWeight: "bold", textAlign: "center"}}>Resumen Base Maestro</Typography>

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
               </div>
            : null}
         </Container>
      );
   }

}

export default withStyles(ResumeMasterStyles, { withTheme: true })(ResumeMasterScreen);