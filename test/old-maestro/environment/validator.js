let Maestro = require('maestro-io');
let di = new Maestro(`${__dirname}/../..`);
let env = {};

describe('$Validator', () => {
    before('Loading modules / mocks', () => {
        return di
            .loadFiles('./src/environment/validator')
            .start()
            .then(di => {
                env.validator = di.resolve('$validator');
                env.model = {
                    attributes: {
                        name: {
                            type: 'string',
                            min: 5,
                            max: 20
                        },
                        age: {
                            type: 'integer',
                            required: true
                        },
                        password: {
                            type: 'string',
                            max: 8
                        }
                    }
                };
                env.complexModel = {
                    attributes: {
                        name: {
                            type: 'string',
                            required: true,
                            min: 5,
                            max: 20
                        },
                        contact: {
                            type: 'json',
                            attributes: {
                                address: {
                                    type: 'json',
                                    attributes: {
                                        street: {
                                            type: 'string',
                                            required: true,
                                            min: 5,
                                            max: 50
                                        },
                                        number: {
                                            type: 'integer',
                                            required: true
                                        },
                                        city: {
                                            type: 'string',
                                            required: true,
                                            min: 5,
                                            max: 50
                                        },
                                    }
                                },
                                phones: {
                                    type: 'array',
                                    of: 'integer'
                                }
                            }
                        },
                        children: {
                            type: 'array',
                            of: 'json',
                            attributes: {
                                name: {
                                    type: 'string',
                                    required: true
                                },
                                age: {
                                    type: 'integer',
                                    required: true
                                }
                            }
                        },
                        requiredNested: {
                            type: 'json',
                            required: true,
                            attributes: {
                                value: { type: 'string' }
                            }
                        },
                        requiredNestedArray: {
                            type: 'array',
                            required: true,
                            of: 'integer'
                        }
                    }
                };

                env.complexArray = {
                    attributes: {
                        children: {
                            type: 'array',
                            of: {
                                type: 'string',
                                required: true,
                                min: 2,
                                max: 5
                            },
                            required: true,
                            min: 3
                        }
                    }
                };
            });
    });

    describe('String properties.', () => {
        it('Should return FALSE when property is not a string.', () => {
            let schema = { prop: { type: 'string' } };
            let obj = { prop: 123 };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return FALSE when required property is not present.', () => {
            let schema = { prop: { type: 'string', required: true } };
            let obj = { };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return FALSE when required property is an empty string.', () => {
            let schema = { prop: { type: 'string', required: true } };
            let obj = { prop: '' };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return FALSE when required property is a trimmed empty string.', () => {
            let schema = { prop: { type: 'string', required: true } };
            let obj = { prop: ' ' };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return TRUE when require is not defined and property is not present.', () => {
            let schema = { prop: { type: 'string' } };
            let obj = { };

            env.validator.check(schema, obj).should.be.ok();
        });

        it('Should return FALSE when property\'s length is lesser then min.', () => {
            let schema = { prop: { type: 'string', min: 3 } };
            let obj = { prop: 'ab' };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return FALSE when property\'s length is greater then max.', () => {
            let schema = { prop: { type: 'string', max: 5 } };
            let obj = { prop: 'abcdefg' };

            env.validator.check(schema, obj).should.be.not.ok();
        });
    });

    describe('Decimal properties.', () => {
        it('Should return FALSE when property is not a decimal number.', () => {
            let schema = { prop: { type: 'decimal' } };
            let obj = { prop: 'string' };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return FALSE when required property is not present.', () => {
            let schema = { prop: { type: 'decimal', required: true } };
            let obj = { };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return TRUE when require is not defined and property is not present.', () => {
            let schema = { prop: { type: 'decimal' } };
            let obj = { };

            env.validator.check(schema, obj).should.be.ok();
        });

        it('Should return FALSE when property\'s value is lesser then min.', () => {
            let schema = { prop: { type: 'decimal', min: 3 } };
            let obj = { prop: 2 };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return FALSE when property\'s value is greater then max.', () => {
            let schema = { prop: { type: 'decimal', max: 5 } };
            let obj = { prop: 6 };

            env.validator.check(schema, obj).should.be.not.ok();
        });
    });

    describe('Integer properties.', () => {
        it('Should return FALSE when property is not a integer number.', () => {
            let schema = { prop: { type: 'integer' } };
            let obj = { prop: 'string' };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return FALSE when property is a number but not integer.', () => {
            let schema = { prop: { type: 'integer' } };
            let obj = { prop: 9.75 };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return FALSE when property is a integer not enumerated.', () => {
            let schema = { prop: { type: 'integer', enum: [1, 2, 3] } };
            let obj = { prop: 4 };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return FALSE when required property is not present.', () => {
            let schema = { prop: { type: 'integer', required: true } };
            let obj = { };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return TRUE when require is not defined and property is not present.', () => {
            let schema = { prop: { type: 'integer' } };
            let obj = { };

            env.validator.check(schema, obj).should.be.ok();
        });

        it('Should return FALSE when property\'s value is lesser then min.', () => {
            let schema = { prop: { type: 'integer', min: 3 } };
            let obj = { prop: 2 };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return FALSE when property\'s value is greater then max.', () => {
            let schema = { prop: { type: 'integer', max: 5 } };
            let obj = { prop: 6 };

            env.validator.check(schema, obj).should.be.not.ok();
        });
    });

    describe('Boolean properties.', () => {
        it('Should return FALSE when property is not a boolean.', () => {
            let schema = { prop: { type: 'boolean' } };
            let obj = { prop: 'string' };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return FALSE when required property is not present.', () => {
            let schema = { prop: { type: 'integer', required: true } };
            let obj = { };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return TRUE when require is not defined and property is not present.', () => {
            let schema = { prop: { type: 'integer' } };
            let obj = { };

            env.validator.check(schema, obj).should.be.ok();
        });
    });

    describe.skip('Function settings.', () => {
        it('Should return FALSE when computed require setting is true and property is not present.', () => {
            let schema = { prop: { type: 'integer', required: () => true } };
            let obj = { };

            env.validator.check(schema, obj).should.be.not.ok();
        });

        it('Should return TRUE when computed require setting is true and property is present.', () => {
            let schema = {
                prop: {
                    type: 'integer',
                    required: (value, obj) => obj.propb == 1
                },
                propb: { type: 'integer' }
            };
            let obj = { prop: 999, propb: 1 };

            env.validator.check(schema, obj).should.be.ok();
        });
    })

    describe('Default values.', () => {
        it('Should return TRUE when required property is not present but default is set.', () => {
            let schema = { prop: { type: 'integer', required: true, default: 0 } };
            let obj = { };

            env.validator.check(schema, obj).should.be.ok();

            obj.should.has.property('prop');
            obj.prop.should.be.exactly(0);
        });
    });

    describe('Single-level objects.', () => {
        it('Should return TRUE when the object meets all the requirements.', () => {
            let obj = {
                name: 'Administrator',
                age: 30,
                password: 'password'
            };

            env.validator.check(env.model.attributes, obj).should.be.ok();
        });

        it('Should return FALSE when the object does not meet all the requirements.', () => {
            let obj = {
                name: 'Administrator',
                password: 'password'
            };

            env.validator.check(env.model.attributes, obj).should.not.be.ok();
        });

        it('Should return FALSE when the object meets all the requirements but has extra properties.', () => {
            let obj = {
                name: 'Administrator',
                age: 30,
                password: 'password',
                extraProperty: 999
            };

            env.validator.check(env.model.attributes, obj).should.not.be.ok();
        });
    });

    describe('Multi-level objects.', () => {
        it('Should return TRUE when the object AND the nested objects meets all the requirements.', () => {
            let obj = {
                name: 'Administrator',
                contact: {
                    address: {
                        street: 'Rua Dos Bobos',
                        number: 0,
                        city: 'Deus me livre'
                    }
                },
                requiredNested: { value: 'oi' },
                requiredNestedArray: [1]
            };

            env.validator.check(env.complexModel.attributes, obj).should.be.ok();
        });

        it('Should return TRUE when the object AND the nested arrays meets all the requirements.', () => {
            let obj = {
                name: 'Administrator',
                contact: {
                    phones: [111111111, 222222222]
                },
                requiredNested: { value: 'oi' },
                requiredNestedArray: [1]
            };

            env.validator.check(env.complexModel.attributes, obj).should.be.ok();
        });

        it('Should return FALSE if array length does not meet the criteria.', () => {
            let obj = {
                children: [
                    'João',
                    'Maria'
                ]
            };

            env.validator.check(env.complexArray.attributes, obj).should.not.be.ok();
        });

        describe('Should return FALSE when the object OR any nested object does not meet all the requirements.', () => {
            it('eg.: WRONG NESTED TYPE', () => {
                let obj = {
                    name: 'Administrator',
                    contact: {
                        address: {
                            street: 'Rua Dos Bobos',
                            number: 0,
                            city: 'Deus me livre'
                        }
                    },
                    requiredNested: { value: 123 },
                    requiredNestedArray: [1]
                };

                env.validator.check(env.complexModel.attributes, obj).should.not.be.ok();
            });

            it('eg.: NESTED REQUIRED NOT PRESENT', () => {
                let obj = {
                    name: 'Administrator',
                    contact: {
                        address: {
                            street: 'Rua Dos Bobos',
                            number: 0,
                            city: 'Deus me livre'
                        }
                    },
                    requiredNestedArray: [1]
                };

                env.validator.check(env.complexModel.attributes, obj).should.not.be.ok();
            });
        });

        describe('Should return FALSE when the object OR any nested array item does not meet all the requirements.', () => {
            it('eg.: WRONG NESTED ARRAY ITEM TYPE', () => {
                let obj = {
                    name: 'Administrator',
                    contact: {
                        address: {
                            street: 'Rua Dos Bobos',
                            number: 0,
                            city: 'Deus me livre'
                        }
                    },
                    requiredNested: { value: 'oi' },
                    requiredNestedArray: ['abc']
                };

                env.validator.check(env.complexModel.attributes, obj).should.not.be.ok();
            });

            it('eg.: NESTED ARRAY REQUIRED NOT PRESENT', () => {
                let obj = {
                    name: 'Administrator',
                    contact: {
                        address: {
                            street: 'Rua Dos Bobos',
                            number: 0,
                            city: 'Deus me livre'
                        }
                    },
                    requiredNested: { value: 'oi' }
                };

                env.validator.check(env.complexModel.attributes, obj).should.not.be.ok();
            });

            it('eg.: ARRAY ITEM NOT VALID', () => {
                let obj = {
                    children: [
                        'João',
                        'Maria',
                        ''
                    ]
                };

                env.validator.check(env.complexArray.attributes, obj).should.not.be.ok();
            });
        });
    });
});
