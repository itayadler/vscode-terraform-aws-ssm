import { Memento } from "vscode";

export default class TFLocalResourceCache {
  private memento: Memento;

  constructor(memento: Memento) {
    this.memento = memento;
  }

  get<T>(key: string): T {
    return this.memento.get(key);
  }

  set<T>(key: string, value: T) {
    this.memento.update(key, value);
  }
}