import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {VariablesGeneralDelSistema, VariablesGeneralDelSistemaRelations} from '../models';

export class VariablesGeneralDelSistemaRepository extends DefaultCrudRepository<
  VariablesGeneralDelSistema,
  typeof VariablesGeneralDelSistema.prototype._id,
  VariablesGeneralDelSistemaRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(VariablesGeneralDelSistema, dataSource);
  }
}
