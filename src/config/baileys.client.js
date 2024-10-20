const makeWASocket = require("@whiskeysockets/baileys").makeWASocket;
const { DisconnectReason } = require("@whiskeysockets/baileys/Constants");
const Boom = require("@hapi/boom");

let sock;

const connectToWhatsApp = () => {
  sock = makeWASocket({
    printQRInTerminal: true, // Imprime o QR Code no terminal para escaneamento
  });

  // Evento de atualização de conexão
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect.error instanceof Boom
          ? lastDisconnect.error?.output?.statusCode
          : 0) !== DisconnectReason.loggedOut;
      console.log(
        "Conexão fechada devido a",
        lastDisconnect.error,
        ", reconectando:",
        shouldReconnect
      );

      // Reconectar se não estiver deslogado
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("Conexão aberta");
    }
  });

  // Evento de recebimento de mensagens
  sock.ev.on("messages.upsert", async (m) => {
    console.log(m);

    const message = m.messages[0];
    console.log("Mensagem recebida:", JSON.stringify(message, null, 2));

    // Responder automaticamente às mensagens recebidas (ajuste conforme necessário)
    if (message.key.fromMe === false && message.key.remoteJid) {
      try {
        console.log("Respondendo a", message.key.remoteJid);
        await sock.sendMessage(message.key.remoteJid, { text: "Hello there!" });
      } catch (err) {
        console.error("Erro ao responder mensagem:", err);
      }
    }
  });

  return sock;
};

export default connectToWhatsApp;
