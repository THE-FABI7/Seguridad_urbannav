// Uncomment these imports to begin using these cool features!

import {repository} from '@loopback/repository';
import {VariablesGeneralDelSistemaRepository} from '../repositories';
import {service} from '@loopback/core';
import {NotificacionesService} from '../services';
import {HttpErrors, getModelSchemaRef, post, requestBody, response} from '@loopback/rest';
import {Pqrs, VariablesGeneralDelSistema} from '../models';
import {configuracionNotificaciones} from '../config/notificaciones.config';

// import {inject} from '@loopback/core';

export class PqrsController {
  constructor(
    @repository(VariablesGeneralDelSistemaRepository)
    private variablesRepository: VariablesGeneralDelSistemaRepository,
    @service(NotificacionesService)
    private servicioNotificaciones: NotificacionesService,
  ) {}

  @post('/enviar-mensaje-formulario-contacto')
  @response(200, {
    description: 'envio del mensaje del formulario de contacto',
    content: {
      'application/json': {schema: getModelSchemaRef(Pqrs)},
    },
  })
  /**
   * Verifies if the user has the necessary permissions based on their role to perform an action.
   * @param {FormularioContacto} datos - The contact form data submitted by the user.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the user has the necessary permissions.
   * @throws {HttpErrors[500]} - Throws a 500 error if there are no system variables to perform the process or if there is a server error while sending the message.
   */
  async VerificarPermisoDeUsuarioPorRol(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pqrs),
        },
      },
    })
    datos: Pqrs,
  ): Promise<boolean> {
    try {
      let variables: VariablesGeneralDelSistema[] =
        await this.variablesRepository.find();
      if (variables.length == 0) {
        throw new HttpErrors[500](
          'no hay varibles del sistema para realizar el proceso',
        );
      }
      let correoAdministrador = variables[0].CorreoContactoAdministrador;
      let nombreAdministrador = variables[0].NombreContactoAdministrador;
      let asunto = 'Contacto desde sitio web';
      let mensaje = `Estimado ${nombreAdministrador}, se ha enviado un mensaje desde el sitio web con la siguiente informacion:\n
      Nombre: ${datos.nombreCompleto} \n
      Correo: ${datos.correo} \n
      Celular: ${datos.celular} \n
      Tipo de mensaje: ${datos.tipoMensaje} \n
      texto del mensaje: ${datos.mensaje} \n

      hasta pronto,\n
      equipo tecnico.
      `;

      let datosContacto = {
        correoDestino: correoAdministrador,
        nombreDestino: nombreAdministrador,
        asuntoCorreo: asunto,
        contenidoCorreo: mensaje,
      };

      let enviado = this.servicioNotificaciones.EnviarNotificacion(
        datosContacto,
        configuracionNotificaciones.urlFormularioContacto
      );
      console.log(enviado);

      return true;
    } catch (e) {
      console.log(e);
      throw new HttpErrors[500]('Error de servidor para enviar mensaje');
    }
  }
}
