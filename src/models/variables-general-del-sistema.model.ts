import {Entity, model, property} from '@loopback/repository';

@model()
export class VariablesGeneralDelSistema extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'number',
    required: true,
  })
  PorcentajeGanancia: number;

  @property({
    type: 'number',
    required: true,
  })
  valorporKilometro: number;

  @property({
    type: 'string',
    required: true,
  })
  nombreEmpresa: string;

  @property({
    type: 'string',
    required: true,
  })
  CorreoContactoAdministrador: string;

  @property({
    type: 'string',
    required: true,
  })
  NombreContactoAdministrador: string;


  constructor(data?: Partial<VariablesGeneralDelSistema>) {
    super(data);
  }
}

export interface VariablesGeneralDelSistemaRelations {
  // describe navigational properties here
}

export type VariablesGeneralDelSistemaWithRelations = VariablesGeneralDelSistema & VariablesGeneralDelSistemaRelations;
