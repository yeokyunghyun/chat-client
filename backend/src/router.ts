import { Router } from "express";

const router = Router();

router.get("/hello", (req, res) => {
  res.json({ message: "hello client!" });
});

export default router;