import { config } from "../../config";

export class ConfigService {
  private cfg = config;

  getConfig() {
    return this.cfg;
  }
}