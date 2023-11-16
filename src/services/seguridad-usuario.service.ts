import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {configuracionSeguridad} from '../config/seguridad.config';
import {
  Credenciales,
  FactorDeAutenticacionPorCodigo,
  RolMenu,
  Usuario,
} from '../models';
import {
  LoginRepository,
  RolMenuRepository,
  UsuarioRepository,
} from '../repositories';
const MD5 = require('crypto-js/MD5');
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
    @repository(UsuarioRepository)
    public repositoriUsuario: UsuarioRepository,
    @repository(LoginRepository)
    public repositoriLogin: LoginRepository,
    @repository(RolMenuRepository)
    public repositoryRolMenu: RolMenuRepository,
  ) {}

  /*
   * Add service methods here
   */

  /**
   * La función "GenerarClaveAleatoria" genera una cadena aleatoria de 8 caracteres
   * utilizando un conjunto de caracteres predefinido.
   * @returns una cadena generada aleatoriamente de 8 caracteres.
   */
  GeneralTextoAleatorio(n: number): string {
    let caracteres = 'abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ2346789';
    let clave = '';
    for (let i = 0; i < n; i++)
      clave += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    return clave;
  }

  /**
   * La función cifrarTexto toma una cadena como entrada, la cifra usando el
   * algoritmo MD5 y devuelve la cadena cifrada.
   * @param {string} clave - El parámetro "clave" es una cadena que representa la
   * clave utilizada para el cifrado.
   * @returns el texto cifrado (cadenaCifrada) tras aplicar el algoritmo de cifrado
   * MD5 a la clave de entrada.
   */
  cifrarTexto(clave: string): string {
    let cadenaCifrada = MD5(clave).toString();
    return cadenaCifrada;
  }
  /**
   * La función `identificarUsuario` toma las credenciales y devuelve un objeto de
   * usuario si las credenciales coinciden, de lo contrario devuelve nulo.
   * @param {Credenciales} credenciales - El parámetro "credenciales" es de tipo
   * "Credenciales". Es un objeto que contiene las credenciales del usuario,
   * específicamente su dirección de correo electrónico y contraseña.
   * @returns una Promesa que se resuelve en un objeto Usuario o nula.
   */
  async identificarUsuario(
    credenciales: Credenciales,
  ): Promise<Usuario | null> {
    let usuario = await this.repositoriUsuario.findOne({
      where: {
        correo: credenciales.correo,
        Clave: credenciales.clave,
      },
    });
    return usuario as Usuario;
  }

  /**
   * La función `validarCodigo2fa` toma las credenciales 2FA y verifica si hay un
   * registro de inicio de sesión coincidente con las credenciales proporcionadas,
   * devolviendo el inicio de sesión si se encuentra o nulo si no.
   * @param {FactorDeAutenticacionPorCodigo} credenciales2fa - Un objeto que
   * contiene las siguientes propiedades:
   * @returns La función `validarCodigo2fa` devuelve una `Promesa` que se resuelve
   * en un objeto `Login` o `null`.
   */
  async validarCodigo2fa(
    credenciales2fa: FactorDeAutenticacionPorCodigo,
  ): Promise<Usuario | null> {
    let login = await this.repositoriLogin.findOne({
      where: {
        usuarioId: credenciales2fa.usuarioId,
        Codigo2FA: credenciales2fa.codigo2fa,
        EstadoCodigo2Fa: false,
      },
    });

    if (login) {
      let usuario = await this.repositoriUsuario.findById(
        credenciales2fa.usuarioId,
      );
      return usuario;
    }

    return null;
  }

  /**
   * La función `crearToken` genera un JSON Web Token (JWT) utilizando la
   * información del usuario proporcionada.
   * @param {Usuario} usuario - El parámetro `usuario` es un objeto que representa
   * a un usuario. Contiene las siguientes propiedades:
   * @returns una cadena, que es el token generado.
   */
  crerarToken(usuario: Usuario): string {
    let datos = {
      name: `${usuario.Nombre} ${usuario.Apellido}`,
      role: `${usuario.rolId}`,
      email: `${usuario.correo}`,
    };

    let token = jwt.sign(datos, configuracionSeguridad.clavejwt);
    return token;
  }

  /**
   * Valida y obtiene el rol de un usuario desde un token
   * @param tk el token
   * @returns el _id del rol
   */
  obtenerRolDesdeToken(tk: string): string {
    let obj = jwt.verify(tk, configuracionSeguridad.clavejwt);
    return obj.role;
  }

  async ConsultarPermisosDeMenuPorUsuario(idRol: string): Promise<RolMenu[]> {
    let menu: RolMenu[] = await this.repositoryRolMenu.find({
      where: {
        Listar: true,
        rolId: idRol,
      },
    });
    return menu;
  }

  //necesito un metodo que dado un correo, me busque en la base de datos, si el correo esta en la base me muestre un error
  //si el correo no esta en la base me permita crear un usuario nuevo
  async buscarUsuarioPorCorreo(correo: string): Promise<Usuario | null> {
    let usuario = await this.repositoriUsuario.findOne({
      where: {
        correo: correo,
      },
    });
    return usuario as Usuario;
  }
}
