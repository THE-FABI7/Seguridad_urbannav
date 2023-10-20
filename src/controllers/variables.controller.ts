import {authenticate} from '@loopback/authentication';
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
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {VariablesGeneralDelSistema} from '../models';
import {VariablesGeneralDelSistemaRepository} from '../repositories';
import {configuracionSeguridad} from '../config/seguridad.config';
// import {authorize} from '@loopback/authorization';

export class VariablesController {
  constructor(
    @repository(VariablesGeneralDelSistemaRepository)
    public variablesGeneralDelSistemaRepository: VariablesGeneralDelSistemaRepository,
  ) {}

  @post('/variables-general-del-sistemas')
  @response(200, {
    description: 'VariablesGeneralDelSistema model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(VariablesGeneralDelSistema),
      },
    },
  })
  // @authorize({
  //   allowedRoles: ['administrador'], // Definir el rol permitido sonaio
  // })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VariablesGeneralDelSistema, {
            title: 'NewVariablesGeneralDelSistema',
            exclude: ['_id'],
          }),
        },
      },
    })
    variablesGeneralDelSistema: Omit<VariablesGeneralDelSistema, 'id'>,
  ): Promise<VariablesGeneralDelSistema> {
    // Verificar si ya existe un registro con el mismo ID
    const existingRecord =
      await this.variablesGeneralDelSistemaRepository.findOne({
        where: {_id: variablesGeneralDelSistema._id},
      });

    if (existingRecord) {
      // Si existe, actualiza el registro
      await this.variablesGeneralDelSistemaRepository.updateById(
        existingRecord._id,
        variablesGeneralDelSistema,
      );

      // Obtener el registro actualizado
      return this.variablesGeneralDelSistemaRepository.findById(
        existingRecord._id,
      );
    } else {
      // Si no existe, crea un nuevo registro
      return this.variablesGeneralDelSistemaRepository.create(
        variablesGeneralDelSistema,
      );
    }
  }

  @get('/variables-general-del-sistemas/count')
  @response(200, {
    description: 'VariablesGeneralDelSistema model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(VariablesGeneralDelSistema)
    where?: Where<VariablesGeneralDelSistema>,
  ): Promise<Count> {
    return this.variablesGeneralDelSistemaRepository.count(where);
  }

  @authenticate({
    strategy: 'auth',
    options: [
      configuracionSeguridad.menuUsuarioId,
      configuracionSeguridad.listarAccion,
    ],
  })
  @get('/variables-general-del-sistemas')
  @response(200, {
    description: 'Array of VariablesGeneralDelSistema model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(VariablesGeneralDelSistema, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @param.filter(VariablesGeneralDelSistema)
    filter?: Filter<VariablesGeneralDelSistema>,
  ): Promise<VariablesGeneralDelSistema[]> {
    return this.variablesGeneralDelSistemaRepository.find(filter);
  }

  @patch('/variables-general-del-sistemas')
  @response(200, {
    description: 'VariablesGeneralDelSistema PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VariablesGeneralDelSistema, {
            partial: true,
          }),
        },
      },
    })
    variablesGeneralDelSistema: VariablesGeneralDelSistema,
    @param.where(VariablesGeneralDelSistema)
    where?: Where<VariablesGeneralDelSistema>,
  ): Promise<Count> {
    return this.variablesGeneralDelSistemaRepository.updateAll(
      variablesGeneralDelSistema,
      where,
    );
  }

  @get('/variables-general-del-sistemas/{id}')
  @response(200, {
    description: 'VariablesGeneralDelSistema model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(VariablesGeneralDelSistema, {
          includeRelations: true,
        }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(VariablesGeneralDelSistema, {exclude: 'where'})
    filter?: FilterExcludingWhere<VariablesGeneralDelSistema>,
  ): Promise<VariablesGeneralDelSistema> {
    return this.variablesGeneralDelSistemaRepository.findById(id, filter);
  }

  @patch('/variables-general-del-sistemas/{id}')
  @response(204, {
    description: 'VariablesGeneralDelSistema PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VariablesGeneralDelSistema, {
            partial: true,
          }),
        },
      },
    })
    variablesGeneralDelSistema: VariablesGeneralDelSistema,
  ): Promise<void> {
    await this.variablesGeneralDelSistemaRepository.updateById(
      id,
      variablesGeneralDelSistema,
    );
  }

  @put('/variables-general-del-sistemas/{id}')
  @response(204, {
    description: 'VariablesGeneralDelSistema PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() variablesGeneralDelSistema: VariablesGeneralDelSistema,
  ): Promise<void> {
    await this.variablesGeneralDelSistemaRepository.replaceById(
      id,
      variablesGeneralDelSistema,
    );
  }

  @del('/variables-general-del-sistemas/{id}')
  @response(204, {
    description: 'VariablesGeneralDelSistema DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.variablesGeneralDelSistemaRepository.deleteById(id);
  }
}
