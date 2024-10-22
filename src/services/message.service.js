const prisma = require("../config/prisma.cliente");
const { sendBailey } = require("../config/baileys.client");

class MessageService {
  async addNumber(number) {
    const existingContact = await prisma.contact.findUnique({
      where: { number: number },
    });

    if (existingContact) {
      throw new Error("Number already exists");
    }

    return await prisma.contact.create({ data: { number } });
  }

  async getNumbers() {
    return await prisma.contact.findMany();
  }

  async send(mensagem) {
    const contact = await this.getNumbers();

    return await sendBailey(contact[0].number, mensagem);
  }

  async sendToMany() {
    const contatos = await this.getNumbers();

    const msg =
      "🎉 Descubra o CINEFLICK por apenas R$19,90/mês! 🎬 Mergulhe em um mundo de entretenimento com mais de 60.000 conteúdos em qualidade SD, HD, FHD e 4K! 📺✨ Com nosso guia de programação (EPG), você nunca perde seu programa favorito. Assista onde quiser: no seu smartphone, tablet, TV Box, Chromecast, Smart TV ou computador! Pacote completo de filmes e séries te espera! Não fique de fora, venha assistir ao que há de melhor!";

    contatos.map(async (contato) => {
      const { status } = await prisma.contact.findUnique({
        where: { id: contato.id },
      });

      if (status === "PENDENTE") {
        await sendBailey(contato.number, msg).then(async () => {
          await prisma.contact.update({
            where: { id: contato.id },
            data: { status: "ENVIADO" },
          });
          console.log(`Mensagem enviada para ${contato.number}`);
        });
      }
    });
  }
}

module.exports = MessageService;
