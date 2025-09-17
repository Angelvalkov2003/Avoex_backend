import express from "express";

const app = express();

app.get("/api/notes", (req, res) => {
  res.status(200).send("you got 512 notes");
});

app.post("/api/notes", (req, res) => {
  res.status(201).json({ message: "post created successfully" });
});

app.put("/api/notes/:id", (req, res) => {
  res.status(201).json({ message: "post updated successfully" });
});

app.listen(5001, () => {
  console.log("server started 5001");
});
