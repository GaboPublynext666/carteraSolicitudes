export  const CreateBaseStyles = theme => ({
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },

    title: {
        color: "#000000",
        fontSize: "2vw",
        fontWeight: "bold",
        alignText: "center",
    },

    textFieldComponent: {
        marginTop: "2%",
    },

    createDataBaseButton: {
        textTransform: "none",
        backgroundColor: "#000000",
        color: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },

    uploadFileComponent: {
        marginTop: "1%",
        display: "flex",
        flexDirection: "row",
        width: "100%",
    },

    uploadFileInput: {
        display: "none"
    },

    uploadFileButton: {
        textTransform: "none",
        width: "10vw"
    },

    onCreateButton: {
        marginLeft: "auto",
        marginRight: "auto"
    },
    
    heading: {
        fontSize: theme.typography.pxToRem(15),
    },
});