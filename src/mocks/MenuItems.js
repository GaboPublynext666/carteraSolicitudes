import {
    CloudUpload,
    Storage,
 } from "@material-ui/icons";
export const MenuItems = ([
    {
        index: 0,
        name: "First Module",
        items: [
            {
                index: 0,
                name: "Subir Cartera",
                action: "/menu/create-base",
                icon: <CloudUpload/>,
            },
            {
                index: 1,
                name: "Resumen Maestro",
                action: "/menu/resume-master",
                icon: <Storage />,
            },
        ]
    },
]);