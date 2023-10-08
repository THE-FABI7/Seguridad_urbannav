import {authenticate} from '@loopback/authentication';
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {configuracionNotificaciones} from '../config/notificaciones.config';
import {configuracionSeguridad} from '../config/seguridad.config';
import {
  Credenciales,
  FactorDeAutenticacionPorCodigo,
  Login,
  PermisosRolMenu,
  RecuperarClave,
  Usuario,
} from '../models';
import {LoginRepository, UsuarioRepository} from '../repositories';
import {AuthService, NotificacionesService, SeguridadUsuarioService} from '../services';
import {UserProfile} from '@loopback/security';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @repository(LoginRepository)
    public repositorioLogin: LoginRepository,
    @service(SeguridadUsuarioService)
    public servicioSeguridad: SeguridadUsuarioService,
    @service(NotificacionesService)
    public servicioNotificaciones: NotificacionesService,
    @service(AuthService)
    private servicioAuth: AuthService,
  ) {}

  @post('/usuario')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    //crear clave
    let clave = this.servicioSeguridad.GeneralTextoAleatorio(8);
    //cifrar la clave
    let claveCifrada = this.servicioSeguridad.cifrarTexto(clave);
    //Asignar clave cifrada al usuario
    usuario.Clave = claveCifrada;

    //Notificar de la creacion de cuenta via correo electronico
    try {
      let datos = {
        correoDestino: usuario.correo,
        nombreDestino: usuario.Nombre,

        asuntoCorreo: configuracionNotificaciones.Bienvenidos,
        contenidoCorreo: 'a',
      };

      let url = configuracionNotificaciones.urlBienvenida;
      try {
        this.servicioNotificaciones.EnviarNotificacion(datos, url);
        console.log('Mensaje aceptado');
      } catch (error) {
        console.log('error');
      }
    } catch (error) {
      console.log(error);
    }

    return this.usuarioRepository.create(usuario);
  }

  @get('/usuario/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Usuario) where?: Where<Usuario>): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @authenticate({
    strategy: 'auth',
    options: [
      configuracionSeguridad.menuUsuarioId,
      configuracionSeguridad.listarAccion,
    ],
  })
  @get('/usuario')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuario')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuario/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'})
    filter?: FilterExcludingWhere<Usuario>,
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuario/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuario/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuario/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  // Metodos personalizados para la API

/* El método `identificarUsuario` es un punto final POST que se utiliza para
identificar a un usuario en función de sus credenciales. Toma un cuerpo de
solicitud que contiene el modelo `Credenciales`, que representa las credenciales
del usuario. */

  @post('/identificar-usuario')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async identificarUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credenciales),
        },
      },
    })
    credenciales: Credenciales,
  ): Promise<object> {
    let usuario = await this.servicioSeguridad.identificarUsuario(credenciales);
    if (usuario) {
      let codigo2fa = this.servicioSeguridad.GeneralTextoAleatorio(5);
      let login: Login = new Login();

      login.usuarioId = usuario._id!;
      login.Codigo2FA = codigo2fa;
      login.EstadoCodigo2Fa = false;
      login.Token = '';
      login.EstadoToken = false;
      this.repositorioLogin.create(login);
      usuario.Clave = '';

      //enviar el codigo de verificacion via correo
      try {
        let datos = {
          correoDestino: usuario.correo,
          nombreDestino: usuario.Nombre,
          codigo2fa: codigo2fa,
          asuntoCorreo: configuracionNotificaciones.codigo2fa,
          contenidoCorreo: `${codigo2fa}`,
        };

        let url = configuracionNotificaciones.urlBienvenida;
        try {
          this.servicioNotificaciones.EnviarNotificacion(datos, url);
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }

      return usuario;
    }
    return new HttpErrors[401]('credenciales incorrectas');
  }

  @post('/validar-permiso')
  @response(200, {
    description: 'Validacion de permisos de usuario para logica de negocio',
    content: {'application/json': {schema: getModelSchemaRef(PermisosRolMenu)}},
  })
  async ValidarPermidosDeUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PermisosRolMenu),
        },
      },
    })
    datos: PermisosRolMenu,
  ): Promise<UserProfile | undefined> {
    return this.servicioAuth.VerificarPermisoDeUsuarioPorRol(datos.idRol, datos.idMenu, datos.accion);
  }

  /* El método `verificarCodigo2FA` es un punto final POST que verifica el código
  de autenticación de dos factores proporcionado por el usuario. Toma un cuerpo
  de solicitud que contiene el modelo `FactorDeAutenticacionPorCodigo`, que
  representa el código de autenticación ingresado por el usuario. */
  @post('/verificar-codigo2fa')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(FactorDeAutenticacionPorCodigo),
      },
    },
  })
  async verificarCodigo2FA(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FactorDeAutenticacionPorCodigo),
        },
      },
    })
    credenciales: FactorDeAutenticacionPorCodigo,
  ): Promise<object> {
    let usuario = await this.servicioSeguridad.validarCodigo2fa(credenciales);
    if (usuario) {
      let token = this.servicioSeguridad.crerarToken(usuario);
      if (usuario) {
        usuario.Clave = '';
        try {
          this.usuarioRepository.logins(usuario._id).patch(
            {
              EstadoCodigo2Fa: true,
              Token: token,
            },
            {
              EstadoCodigo2Fa: false,
            },
          );
        } catch {
          console.log(
            'No se han almacenado cambios del estado del token en la base de datos',
          );
        }
        return {
          user: usuario,
          token: token,
        };
      }
    }
    return new HttpErrors[401]('credenciales incorrectas');
  }


 /* El método `RecuperarClave` es un endpoint POST que permite al usuario
 recuperar su contraseña. Se necesita un cuerpo de solicitud que contiene el
 modelo `RecuperarClave`, que representa la dirección de correo electrónico del
 usuario. */
  @post('/recuperar-clave')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async RecuperarClave(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RecuperarClave),
        },
      },
    })
    credenciales: RecuperarClave,
  ): Promise<object> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.correo,
      },
    });
    if (usuario) {
      let clave = this.servicioSeguridad.GeneralTextoAleatorio(8);
      let claveCifrada = this.servicioSeguridad.cifrarTexto(clave);
      usuario.Clave = claveCifrada;
      this.usuarioRepository.updateById(usuario._id!, usuario);
      //enviar la clave via correo
      try {
        let datos = {
          numeroDestino: usuario.Telefono,
          contenidoMensaje: `Hola ${usuario.Nombre}, Su nueva clave es: ${clave}`,
        };
        console.log(datos);

        let url = configuracionNotificaciones.urlNotificacionSms;
        try {
          this.servicioNotificaciones.EnviarNotificacion(datos, url);
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
      return usuario;
    }
    return new HttpErrors[401]('credenciales incorrectas');
  }
}
