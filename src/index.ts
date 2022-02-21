import _ from 'lodash'
import { OnlyInstantiableByContainer, Singleton } from 'typescript-ioc'

@OnlyInstantiableByContainer
@Singleton
export class Config {
    constructor(private config: object = {}) {}

    public all() {
        return this.config
    }

    public get(key: string, defaultValue?: any): any {
        return _.get(this.config, key, defaultValue)
    }

    public merge(key: string, defaultValues: object, customizer?: (...args: any[]) => any): any {
        return _.mergeWith(defaultValues, this.get(key), customizer)
    }

    public defaults(key: string, value: any): void {
        const existingValue = this.get(key)
        if (existingValue) {
            _.mergeWith(value, existingValue)
        }
    
        this.set(key, value)
    }

    public set(key: string, value: any): void {
        _.set(this.config, key, value)
    }
}