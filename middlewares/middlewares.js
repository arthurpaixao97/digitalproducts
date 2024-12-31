require('dotenv').config()
const bcrypt = require('bcrypt')
const Session = require('../db/schemas/sessions.js')
const User = require('../db/schemas/users.js')
const Role = require('../db/schemas/roles.js')
const u = require('../utils/utils.js')

class MW
{
  // Middleware to authenticate user using cookies
  cookie_auth(req, res, next) {
    if(req)
    {
      const cookie = req.cookies.session_token;
      if (!cookie) {
        res.status(401).send({
          status: 401,
          message: 'Usuário não autenticado'
        });
      } else {
        next();
      }
    }
  }

  // Middleware to authenticate root users using a secret
  root_auth(secret){
    return function(req, res, next)
    {
      const hash_secret = bcrypt.hashSync(secret, 10)
      if(req.headers.authorization != undefined && bcrypt.compareSync(req.headers.authorization, hash_secret))
      {
        next()
      } else
      {
        res.status(401).send({
          status:401,
          message:'Unauthorized'
        })
      }
    }
  }

  // Middleware to authenticate users based on session tokens
  async session_auth(req, res, next)
  {
    const token = req.headers.authorization
    const session = await Session.findOne({token: token, expires: {$gte: new Date().toISOString()}})
    if(session)
    {
      req.headers['x-role'] = session.role // Attach role to request headers
      req.headers['x-user'] = session.user // Attach user ID to request headers
      next()
    } else
    {
      res.status(401).send({
        status:401,
        message:'Token inválido'
      })
    }
  }

  // Middleware to enforce role-based permissions
  rolePermissions(rolename)
  {
    return async function(req, res, next)
    {
      const role = await Role.findOne({name: rolename})
      if(u.checkPermission(req, role.permissions))
      {
        next()
      } else
      {
        res.status(403).send({
          status:403,
          message:'Credenciais sem permissão'
        })
      }
    }
  }

  // Middleware to enforce specific permissions
  permissions(permissions)
  {
    return async function(req, res, next)
    {
      if(u.checkPermission(req, permissions))
      {
        next()
      } else
      {
        res.status(403).send({
          status:403,
          message:'Credenciais sem permissão'
        })
      }
    }
  }

  // Middleware to clean up expired sessions
  async refreshSessions(req, res, next)
  {
    await Session.deleteMany({expires: {$lte: new Date()}})
    next()
  }
}
  
module.exports = new MW();