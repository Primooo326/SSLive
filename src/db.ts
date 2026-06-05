import mongoose, { Schema, Document } from "mongoose";

export interface IDomain extends Document {
  domain: string;
  addedAt: Date;
  days: number | null;
  expires: string | null;
  status: "OK" | "WARNING" | "CRITICAL" | "EXPIRED" | "ERROR" | "PENDING";
  detail: string;
  lastChecked: Date | null;
}

const DomainSchema = new Schema<IDomain>({
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  days: {
    type: Number,
    default: null,
  },
  expires: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["OK", "WARNING", "CRITICAL", "EXPIRED", "ERROR", "PENDING"],
    default: "PENDING",
  },
  detail: {
    type: String,
    default: "",
  },
  lastChecked: {
    type: Date,
    default: null,
  },
});

export const Domain = mongoose.model<IDomain>("Domain", DomainSchema);

export async function connectToDb(uri: string): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[INFO] Connected to MongoDB database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("[ERROR] Failed to connect to MongoDB:", error);
    throw error;
  }
}
