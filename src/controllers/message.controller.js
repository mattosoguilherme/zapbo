const MessageService = require("../services/message.service");
const messageService = new MessageService();

class MessageController {
  async addNumber(req, res) {
    const { number } = req.body;
    await messageService
      .addNumber(number)
      .then(() => {
        res.status(200).send({ message: "Número adicionado" });
      })
      .catch((error) => {
        res.status(500).send({ message: `Erro no servidor: ${error}` });
      });
  }

  async getNumbers(req, res) {
    const numbers = await messageService.getNumbers();

    res.status(200).send(numbers);
  }
}

module.exports = MessageController;
