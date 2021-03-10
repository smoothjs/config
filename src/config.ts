import { join } from 'path'
import { existsSync, readFileSync } from 'fs'
import { Singleton } from 'typescript-ioc'
import { ValueType, ValueStringType } from './utils'

@Singleton
export class Config {
  private yaml: any

  private config: { [key: string]: any } | null = null

  private cachedConfig: Map<string, string | number | boolean> = new Map()

  public get<T extends ValueStringType>(
    key: string,
    defaultValue?: ValueType<T>
  ): ValueType<T> | undefined {
    const value = this.readConfigValue(key)

    if (value === undefined) {
      return defaultValue
    }

    return value
  }

  public set(key: string, value: string | number | boolean): void {
    this.cachedConfig.set(key, value)
  }

  public remove(key: string): void {
    this.cachedConfig.delete(key)
  }

  public clearCache() {
    this.config = null
    this.cachedConfig.clear()
  }

  private readJSON(path: string): { [key: string]: any } {
    if (!existsSync(path)) {
      return {}
    }

    const fileContent = readFileSync(path, 'utf8')
    return JSON.parse(fileContent)
  }

  private readYAML(path: string): { [key: string]: any } {
    if (!existsSync(path)) {
      return {}
    }

    const yaml = this.getYAMLInstance()
    if (!yaml) {
      console.log(`Impossible to read ${path}. The package "yamljs" is not installed.`)
      return {}
    }

    const fileContent = readFileSync(path, 'utf8')
    return yaml.parse(fileContent)
  }

  private readJS(path: string): { [key: string]: any } {
    if (!existsSync(path)) {
      return {}
    }

    return require(join(process.cwd(), path))
  }

  private readConfigValue(key: string): any {
    if (this.cachedConfig.has(key)) {
      return this.cachedConfig.get(key)
    }

    if (this.config === null) {
      this.config = [
        this.readJS('smoothjs.js'),
        this.readYAML('smoothjs.yml'),
        this.readJSON('smoothjs.json'),
        this.readJS(`${process.env.NODE_ENV || 'development'}.js`),
        this.readYAML(`${process.env.NODE_ENV || 'development'}.yml`),
        this.readJSON(`${process.env.NODE_ENV || 'development'}.json`),
      ].reduce((config1, config2) => this.mergeDeep(config1, config2))
    }

    const properties = key.split('.')
    let result: any = this.config
    for (const property of properties) {
      result = result[property]
      if (result === undefined) {
        break
      }
    }

    return result
  }

  private mergeDeep(
    target: { [key: string]: any },
    source: { [key: string]: any }
  ): { [key: string]: any } {
    function isObject(o: any): o is { [key: string]: any } {
      return typeof o === 'object' && o !== null
    }

    for (const key in source) {
      if (isObject(target[key]) && isObject(source[key])) {
        this.mergeDeep(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }

    return target
  }

  private getYAMLInstance(): false | any {
    if (this.yaml === false) {
      return false
    }

    try {
      this.yaml = require('yamljs')
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err
      }
      this.yaml = false
    }
    return this.yaml
  }
}
