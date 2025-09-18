import Note from "../models/Note.js";

export async function getAllNotes(req, res) {
  try {
    const notes = await Note.find();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
}

export async function getNoteById(req, res) {
  try {
    const note = await Note.findById(req.params.id);
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
}

export async function createNote(req, res) {
  try {
    const { title, content, email, phone } = req.body;
    const newNote = new Note({ title, content, email, phone });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: "failed!" });
  }
}

export async function updateNote(req, res) {
  try {
    const { title, content, email, phone } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        email,
        phone,
      },
      {
        new: true,
      }
    );

    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: "failed!" });
  }
}

export async function deleteNote(req, res) {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);

    res.status(200).json(deletedNote);
  } catch (error) {
    res.status(500).json({ message: "failed!" });
  }
}
