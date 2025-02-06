const prisma = require("../config/prisma.cliente");
const { sendBailey, sendAdm } = require("../config/baileys.client");
const fs = require("fs");
const path = require("path");

class MessageService {
  constructor() {
    this.startHour = 7; // Hora de início (9h da manhã, por exemplo)
    this.endHour = 21; // Hora de término (21h, por exemplo)
    this.delay = 3 * 60 * 1000; // 2 minutos em milissegundos (240000 ms)
  }

  async generateDailyReport(date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Início do dia
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999); // Fim do dia

    const totalMessages = await prisma.messageLog.count({
      where: {
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const relatorio = {
      date: startDate.toISOString().split("T")[0], // Formato YYYY-MM-DD
      totalMessages: totalMessages,
    };

    await sendAdm(
      `Sr. Mattoso,\n\nsegue o relatório do dia *${relatorio.date}*:\n\n*${relatorio.totalMessages}* mensagens enviadas.`
    );
  }

  async relatoriofimdodia() {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Início do dia
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // Fim do dia

    const totalMessages = await prisma.messageLog.count({
      where: {
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    await sendAdm(
      `Sr. Mattoso, boa noite\n\nFim do espediente.\n\nsegue o relatório do dia:\n\n*${totalMessages}* mensagens enviadas.\n\nAté amanhã!`
    );
  }

  async addNumber(number) {
    const existingContact = await prisma.contact.findUnique({
      where: { number: number },
    });

    if (existingContact) {
      console.error(`numero ${number} já cadastrado`);
      throw new Error(`numero ${number} já cadastrado`);
    }

    return await prisma.contact.create({ data: { number } });
  }

  async getNumbers() {
    return await prisma.contact.findMany();
  }

  async send(mensagem) {
    const tabelaProdutos = " PEDIDOS:\n\nQTD 02 BOLINHO - R$ 20,00\nQTD 02 COPINHO DA FELICIDADE - R$ 24,00\nQTD 02 CX SURPRESA DE UVA - R$ 12,00\nQTD 02 TRUFA - R$ 12,00\n\n*Total: R$ 68,00*"
    await sendAdm(tabelaProdutos);
  }

  // Função para verificar se estamos dentro do horário permitido
  isWithinSchedule() {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= this.startHour && currentHour <= this.endHour;
  }

  async sendToMany() {
    // // Espera até o horário de início para começar
    // await this.waitUntilStartHour();

    const teste = [
      { number: "5511992767398", id: 1 },
      { number: "5511992767398", id: 2 },
      { number: "5511992767398", id: 3 },
    ];

    const contatos = (await this.getNumbers()).filter(
      (objeto) => objeto.status === "PENDENTE" || objeto.status === "PEDDING"
    );

    const msg =
      "🎬 *Últimas Vagas para o CINEFLICK!* 🎉\n*Atenção! Poucas vagas restantes para o plano trimestral por apenas R$39,90/mês* — menos do que uma pizza! 🍕🔥 Aproveite essa oportunidade única de acessar um mundo de entretenimento com mais de **60.000 conteúdos em *até 4K*!\n🚀 **Assista aos lançamentos direto do cinema no conforto da sua casa** e tenha sempre algo novo com atualizações constantes! Assista no seu smartphone, tablet, TV Box, Chromecast, Smart TV ou computador, com séries, filmes e muito mais, tudo em um só lugar!\n💥 *Responda “Eu quero” agora para garantir sua instalação gratuita* e um teste exclusivo! Mas seja rápido: as vagas são limitadas, e essa oferta especial está quase acabando!";

    while (true) {
      if (!this.isWithinSchedule()) {
        console.log("Fora do horário permitido.");

        await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000)); // Espera 5min e tenta novamente;
        continue; // Volta ao início do loop para verificar o horário novamente
      }

      console.log("Enviando mensagens...");

      for (let contato of contatos) {
        await sendBailey(contato.number, msg)
          .then(async () => {
            console.log(
              `Mensagem enviada para ${
                contato.number
              } às ${new Date().toLocaleTimeString()}`
            );

            await prisma.contact.update({
              where: { id: contato.id },
              data: { status: "ENVIADO" },
            });
            await prisma.messageLog.create({
              data: {
                contactId: contato.id,
                message: ` Mensagem enviada para ${
                  contato.number
                } às ${new Date().toLocaleTimeString()} corretamente`,
              },
            });
          })
          .catch((error) => {
            console.log("Erro ao enviar mensagem:", error);
          });

        // Espera 2 minutos antes de enviar a próxima mensagem
        await new Promise((resolve) => setTimeout(resolve, this.delay));

        if (!this.isWithinSchedule()) {
          console.log("por hoje deu...");
          await this.relatoriofimdodia();
          break;
        }
      }

      break;
    }
  }

  countFilesInDirectory(directoryPath) {
    try {
      // Lê o diretório de forma síncrona e filtra apenas arquivos
      const files = fs.readdirSync(directoryPath);
      const fileCount = files.filter((file) => {
        const filePath = path.join(directoryPath, file);
        return fs.lstatSync(filePath).isFile();
      }).length;

      console.log(
        `Número de arquivos na pasta '${directoryPath}': ${fileCount}`
      );
      return fileCount;
    } catch (err) {
      console.error(`Erro ao ler o diretório: ${err.message}`);
      return 0; // Retorna 0 em caso de erro
    }
  }
}

module.exports = MessageService;
