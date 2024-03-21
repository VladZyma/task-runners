import helloFromModule from "./modules/module";

import AirDatepicker from "air-datepicker";
import "air-datepicker/air-datepicker.css";

new AirDatepicker("#date");

console.log("Hello from index.js");
console.log(helloFromModule);
