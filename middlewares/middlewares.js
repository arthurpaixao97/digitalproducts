const Session = require('../db/schemas/sessions.js')

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

  async session_auth(req, res, next)
  {
    if(req)
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
  }

  admin(req, res, next)
  {
    if(req.headers['x-role'] == 'ADMIN')
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
  
  async refreshSessions(req, res, next)
  {
    await Session.deleteMany({expires: {$lte: new Date()}})
    next()
  }
}
  
module.exports = new MW();