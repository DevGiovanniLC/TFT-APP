/**
 * Enum que representa los eventos disparados tras operaciones en registros de peso.
 */
export enum WeightTrackerEvent {
    /** No se ha disparado ningún evento */
    NONE,
    /** Se ha añadido un nuevo registro de peso */
    ADD,
    /** Se ha eliminado un registro de peso */
    DELETE,
    /** Se ha actualizado un registro de peso */
    UPDATE,
}


/**
 * Enum que representa los posibles desencadenantes de eventos
 * cuando la configuración del usuario cambia.
 */
export enum UserConfigEvent {
    /** No se ha disparado ningún evento */
    NONE,
    /** La configuración ha sido actualizada */
    CHANGED,
}
