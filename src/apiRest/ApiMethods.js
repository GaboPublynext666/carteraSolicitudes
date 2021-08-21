import {ApiRest} from "./ApiRest";
var md5 = require('md5');

//Get Methods
export const getParametersForPortfolio = (parameterName) => fetch(ApiRest.apiHost + "/getmethods/getParametersSend.php?token=fa1e8f63ff72cf10c9ec00b5b7506666&parameter=" + parameterName).then(response => response.json());
export const getAllLeadStatus = () => fetch(ApiRest.apiHost + "/getmethods/GetAlllStatusLeads.php?token=fa1e8f63ff72cf10c9ec00b5b7506666").then(response => response.json());
export const getBlackListPhone = () => fetch(ApiRest.apiHost + "/getmethods/getBlackListPhone.php?token=fa1e8f63ff72cf10c9ec00b5b7506666").then(response => response.json());
export const getAuthentication = (userAvatar, userPassword) => fetch(ApiRest.apiHost + "/getmethods/solicitudes/getLogin.php?token=fa1e8f63ff72cf10c9ec00b5b7506666&userAvatar=" + userAvatar + "&userPassword=" + md5(userPassword)).then(response => response.json());
export const getMaterResume = () => fetch(ApiRest.apiHost + "/getmethods/getPortFolioResume.php?token=fa1e8f63ff72cf10c9ec00b5b7506666").then(response => response.json());

//Post Methods
export const postCreateCampaign = async(postData) => await fetch(ApiRest.apiHost + ApiRest.postCreateCampaign, 
   {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
   }
);

export const postInformationIntoCampaign = async(postData) => await fetch(ApiRest.apiHost + ApiRest.postInformationIntoCampaign, 
   {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
   }
);

export const getStatusList = async(postData) => await fetch(ApiRest.apiHost + ApiRest.getStatusList, 
   {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
   }
);

export const getMatchingAprovementBase = async(postData) => await fetch(ApiRest.apiHost + ApiRest.getMatchingAprovementBase, 
   {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
   }
);

export const postInformationIntoAprovementDb = async(postData) => await fetch(ApiRest.apiHost + ApiRest.postInformationIntoAprovementDb, 
   {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
   }
);