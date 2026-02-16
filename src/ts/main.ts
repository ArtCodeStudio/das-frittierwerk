import "@ribajs/types";
import '../scss/main.scss';
import { ready } from "@ribajs/utils/src/dom.js";

ready(async () => {
  const { coreModule, Riba } = await import("@ribajs/core");
  const { extrasModule } = await import("@ribajs/extras");
  const { bs5Module } = await import("@ribajs/bs5");
  const { DFWModule } = await import("./dfw.module.js");

  const riba = new Riba();
  const model = {};

  riba.module.register(coreModule.init());
  riba.module.register(extrasModule.init());
  riba.module.register(bs5Module.init());
  riba.module.register(DFWModule.init());

  riba.bind(document.body, model);
});
