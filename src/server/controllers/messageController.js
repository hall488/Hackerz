const Message = require("../models/message");

exports.messages = async () => {
  const allMessages = await Message.find().exec();
  return allMessages;
};

// exports.messages = return new Promise((resolve, reject) => {})

// Handle Genre create on POST.
exports.sendMessage = async ({ message, user, date }) => {
  const newMessage = new Message({
    message: message,
    user: user,
    date: date,
  });

  await newMessage.save();

  return;
};
