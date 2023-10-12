import {Model, model, property} from '@loopback/repository';

@model()
export class Pqrs extends Model {
  @property({
    type: 'string',
    required: true,
  })
  mensaje: string;

  @property({
    type: 'string',
    required: true,
  })
  tipoMensaje: string;

  @property({
    type: 'string',
    required: true,
  })
  nombreCompleto: string;

  @property({
    type: 'string',
    required: true,
  })
  correo: string;

  @property({
    type: 'string',
  })
  celular?: string;


  constructor(data?: Partial<Pqrs>) {
    super(data);
  }
}

export interface PqrsRelations {
  // describe navigational properties here
}

export type PqrsWithRelations = Pqrs & PqrsRelations;
