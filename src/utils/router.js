
const routes = {
    404: "404",
    "/": "home",
    "/about": "about"
};

const Router = {
    init: () => {
        document.querySelectorAll("[nav-link]").forEach((link)=>{
            link.addEventListener('click', event => {
                event.preventDefault();
                const url = event.target.getAttribute("href");
                Router.nav(url);
            })
        })
        //when back button is hit we want to again call
        window.addEventListener('popstate', event => {
            Router.nav(event.state.route, false);
        })
        const initialRoute = window.location.pathname;
        Router.nav(initialRoute, false);
    },
    // add to history so we can track history of navs
    //The history.pushState method is part of HTML5 and is supported by all modern browsers. 
    // It allows you to push an entry to the browser’s history object, specifying a state object 
    // for passing data to the new history entry, a title, and the URL for the history entry.
    nav: async (route, addToHistory=true) => {
        if(addToHistory){
            history.pushState({route}, null, route);
        }
        Router.hideAllSections();
        const path = routes[route] || routes[404];
        document.getElementById(path).style.display = "block"

    },
    hideAllSections: () => {
        document.querySelectorAll("section").forEach((section) => {
            section.style.display = "none";
        });
    }
}


export default Router;
