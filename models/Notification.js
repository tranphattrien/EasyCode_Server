const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["like", "comment", "reply"],
      required: true
    },
    blog: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "blogs"
    },
    notification_for: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users"
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users"
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "comments"
    },
    reply: {
      type: Schema.Types.ObjectId,
      ref: "comments"
    },
    replied_on_comment: {
      type: Schema.Types.ObjectId,
      ref: "comments"
    },
    seen: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("notification", notificationSchema);
