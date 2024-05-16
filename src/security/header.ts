import { createMiddleware } from 'hono/factory'
import "dotenv/config";

export const auth = createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization");
    const ifAuth = process.env.SECRET_HEADER === authHeader;
    
    if ('GET' === c.req.path || ('POST' === c.req.method && c.req.path.includes('/search')) || ifAuth) {
        return await next();
    } else {
        c.status(401);
        return c.body('nuh uh'); 
    }
})