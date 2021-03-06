const fs = require('fs');
const cors = require('koa2-cors');
const bodyparser = require('koa-bodyparser');
const bouncer = require('koa-bouncer');
const koaStatic = require('koa-static');
const { v4: uuidv4 } = require('uuid');
const response = require('./utils/response');
const log4js = require('./utils/logger');

const responseHandler = async (ctx, next) => {
  ctx.success = function(...args) {
    return response.success(ctx, ...args);
  };
  ctx.error = function(...args) {
    return response.error(ctx, ...args);
  };
  return await next();
};

const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    response.unCaughtError(ctx, err);
  }
};

const corsHandler = cors({
  origin: ctx => {
    return ctx.request.header.origin;
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization', 'Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS']
});

const logHandler = async (ctx, next) => {
  const logger = log4js.getLogger(process.env.LOGGER);
  ctx.logger = {
    info: data => {
      logger.info({ data, traceId: ctx.state.traceId });
    },
    warn: data => {
      logger.warn({ data, traceId: ctx.state.traceId });
    },
    error: data => {
      logger.error({ data, traceId: ctx.state.traceId });
    }
  };
  ctx.logger.info({
    type: 'IN',
    method: ctx.request.method,
    url: ctx.request.url,
    header: ctx.request.header,
    query: ctx.request.query,
    body: ctx.request.body
  });
  await next();
  ctx.logger.info({
    type: 'OUT',
    status: ctx.response.status,
    message: ctx.response.message,
    body: ctx.body
  });
};

const staticHandler = () => {
  const staticDir = `${process.cwd()}/${process.env.STATIC_DIR || 'static'}`;
  try {
    fs.accessSync(staticDir, fs.F_OK);
    return koaStatic(staticDir);
  } catch (_) {
    return async (ctx, next) => {
      await next();
    };
  }
};

const traceId = async (ctx, next) => {
  ctx.state.traceId = uuidv4();
  await next();
};

module.exports = (app) => {
  app
    .use(bodyparser({ enableTypes: ['json', 'form', 'text']}))
    .use(responseHandler)
    .use(errorHandler)
    .use(corsHandler)
    .use(bouncer.middleware())
    .use(traceId)
    .use(logHandler)
    .use(staticHandler());

  // 应用级中间件
  if (Array.isArray(app.config.cfg.middlewares)) {
    app.config.cfg.middlewares.forEach(middleware => app.use(app.middlewares[middleware]));
  }
};