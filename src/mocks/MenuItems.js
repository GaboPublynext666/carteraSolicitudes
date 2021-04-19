export const MenuItems = ([
    {
        index: 0,
        name: "First Module",
        items: [
            {
                index: 0,
                name: "Ingresar Base",
                action: "/menu/create-base",
                icon: "",
            },
            {
                index: 1,
                name: "Asignar Base",
                action: "assignBase",
                icon: "/menu",
            }
        ]
    },
    {
        index: 1,
        name: "Second Module",
        items: [
            {
                index: 200,
                name: "Login",
                action: "logout",
                icon: "/login",
            }
        ]
    }
]);