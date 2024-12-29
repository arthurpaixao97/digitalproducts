require('dotenv').config()
const bcrypt = require('bcrypt')
const Session = require('../db/schemas/sessions.js')
const User = require('../db/schemas/users.js')
const Role = require('../db/schemas/roles.js')
const u = require('../utils/utils.js')

class MW
{
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

  async session_auth(req, res, next)
  {
    const token = req.headers.authorization
    const session = await Session.findOne({token: token, expires: {$gte: new Date().toISOString()}})
    if(session)
    {
      req.headers['x-role'] = session.role
      req.headers['x-user'] = session.user
      next()
    } else
    {
      res.status(401).send({
        status:401,
        message:'Token inválido'
      })
    }
  }

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

  async refreshSessions(req, res, next)
  {
    await Session.deleteMany({expires: {$lte: new Date()}})
    next()
  }
}
  
module.exports = new MW();