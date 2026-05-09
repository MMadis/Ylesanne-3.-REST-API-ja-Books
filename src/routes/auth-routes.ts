import { FastifyInstance } from "fastify";

/**
 * Authentication routes.
 * Currently provides a simple `POST /api/auth/login` that returns a signed JWT.
 * TODO: replace with real authentication logic.
 */
export async function authRoutes(app: FastifyInstance): Promise<void> {
	app.post("/api/auth/login", async (request, reply) => {
		try {
			const payload = (request.body as any) || {};
			const user = payload.user ?? payload.username ?? "admin";
			const token = app.jwt.sign({ user });
			return { token };
		} catch (err) {
			reply.status(500).send({ error: "Failed to create token", details: [] });
		}
	});
}
