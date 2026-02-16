import { RibaModule } from "@ribajs/core";
import * as binders from "./binders/index.js";
import * as components from "./components/index.js";

export const DFWModule: RibaModule = {
  binders,
  components,
  formatters: {},
  services: {},
  init() {
    return this;
  },
};

export default DFWModule;
