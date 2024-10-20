const prisma = require("../config/prisma.cliente");

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
}

module.exports = MessageService;
