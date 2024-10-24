const prisma = require("../config/prisma.cliente");
const { sendBailey } = require("../config/baileys.client");

class MessageService {
  constructor() {
    this.startHour = 9; // Hora de início (9h da manhã, por exemplo)
    this.endHour = 21; // Hora de término (21h, por exemplo)
    this.delay = 4 * 60 * 1000; // 4 minutos em milissegundos (240000 ms)
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
    const contact = await this.getNumbers();

    return await sendBailey("5511992767398", mensagem);
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

    // [
    //   { number: "5511992767398", id: 1 },
    //   { number: "5511992767398", id: 2 },
    //   { number: "5511992767398", id: 3 },
    // ];
    const contatos = (await this.getNumbers()).filter(
      (objeto) => objeto.status === "PENDENTE"
    );
    const msg =
      "🎉 Descubra o CINEFLICK por apenas R$19,90/mês! 🎬 Mergulhe em um mundo de entretenimento com mais de 60.000 conteúdos em qualidade SD, HD, FHD e 4K! 📺✨ Com nosso guia de programação (EPG), você nunca perde seu programa favorito. Assista onde quiser: no seu smartphone, tablet, TV Box, Chromecast, Smart TV ou computador! Pacote completo de filmes e séries te espera! Não fique de fora, venha assistir ao que há de melhor!                                                                                                 Responda *Eu quero* se quiser *instalação gratuita e acesso teste* ";

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
          })
          .catch((error) => {
            console.log("Erro ao enviar mensagem:", error);
          });

        // Espera 4 minutos antes de enviar a próxima mensagem
        await new Promise((resolve) => setTimeout(resolve, this.delay));

        if (!this.isWithinSchedule()) {
          console.log("pausando envios por hoje...");
          break;
        }
      }

      break;
    }
  }
}

module.exports = MessageService;
