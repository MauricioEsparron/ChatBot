import whatsappService from "./whatsappService.js";

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === "text") {
      const incomingMessage = message.text.body.toLowerCase().trim();
      const userId = message.from;

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(userId, message.id, senderInfo);
        await this.sendWelcomeMenu(userId);
      } else if (this.isGoodBye(incomingMessage)) {
        await this.sendGoodbyeMessage(userId, message.id, senderInfo);
      } else if (incomingMessage === "media") {
        await this.sendTypeMedia(userId);
      }
    } else if (message?.type === "interactive") {
      const option = this.cleanText(message?.interactive?.button_reply?.title);
      await this.handleMenuOption(message.from, option);
      await whatsappService.markAsRead(message.id);
    }
  }

  isGreeting(message) {
    return ["hola", "hello", "hi", "buenas", "buenas tardes"].some((greet) =>
      message.includes(greet)
    );
  }

  isGoodBye(message) {
    return ["adios", "bye", "good bye", "hasta luego", "hasta pronto"].some(
      (greet) => message.includes(greet)
    );
  }

  getSenderName(senderInfo) {
    return senderInfo?.profile?.name || senderInfo?.wa_id || "Cliente";
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const welcomeMessage = `Hola ${name}, Bienvenido al chatbot. Cambiamos realidades, creamos futuro. ¿En qué puedo ayudarte hoy?`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendGoodbyeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const goodByeMessage = `Ha sido un placer ayudarte ${name}, recuerda que puedes volver cuando nos necesites.`;
    await whatsappService.sendMessage(to, goodByeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    await whatsappService.sendInteractiveButtons(to, "Elige una opción:", [
      { type: "reply", reply: { id: "option_1", title: "📅 Agendar" } },
      { type: "reply", reply: { id: "option_2", title: "📄 Consultar" } },
      { type: "reply", reply: { id: "option_3", title: "📍 Ubicación" } },
    ]);
  }

  async sendTypeMedia(to) {
    await whatsappService.sendInteractiveButtons(
      to,
      "Elige un tipo de archivo:",
      [
        { type: "reply", reply: { id: "video_option", title: "📹 Video" } },
        { type: "reply", reply: { id: "audio_option", title: "🎵 Audio" } },
        {
          type: "reply",
          reply: { id: "document_option", title: "📄 Documento" },
        },
      ]
    );
  }

  // Maneja las opciones seleccionadas desde botones interactivos
  async handleMenuOption(to, option) {
    let response;
    switch (option) {
      case "Agendar":
        response = "📅 Para agendar una cita, elige una opción";
        break;
      case "Consultar":
        response = "📄¿Sobre qué te gustaría consultar?";
        break;
      case "Ubicación":
        response = "📍 Nuestra tienda está ubicada en [dirección aquí].";
        break;
      default:
        response =
          "Lo siento, no entendí tu selección. Por favor, elige una de las opciones del menú.";
    }
    await whatsappService.sendMessage(to, response);
  }

  // Limpia el texto eliminando caracteres especiales
  cleanText(text) {
    return text.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s]/g, "").trim();
  }
}

export default new MessageHandler();
