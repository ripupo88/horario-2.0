const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const resolvers = {
    Query: {
        hello: () => "Hello World",

        activeUsers: async (parent, args, ctx) => {
            if (!ctx.user) throw new Error("Not Authenticated");
            let myUser = await ctx.f_empleado_por_id(ctx.user.id);
            console.log("asdasdsadasd", myUser);
            let id = myUser.telegram_id;
            let message = { from: { id }, chat: { id } };
            let res = await ctx.f_procesa_ahora({
                message,
                web: true,
            });
            console.log(res);

            return res.activosParaWeb;
        },

        currentUser: (parent, args, { user, f_user }) => {
            // this if statement is our authentication check
            if (!user) {
                throw new Error("Not Authenticated");
            }
            return f_user(user.username);
        },
    },
    Mutation: {
        // register: async (parent, { username, password }, ctx, info) => {
        //     const hashedPassword = await bcrypt.hash(password, 10);
        //     const user = await ctx.cuarto({
        //         username,
        //         password: hashedPassword
        //     });
        //     return user;
        // },

        login: async (parent, { username, password }, ctx, info) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log(hashedPassword);
            const user = await ctx.f_user(username);

            // if (!user) {
            //     throw new Error('Invalid Login');
            // }

            // const passwordMatch = await bcrypt.compare(password, user.pass);

            // if (!passwordMatch) {
            //     throw new Error('Invalid Login');
            // }

            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                },
                "solo_yo",
                {
                    expiresIn: "30d", // token will expire in 30days
                }
            );

            return {
                token,
                user,
            };
        },
    },
};

module.exports = resolvers;
