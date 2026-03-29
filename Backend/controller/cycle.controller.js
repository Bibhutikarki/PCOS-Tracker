import Cycle from "../models/cycle.model.js";

export async function getCycles(req, res) {
    try {
        const cycles = await Cycle.find({ userId: req.user.id }).sort({ startDate: -1 });
        res.json(cycles);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message });
    }
}

export async function addCycle(req, res) {
    try {
        const { startDate, endDate } = req.body;
        const newCycle = new Cycle({
            userId: req.user.id,
            startDate,
            endDate
        });
        await newCycle.save();
        res.status(201).json({ message: "Cycle added successfully", cycle: newCycle });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message });
    }
}

export async function updateCycle(req, res) {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const updatedCycle = await Cycle.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            { startDate, endDate },
            { new: true }
        );

        if (!updatedCycle) {
            return res.status(404).json({ message: "Cycle not found or unauthorized" });
        }

        res.json({ message: "Cycle updated successfully", cycle: updatedCycle });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message });
    }
}

export async function deleteCycle(req, res) {
    try {
        const { id } = req.params;
        const deletedCycle = await Cycle.findOneAndDelete({ _id: id, userId: req.user.id });

        if (!deletedCycle) {
            return res.status(404).json({ message: "Cycle not found or unauthorized" });
        }

        res.json({ message: "Cycle deleted successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message });
    }
}
