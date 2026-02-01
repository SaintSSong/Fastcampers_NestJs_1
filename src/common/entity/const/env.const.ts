const env = "ENV" 
 ENV: Joi.string().valid('dev', 'prod').required(),

        DB_TYPE: Joi.string().valid('postgres').required(), // .valid('postgres') 이걸 넣으면 postgresql만 가능하다.
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        HASH_ROUNDS: Joi.number().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),