const { Boom } = require("@hapi/boom");
const {
  DisconnectReason,
  useMultiFileAuthState,
  makeWASocket,
  Browsers,
} = require("@whiskeysockets/baileys");
const { log } = require("console");
const { readFileSync } = require("fs");

let sock = null; // Variável global para armazenar o socket
let state = null; // Variável global para o estado de autenticação
let saveCreds = null; // Variável global para a função de salvar credenciais

// Função para inicializar o estado de autenticação e conectar
const connect = async () => {
  const authState = await useMultiFileAuthState("auth_info_baileys");
  state = authState.state; // Salva o estado de autenticação
  saveCreds = authState.saveCreds; // Salva a função de salvar credenciais

  // Conecta usando o estado de autenticação fornecido
  sock = makeWASocket({
    auth: state, // Usa o estado armazenado
    printQRInTerminal: true,
    browser: Browsers.windows("Desktop"),
  });

  // Escuta eventos de conexão
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error instanceof Boom &&
        lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut;

      // console.log(
      //   "Conexão fechada devido a",
      //   lastDisconnect.error,
      //   ", reconectando:",
      //   shouldReconnect
      // );

      // Reconectar se não estiver desconectado (logged out)
      if (shouldReconnect) {
        connect(); // Rechama a função connect para reconectar
      }
    } else if (connection === "open") {
      console.log("Conexão estabelecida");
    }
  });

  // Atualiza as credenciais sempre que houver uma mudança
  sock.ev.on("creds.update", saveCreds);
};

// Função para enviar mensagens
const sendBailey = async (number, message) => {
  // Verifica se o socket está conectado
  if (!sock) {
    console.log("A conexão não foi estabelecida ainda.");
    throw new Error("A conexão não foi estabelecida ainda.");
  }

  let listImg = [
    "c:/coder.mattoso/zapbo/src/assets/aforja.jpeg",
    "c:/coder.mattoso/zapbo/src/assets/ocorvo.png",
    "c:/coder.mattoso/zapbo/src/assets/omaniaco.PNG",
    "c:/coder.mattoso/zapbo/src/assets/opoco.jpeg",
    "c:/coder.mattoso/zapbo/src/assets/malvadofavorito.PNG",
    "c:/coder.mattoso/zapbo/src/assets/venon3.PNG",
  ];
  let img = listImg[Math.floor(Math.random() * listImg.length)];

  const buffer = readFileSync("c:/coder.mattoso/zapbo/src/assets/trailer.mp4");

  try {
    // Envia a mensagem após a conexão ser estabelecida
    await sock.sendMessage(`${number}@s.whatsapp.net`, {
      video: buffer,
      caption: message,
      gifPlayback: true
    });
  } catch (error) {
    console.log("Erro ao enviar a mensagem:", error);
    throw error;
  }
};

const sendAdm = async (message, numero) => {
  // Verifica se o socket está conectado
  if (!sock) {
    console.log("A conexão não foi estabelecida ainda.");
    throw new Error("A conexão não foi estabelecida ainda.");
  }

  try {
    // Envia a mensagem após a conexão ser estabelecida
    await sock.sendMessage(`${numero}@s.whatsapp.net`, {
      text: message,
    });
  } catch (error) {
    console.log("Erro ao enviar a mensagem:", error);
    throw error;
  }
};

// Exporta as funções
module.exports = {
  connect,
  sendBailey,
  sendAdm,
};
