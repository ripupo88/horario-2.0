const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const { f_user, f_empleado_por_id } = require('../mongo/mongodb');
const { f_procesa_ahora } = require('../comandos/ahora');

const getUser = token => {
    try {
        if (token) {
            return jwt.verify(token, 'solo_yo');
        }
        return null;
    } catch (err) {
        return null;
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const tokenWithBearer = req.headers.authorization || '';
        const token = tokenWithBearer.split(' ')[1];
        const user = getUser(token);
        return {
            user,
            f_user,
            f_empleado_por_id,
            f_procesa_ahora
        };
    }
});

server
    .listen({
        port: 8383
    })
    .then(info =>
        console.log(`Server started on http://localhost:${info.port}`)
    );
