import "./jquery.js";
export default window.jQuery;
import database from "./modules/database.js";
import load from "./modules/load.js";
import add from "./modules/add.js";
import start from "./modules/start.js"
import change from "./modules/change.js"
change(false)
add(true)
load()
database()
start()
