import {ApiRest} from "./ApiRest";

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