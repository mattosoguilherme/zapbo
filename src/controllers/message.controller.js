const MessageService = require("../services/message.service");
const messageService = new MessageService();

class MessageController {
  async addNumber(req, res) {
    const { numbers } = req.body;
    const listNumbers = [];

    try {
      await Promise.all(
        numbers.map(async (n) => {
          const existingContact = await messageService.addNumber(n);

          listNumbers.push(existingContact);
        })
      );
      res.status(201).json({
        message: "Números adicionados com sucesso",
        numbersAdded: listNumbers,
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao adicionar números", error });
    }
  }

  async getNumbers(req, res) {
    const numbers = await messageService.getNumbers();

    res.status(200).send(numbers);
  }

  async sendMessage(req, res) {
    const { message } = req.body;

    try {
      await messageService.send(message);

      res.status(200).json({ message: "Mensagem enviada com sucesso" });
    } catch (error) {
      console.log("Erro ao enviar mensagem:", error);

      res.status(500).json({ message: "Erro ao enviar mensagem", error });
    }
  }

  async sendToMany(req, res) {
    console.log("chegou no controller");

    try {
      await messageService.sendToMany();

      res
        .status(200)
        .json({
          message: "Mensagens enviadas com sucesso. messagem do controler",
        });
    } catch (error) {
      console.log("Erro ao enviar mensagem:", error);

      res.status(500).json({ message: "Erro ao enviar mensagem", error });
    }
  }
}

module.exports = MessageController;
