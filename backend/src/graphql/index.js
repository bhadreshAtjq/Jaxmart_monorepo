const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const { prisma } = require('../config/database');
const jwt = require('jsonwebtoken');
const path = require('path');
const express = require('express');

// Context generator for GraphQL requests
const getContext = async ({ req }) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { prisma };
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        userType: true,
        accountType: true,
        kycStatus: true,
        trustScore: true,
        isActive: true,
        isAdmin: true,
      },
    });

    if (user && user.isActive) {
      return { prisma, user };
    }
  } catch (err) {
    // Return empty user on authentication failure; specific resolvers will handle unauthorized requests
  }
  return { prisma };
};

const setupGraphQL = async (app) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production',
  });

  await server.start();

  // Serve static files for GraphiQL
  app.use('/public', express.static(path.join(__dirname, '../../public')));

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: getContext,
    })
  );

  // Render GraphiQL interface locally without relying on external sandbox CDN
  app.get('/graphiql', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Jaxmart GraphQL Playground</title>
        <link rel="stylesheet" href="/public/graphiql/graphiql.min.css" />
        <style>
          body {
            height: 100vh;
            margin: 0;
            overflow: hidden;
          }
          #graphiql {
            height: 100vh;
          }
        </style>
      </head>
      <body>
        <div id="graphiql">Loading...</div>
        <script src="/public/graphiql/react.production.min.js"></script>
        <script src="/public/graphiql/react-dom.production.min.js"></script>
        <script src="/public/graphiql/graphiql.min.js"></script>
        <script src="/public/graphiql/init.js"></script>
      </body>
      </html>
    `);
  });

  console.log('GraphQL server successfully initialized at /graphql');
  console.log('Local offline GraphQL Playground ready at http://localhost:4000/graphiql');
};

module.exports = { setupGraphQL };
