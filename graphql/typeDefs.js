const { gql } = require('apollo-server');

const typeDefs = gql`
    type User {
        id: ID!
        correo: String!
    }

    type Query {
        hello: String!
        currentUser: User!
        activeUsers: [ActiveUser]
    }

    type ActiveUser {
        alias: String!
        entrada: String!
        empresa: String!
    }

    type Mutation {
        register(username: String!, password: String!): User!
        login(username: String!, password: String!): LoginResponse!
    }

    type LoginResponse {
        token: String
        user: User
    }
`;

module.exports = typeDefs;
