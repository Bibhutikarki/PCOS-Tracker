import jwt from 'jsonwebtoken';

export function checkToken(req, res, next)
{
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).send('Token not found');

    try{
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data;
        next();

    }
    catch(e)
    {
        res.status(401).json(e);
    }
}