export const getSessionFromStorage = () => {
   const sessionFromSessionStorage = sessionStorage.getItem("authCredentials");
   if(sessionFromSessionStorage){
      return sessionFromSessionStorage;
   }

   const sessionFromLocalStorage = localStorage.getItem("authCredentials");
   if(sessionFromLocalStorage){
      return sessionFromLocalStorage;
   }

   return null;
}