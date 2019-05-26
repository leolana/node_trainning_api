module.exports = (di) => {
    di.provide('$auth', () => Promise.resolve({
        require: () => {

        },
        requireParticipante: () => {
            
        }
    }))
};
