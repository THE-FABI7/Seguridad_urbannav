import {injectable, /* inject, */ BindingScope} from '@loopback/core';
const MD5 = require('crypto-js/MD5');

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  //crear clave alateoria para asignar a un usaurio
  GenerarClaveAleatoria(): string {
    let caracteres = 'abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ2346789';
    let clave = '';
    for (let i = 0; i < 8; i++)
      clave += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    return clave;
  }

  //encriptar la clave del usuario
  cifrarTexto(clave: string): string {
    let cadenaCifrada = MD5(clave).toString();
    return cadenaCifrada;
  }
}
