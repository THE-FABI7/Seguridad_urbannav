export namespace configuracionNotificaciones {
  export const Bienvenidos: String = 'Bienvenido a URBANNAV';
  export const urlBienvenida: string =
    'http://localhost:5178/Notificaciones/correo-bienvenida';
  export const codigo2fa: string = 'Codigo de verificacion URBANNAV';
  export const url2fa: string =
    'http://localhost:5178/Notificaciones/enviar-correo-2fa';
  export const urlNotificacionSms: string =
    'http://localhost:5178/Notificaciones/enviar-sms';
  //cambiar el apuntador, ya que falta el de correo de contacto
  export const urlFormularioContacto: string =
    'http://localhost:5178/Notificaciones/enviar-correo-2fa';
}
