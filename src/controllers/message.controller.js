const MessageService = require("../services/message.service");
const messageService = new MessageService();
const fs = require("fs");
const path = require("path");

class MessageController {
  async addNumber(req, res) {
    try {
      const diretoryPath = "c:/coder.mattoso/zapbo/temps/";
      const n_voltas = messageService.countFilesInDirectory(diretoryPath); // Defina o número de voltas
      let list_numbers = [];
      
      

      for (let i = 1; i <= n_voltas; i++) {
        const file_path = path.join(diretoryPath, `grupo (${i}).json`);

        if (!fs.existsSync(file_path))
          throw new Error(`Arquivo não encontrado: ${file_path}`);

        const contatos = JSON.parse(fs.readFileSync(file_path, "utf-8"));

      

        await Promise.all(
          contatos.map(async (c) => {
            const numeroFormatado = c.phone_number.replace("+", "");
            const numeroExistente = await messageService.addNumber(
              numeroFormatado
            );
            list_numbers.push(numeroExistente);
          })
        );
      }

      res.status(200).json({
        message: `${list_numbers.length} números adicionados com sucesso`,
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
    const { message, numero } = req.body;

    await messageService
      .send(message)
      .then(() => {
        res.status(200).json({ message: "Mensagem enviada com sucesso" });
      })
      .catch((error) => {
        res.status(500).json({ message: "Erro ao enviar mensagem", error });
      });
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
        res
          .status(500)
          .json({ message: "do controller...Erro ao enviar mensagem", error });
      });
  }

  async dailyReport(req, res) {
    const { mes, dia, ano } = req.body;

    const data = new Date(ano, mes - 1, dia);

    await messageService
      .generateDailyReport(data)
      .then(() =>
        res.status(200).json({ message: "Relatório gerado com sucesso" })
      )
      .catch((error) => {
        res.status(500).json({ message: "Erro ao gerar relatório", error });
      });
  }
}

module.exports = MessageController;
