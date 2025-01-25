import { defineCase } from "@/utils";
import assertLoose from "./lib/assertLoose";

export default defineCase({
  name: 'stnl - aot',
  tests: {
    assertLoose
  }
})
