type Path = string | ReadonlyArray<string>;

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

interface ObjectPathImmutable {
    <T>(obj: T): WrappedObject<T>
    set<T = object>(src: T, path?: Path, value?: any): T
    push<T = object>(src: T, path?: Path, value?: any): T
    del<T = object>(src: T, path?: Path): T
    assign<T = object>(src: T, path?: Path, source?: T): T
    merge<T = object>(src: T, path?: Path, source?: any): T
    update<T = object>(src: T, path?: Path, updater?: (formerValue: any) => any): WrappedObject<T>
    insert<T = object>(src: T, path?: Path, value?: any, index?: number): T
}

declare module 'object-path-immutable' {
    const immutable: ObjectPathImmutable;
    export default immutable
}
