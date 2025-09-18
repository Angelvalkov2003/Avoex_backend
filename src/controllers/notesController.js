export function getAllNotes(req, res) {
  res.status(200).send("data fetched");
}

export function createNote(req, res) {
  res.status(201).json({ message: "create the notes" });
}

export function updateNote(req, res) {
  res.status(200).json({ message: "update the notes" });
}

export function deleteNote(req, res) {
  res.status(200).json({ message: "delete the notes" });
}
