type Path = string | ReadonlyArray<number | string>;

interface WrappedObject<T> {
    set(path?: Path, value?: any): WrappedObject<T>
    push(path?: Path, value?: any): WrappedObject<T>
    del(path?: Path): WrappedObject<T>
    assign(path?: Path, source?: any): WrappedObject<T>
    merge(path?: Path, source?: any): WrappedObject<T>
    update(path?: Path, updater?: (formerValue: any) => any): WrappedObject<T>
    insert(path?: Path, value?: any, index?: number): WrappedObject<T>
    value(): T
}

declare module 'object-path-immutable' {
    export function wrap<T>(obj: T): WrappedObject<T>
    export function get<T = object>(src: T, path?: Path, defaultValue?: any): T
    export function set<T = object>(src: T, path?: Path, value?: any): T
    export function push<T = object>(src: T, path?: Path, value?: any): T
    export function del<T = object>(src: T, path?: Path): T
    export function assign<T = object>(src: T, path?: Path, source?: any): T
    export function merge<T = object>(src: T, path?: Path, source?: any): T
    export function update<T = object>(src: T, path?: Path, updater?: (formerValue: any) => any): WrappedObject<T>
    export function insert<T = object>(src: T, path?: Path, value?: any, index?: number): T
}
