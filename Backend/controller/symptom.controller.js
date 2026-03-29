import Symptom from "../models/symptom.model.js";

export async function addSymptom(req, res) {
    try {
        const { date, selectedSymptoms, severity, notes } = req.body;
        const newEntry = new Symptom({
            userId: req.user.id,
            date,
            selectedSymptoms,
            severity,
            notes
        });
        await newEntry.save();
        res.status(201).json({ message: "Symptom entry saved successfully", entry: newEntry });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message });
    }
}

export async function getSymptoms(req, res) {
    try {
        const symptoms = await Symptom.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(symptoms);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message });
    }
}

export async function deleteSymptom(req, res) {
    try {
        const { id } = req.params;
        const deletedEntry = await Symptom.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!deletedEntry) {
            return res.status(404).json({ message: "Symptom entry not found or unauthorized" });
        }
        res.json({ message: "Symptom entry deleted successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message });
    }
}
