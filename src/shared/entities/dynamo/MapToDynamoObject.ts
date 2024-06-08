type MapDateToString<PropType> = PropType extends Date ? string : PropType;

export type MapToDynamoObject<T> = {
    [PropertyKey in keyof T]: MapDateToString<T[PropertyKey]>;
};
