import * as _ from "underscore";
import { IArrayUtils } from "../definitions";

export class UnderscoreArrayUtils implements IArrayUtils {
  first<T>(items: T[], n: number) {
    return _.first(items, n)
  }

  find<T>(items: T[], func: (t: T, index: number) => boolean) {
    return _.find(items, func)
  }

  each<T>(items: T[], func: (t: T, index: number) => void) {
    _.each(items, func)
  }

  every<T>(items: T[], func: (t: T, index: number) => boolean): boolean {
    return _.every(items, func)
  }

  some<T>(items: T[], func: (t: T, index: number) => boolean): boolean {
    return _.some(items, func)
  }

  reduce<T, M>(items: T[], func: (m: M, t: T, index: number) => M, memo: M): M {
    return _.reduce<T, M>(items, func, memo)
  }

  reject<T>(items: T[], func: (t: T) => boolean): T[] {
    return _.reject(items, func)
  }

  filter<T>(items: T[], func: (t: T, index: number) => boolean): T[] {
    return _.filter(items, func)
  }

  range(start: number, stop: number, step: number = 1) {
    return _.range(start, stop, step)
  }
}