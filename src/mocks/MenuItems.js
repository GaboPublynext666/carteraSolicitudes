import {
    CloudUpload,
    Storage,
    PostAdd
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
    {
        index: 1,
        name: "Second Module",
        items: [
            {
                index: 2,
                name: "Subir Base a Aprobar",
                action: "/menu/base-to-aprove",
                icon: <PostAdd/>,
            },
        ]
    },
]);