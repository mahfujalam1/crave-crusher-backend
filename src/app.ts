import express, { Request, Response } from "express";
import cors from "cors";
import notFound from "./app/middleware/notFoundRoute";
import router from "./app/routes";
import errorMiddleware from "./app/middleware/globalErrorHandler";
const app = express();

app.use(express.json());
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(
  cors(corsOptions)
);

app.use("/api/v1", router);

const test = async (req: Request, res: Response) => {
  res.send({ message: "Crave Crusher server is running" });
};

app.get("/", test);

// not found route
app.use(errorMiddleware)
app.use(notFound);
app.use(errorMiddleware);
export default app;
