module.exports = {
  fisica: 1, // natural-person
  juridica: 2, // legal-person
  verifyPersonType(document) {
    return document.length === 11 ? this.fisica : this.juridica;
  },
};
