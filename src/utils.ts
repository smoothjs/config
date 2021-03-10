export type ValueStringType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'boolean|string'
  | 'number|string'
  | 'any'

export type ValueType<T extends ValueStringType> = T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : T extends 'boolean|string'
  ? boolean | string
  : T extends 'number|string'
  ? number | string
  : any
