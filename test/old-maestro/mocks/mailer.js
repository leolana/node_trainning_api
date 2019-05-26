module.exports = (di) => {
    di.provide('$mailer', () => Promise.resolve({
        enviar: () => Promise.resolve()
    }))
};
