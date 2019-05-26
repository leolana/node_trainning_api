import { Sequelize } from 'sequelize-database';

const searchParticipantUseCase = (db: Sequelize) => async (term: string) => {

  let where = {};

  if (term) {
    where = db.where(
      db.fn('unaccent', db.col('nome')),
      { $iLike: db.fn('unaccent', `%${term}%`) }
    );
  }

  const participantes = await db.entities.participante
    .findAll({
      where,
      attributes: ['id', 'nome'],
      order: [['nome', 'ASC']],
    });

  return participantes.map(c => ({
    id: c.id,
    text: `${c.nome}`,
  }));
};

export default searchParticipantUseCase;
