import React, {Component} from "react";

import {
    Typography
} from "@material-ui/core";

//Strings
import {Strings} from "../../strings";

export default class CopyrightScreen extends Component {
    constructor(props) {
		super(props);
		
		//Status var
		this.state = {
            businessData: {}
        }
    }

    componentDidMount(){
    }

    render(){
        return(
            <Typography variant="h1" component="h1" style = {{marginTop: "auto", marginBottom: "auto", fontSize: "1.3vh", textAlign: "center", color: this.props.fontColor}}>    
                Copyright © Publynext {Strings.currentYear}.| {Strings.developedBy}.
            </Typography>
        );
    }
}