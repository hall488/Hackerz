const Message = require("../models/message");

exports.messages = async () => {
  const allMessages = await Message.find().exec();
  return allMessages;
};

exports.sendMessage = async ({ message, user, date }) => {
  const newMessage = new Message({
    message: message,
    user: user,
    date: date,
  });

  await newMessage.save();

  return;
};
