export namespace configuracionNotificaciones {
  export const Bienvenidos: String = 'Bienvenido a URBANNAV';
  export const urlBienvenida: string =
    'http://localhost:5178/Notificaciones/correo-bienvenida';
  export const codigo2fa: string = 'Codigo de verificacion URBANNAV';
  export const url2fa: string =
    'http://localhost:5178/Notificaciones/enviar-correo-2fa';
  export const HashValidacionUsuario: string =
    'http://localhost:5178/Notificaciones/hash-validacion-usuario';
  export const urlNotificacionSms: string =
    'http://localhost:5178/Notificaciones/enviar-sms';
  //cambiar el apuntador, ya que falta el de correo de contacto
  export const urlFormularioContacto: string =
    'http://localhost:5178/Notificaciones/enviar-correo-2fa';

  export const urlValidacionCorreoFrontend: string =
    'http://localhost:4200/seguridad/validar-hash-usuario-publico';

  export const asuntoVerificacionCorre = 'Verificate para seguir';

  export const claveAsignada = 'Esta es tu clave asignada';

  export const confirmacionpqrs = 'se ha confirmado su pqrs'

  export const pqrsRecibido = 'se ha registrado un nuevo pqrs'
}
