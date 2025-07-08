import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: [true, "Course title is required"],  // Ensures courseTitle is never null
      validate: {
        validator: function (value) {
          return value && value.trim().length > 0;  // Ensures it's not empty or just whitespace
        },
        message: "Course title cannot be empty or just whitespace.",
      },
    },
    subTitle: { type: String },
    description: { type: String },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    courseLevel: {
      type: String,
      enum: ['Beginner', 'Medium', 'Advanced'],
    },
    coursePrice: { type: Number },
    courseThumbnail: { type: String },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Define the unique index here (only once)
courseSchema.index({ courseTitle: 1 }, { unique: true });

export const Course = mongoose.model("Course", courseSchema);
