import {ApiRest} from "./ApiRest";

//Get Methods
export const getParametersForPortfolio = (parameterName) => fetch("http://solicitudes.claro.com.ec/api/procedures/getmethods/getParametersSend.php?token=fa1e8f63ff72cf10c9ec00b5b7506666&parameter=" + parameterName).then(response => response.json());
export const getAllLeadStatus = () => fetch("http://solicitudes.claro.com.ec/api/procedures/getmethods/GetAlllStatusLeads.php?token=fa1e8f63ff72cf10c9ec00b5b7506666").then(response => response.json());

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