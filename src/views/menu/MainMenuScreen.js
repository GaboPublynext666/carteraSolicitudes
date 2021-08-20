import React, {Component} from "react";

//Material Ui Components
import {
   Drawer,
   AppBar,
   Toolbar,
   List,
   CssBaseline,
   Divider,
   IconButton,
   Typography,
   ListItem,
   ListItemIcon,
   ListItemText
} from "@material-ui/core";

import {
   Menu,
   ChevronLeft,
   ChevronRight,
   ExitToApp,
} from "@material-ui/icons";

//React Router
import {
	BrowserRouter as Router,
	Switch,
	Route,
   Link
} from "react-router-dom";

import {withStyles} from "@material-ui/core/styles";
import clsx from 'clsx';

//Styles
import {MenuStyles} from "./MenuStyles";

//Modules
import CreateBaseScreen from "./createBase/CreateBaseScreen";
import ResumeMasterScreen from "./resumeMaster/ResumeMasterScreen";
import UploadAprovementBaseScreen from "./uploadAprovementBase/UploadAprovementBaseScreen";

import {getSessionFromStorage} from "../../generalMethods/generalMethods";

//Mocks
import {MenuItems} from "../../mocks/MenuItems";

class MainMenuScreen extends Component{
   constructor(props) {
      super(props);
      // No llames this.setState() aquí!
      this.state = {
         openDrawer: false,
         currentAction: null,
         currentMenuItem: "",
         currentSession: null,
      };
   }

   componentDidMount(){
      const getSession = getSessionFromStorage();
      if(getSession){
         this.setState({currentSession: JSON.parse(getSession)});
      }else{
         this.logoutCurrentSession();
      }
   }
   
   logoutCurrentSession = () => {
		localStorage.clear();
		sessionStorage.clear();
		this.props.history.push("/");
	}


   //Renderers
   render(){
      const { classes, theme } = this.props;
      return(
         <Router>
         <div className = {classes.root}>
            <CssBaseline />

            <AppBar
               position = "fixed"
               className = {clsx(classes.appBar, {
                  [classes.appBarShift]: this.state.openDrawer,
               })}
            >
               <Toolbar>
                  <IconButton
                     color = "inherit"
                     aria-label = "open drawer"
                     onClick = {() => this.setState({openDrawer: true})}
                     edge = "start"
                     className = {clsx(classes.menuButton, {
                        [classes.hide]: this.state.openDrawer,
                     })}
                  >
                     <Menu/>
                  </IconButton>

                  <Typography variant = "h6" noWrap>
                     {this.state.currentMenuItem}
                  </Typography>
               </Toolbar>
            </AppBar>

            <Drawer
               variant = "permanent"
               className = {clsx(classes.drawer, {
                  [classes.drawerOpen]: this.state.openDrawer,
                  [classes.drawerClose]: !this.state.openDrawer,
               })}
               classes = {{
                  paper: clsx({
                     [classes.drawerOpen]: this.state.openDrawer,
                     [classes.drawerClose]: !this.state.openDrawer,
                  }),
               }}
            >

               <div className = {classes.toolbar}>
                  <IconButton onClick = {() => this.setState({openDrawer: false})}>
                     {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
                  </IconButton>
               </div>

               <Divider />
               
               {MenuItems.map((currentModule, indexModule) => (
                  <div>
                     <List>
                        {currentModule.items.map((currentItem, indexItem) => (
                           <Link to = {currentItem.action}>
                              <ListItem button key={currentItem.name} onClick = {() => this.setState({currentMenuItem: currentItem.name})}>
                                 <ListItemIcon>{currentItem.icon}</ListItemIcon>
                                 <ListItemText primary = {currentItem.name} />
                              </ListItem>
                           </Link>
                        ))}
                        
                     </List>
                     <Divider />
                  </div>
               ))}
               <List>
                  <ListItem button key="butttonLogout" onClick = {() => this.logoutCurrentSession()}>
                     <ListItemIcon><ExitToApp/></ListItemIcon>
                     <ListItemText primary = "Cerrar Sesión" />
                  </ListItem>
               </List>
            </Drawer>

            <main className={classes.content}>
               <div className={classes.toolbar} />
               
               <Switch>			
                  <Route path = "/menu/create-base" exact component = {CreateBaseScreen}/>
                  <Route path = "/menu/resume-master" exact component = {ResumeMasterScreen}/>
                  <Route path = "/menu/base-to-aprove" exact component = {UploadAprovementBaseScreen}/>
               </Switch>
            </main>
         </div>
         </Router>
      );
   }
}

export default withStyles(MenuStyles, { withTheme: true })(MainMenuScreen);