import React from "react";

//React Router
import {
	BrowserRouter as Router,
	Switch,
	Route,
	useHistory
} from "react-router-dom";

//Views
import LoginScreen from "./views/login/LoginScreen";
import MainMenuScreen from "./views/menu/MainMenuScreen"

const App = () =>{
	const history = useHistory();
	return (
		<div>
			<Router>
				<Switch>			
					<Route path = "/login" exact component = {LoginScreen}/>
					<Route path = "/menu" exact component = {MainMenuScreen}/>
					<Route path = "/" exact component = {LoginScreen}/>
				</Switch>
			</Router>
		</div>
	);
}

export default App;
