import { Schema, model } from "mongoose";

const symptomSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    selectedSymptoms: [{
        type: String
    }],
    severity: {
        type: Map,
        of: Number
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Symptom = model('Symptom', symptomSchema);
export default Symptom;
