import { Sequelize } from 'sequelize-database';
import { UserNotFoundException } from '../../../interfaces/rest/exceptions/ApiExceptions';

const listUserFromIdUseCase = (db: Sequelize) =>
  async (idUsuario) => {
    const user = await db.entities.usuario.findOne({
      where: { id: idUsuario },
      attributes: ['id', 'nome', 'email', 'celular', 'username', 'documento', 'roles', 'ativo'],
      include: [{
        model: db.entities.membro,
        as: 'associacoes',
        include: [{
          model: db.entities.participante,
          as: 'participante',
          required: false,
        }]
      }],
    });

    if (!user) throw new UserNotFoundException();

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      celular: user.celular,
      documento: user.documento,
      username: user.username,
      roles: user.roles,
      ativo: user.ativo,
      associacoes: user.associacoes,
    };

  };

export default listUserFromIdUseCase;
