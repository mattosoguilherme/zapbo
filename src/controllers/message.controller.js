const { log } = require("console");
const MessageService = require("../services/message.service");
const messageService = new MessageService();
const fs = require("fs");

class MessageController {
  async addNumber(req, res) {
    fs.readFile(
      "c:/coder.mattoso/zapbo/temps/voucher.json",
      "utf8",
      async (err, data) => {
        let listNumbers = [];

        if (err) {
          throw new Error(`Erro ao ler arquivo: ${err}`);
        }

        const numeros = JSON.parse(data);

        await Promise.all(
          numeros.map(async (objetoContato) => {
            const n = objetoContato.phone_number.replace("+", "");

            const existingContact = await messageService.addNumber(n);

            listNumbers.push(existingContact);
          })
        )
          .then(() => {
            res.status(201).json({
              message: `${listNumbers.length} números adicionados com sucesso`,
              numbersAdded: listNumbers,
            });
          })
          .catch((error) => {
            res
              .status(500)
              .json({ message: "Erro ao adicionar números", error });
          });
      }
    );

    // const { numbers } = req.body;
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
    await messageService
      .sendToMany()
      .then(() => {
        res.status(200).json({
          message: "Mensagens enviadas com sucesso. messagem do controler",
        });
      })
      .catch((error) => {
        res.status(500).json({ message: "do controller...Erro ao enviar mensagem", error });
      });
  }
}

module.exports = MessageController;
