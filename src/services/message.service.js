const prisma = require("../config/prisma.cliente");
const { sendBailey, sendAdm, sendTest } = require("../config/baileys.client");

class MessageService {
  constructor() {
    this.startHour = 7; // Hora de início (9h da manhã, por exemplo)
    this.endHour = 21; // Hora de término (21h, por exemplo)
    this.delay = 4 * 60 * 1000; // 4 minutos em milissegundos (240000 ms)
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
    await sendTest();
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

    const tteste = [
      { number: "5511992767398", id: 1 },
      { number: "5511992767398", id: 2 },
      { number: "5511992767398", id: 3 },
    ];

    const contatos = (await this.getNumbers()).filter(
      (objeto) => objeto.status === "PENDENTE"
    );

    const msg =
      "🎉 Conheça o CINEFLICK: entretenimento sem limites por apenas R$19,90/mês! 🎬\nAcesse mais de 60.000 conteúdos de qualidade em SD, HD, FHD e 4K! 📺✨ Com atualizações constantes, você sempre encontra as últimas novidades — incluindo filmes recém-saídos do cinema direto para o CINEFLICK!\nAssista onde e como quiser: no seu smartphone, tablet, TV Box, Chromecast, Smart TV ou computador! Aproveite um catálogo completo de filmes, séries e muito mais em um só lugar.\n💥 Responda “Eu quero” agora para garantir instalação gratuita e acesso teste!";

    while (true) {
      if (!this.isWithinSchedule()) {
        console.log("Fora do horário permitido.");

        await new Promise((resolve) => setTimeout(resolve, 1 * 60 * 1000)); // Espera 5min e tenta novamente;
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

        // Espera 4 minutos antes de enviar a próxima mensagem
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
}

module.exports = MessageService;
