type Path = string | string[]

interface WrappedObject<T> {
    set(path?: Path, value?: any): WrappedObject<T>
    push(path?: Path, value?: any): WrappedObject<T>
    del(path?: Path): WrappedObject<T>
    assign(path?: Path, source?: T): WrappedObject<T>
    update(path?: Path, updater?: (formerValue: any) => any): WrappedObject<T>
    value(): T
}

interface ObjectPathImmutable {
    <T>(obj: T): WrappedObject<T>
    set<T = object>(src: T, path?: Path, value?: any): T
    push<T = object>(src: T, path?: Path, value?: any): T
    del<T = object>(src: T, path?: Path): T
    assign<T = object>(src: T, path?: Path, source?: T): T
    update<T = object>(src: T, path?: Path, updater?: (formerValue: any) => any): WrappedObject<T>
}

declare module 'object-path-immutable' {
    const immutable: ObjectPathImmutable;
    export default immutable
}
