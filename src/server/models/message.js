const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  message: { type: String, required: true, maxLength: 256 },
  user: { type: String, required: true, maxLength: 24 },
  date: { type: Date },
});

MessageSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_FULL);
});

module.exports = mongoose.model("Message", MessageSchema);
