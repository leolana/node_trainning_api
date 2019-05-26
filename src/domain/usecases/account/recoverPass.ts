const recoverPass = (db, auth) => (userEmail) => {
  const findUser = () => {
    const where = { email: userEmail };

    return db.entities.usuario.findOne({ where });
  };

  const recoverPassword = (user) => {
    const email = userEmail;
    if (user) {
      return auth.recoverPassword({ email })
        .then(() => true);
    }
    return false;
  };

  return findUser().then(recoverPassword);
};

export default recoverPass;
